import { EventEmitter } from 'events'
import {
  ProcessingJob,
  ProcessingProgress,
  ProcessingResult,
  ProcessingContext,
  BatchProcessingConfig,
  ValidationError,
  ValidationWarning,
  CircuitBreakerState,
  WorkerMessage,
  BatchResult
} from '../types'

export class ProcessingEngine extends EventEmitter {
  private jobs = new Map<string, ProcessingJob>()
  private workers = new Map<string, Worker>()
  private circuitBreaker: CircuitBreakerState = {
    failures: 0,
    state: 'closed',
    timeout: 30000
  }
  private maxConcurrency: number
  private activeJobs = 0

  constructor(config: { maxConcurrency?: number } = {}) {
    super()
    this.maxConcurrency = config.maxConcurrency || 4
  }

  async processData(context: ProcessingContext): Promise<ProcessingResult> {
    const { job } = context
    
    if (this.activeJobs >= this.maxConcurrency) {
      throw new Error('Maximum concurrent jobs exceeded')
    }

    this.activeJobs++
    this.jobs.set(job.id, { ...job, status: 'processing', startedAt: new Date() })

    try {
      if (this.circuitBreaker.state === 'open') {
        if (this.shouldRetryCircuitBreaker()) {
          this.circuitBreaker.state = 'half_open'
        } else {
          throw new Error('Circuit breaker is open - system temporarily unavailable')
        }
      }

      const result = await this.executeProcessing(context)
      
      if (this.circuitBreaker.state === 'half_open') {
        this.circuitBreaker.state = 'closed'
        this.circuitBreaker.failures = 0
      }

      return result
    } catch (error) {
      this.handleProcessingError(job.id, error as Error)
      throw error
    } finally {
      this.activeJobs--
      this.cleanupJob(job.id)
    }
  }

  private async executeProcessing(context: ProcessingContext): Promise<ProcessingResult> {
    const { job, config, onProgress } = context
    const startTime = Date.now()
    let processedRecords = 0
    let successCount = 0
    let errorCount = 0
    let warningCount = 0
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const batchResults: BatchResult[] = []

    const totalBatches = Math.ceil(job.totalRecords / config.batchSize)
    let memoryPeak = 0

    for (let batch = 0; batch < totalBatches; batch++) {
      const startRow = batch * config.batchSize
      const endRow = Math.min(startRow + config.batchSize, job.totalRecords)
      
      try {
        const batchResult = await this.processBatch(context, batch, startRow, endRow)
        batchResults.push(batchResult)
        
        processedRecords += batchResult.processedRows
        successCount += batchResult.processedRows - batchResult.errors.length - batchResult.warnings.length
        errorCount += batchResult.errors.length
        warningCount += batchResult.warnings.length
        errors.push(...batchResult.errors)
        warnings.push(...batchResult.warnings)
        memoryPeak = Math.max(memoryPeak, batchResult.memoryPeak)

        if (onProgress) {
          const progress: ProcessingProgress = {
            jobId: job.id,
            stage: 'processing',
            totalRecords: job.totalRecords,
            processedRecords,
            successCount,
            errorCount,
            warningCount,
            percentage: (processedRecords / job.totalRecords) * 100,
            estimatedTimeRemaining: this.calculateETA(startTime, processedRecords, job.totalRecords),
            currentBatch: batch + 1,
            totalBatches,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
            throughputPerSecond: processedRecords / ((Date.now() - startTime) / 1000),
            errors: errors.slice(-10),
            lastUpdate: new Date()
          }
          onProgress(progress)
        }

        await this.throttleIfNeeded(batchResult.memoryPeak, config.maxMemoryUsage)
      } catch (error) {
        this.handleBatchError(job.id, batch, error as Error)
        throw error
      }
    }

    const processingTime = Date.now() - startTime
    const throughputPerSecond = processedRecords / (processingTime / 1000)

    return {
      jobId: job.id,
      success: errorCount === 0,
      totalRecords: job.totalRecords,
      processedRecords,
      successCount,
      errorCount,
      warningCount,
      insertedRecords: successCount,
      updatedRecords: 0,
      skippedRecords: errorCount,
      processingTime,
      memoryPeak,
      throughputPerSecond,
      errors,
      warnings,
      qualityReport: this.generateQualityReport(job.totalRecords, successCount, errorCount, warnings),
      rollbackAvailable: config.enableRollback || false,
      rollbackId: config.enableRollback ? `rollback_${job.id}_${Date.now()}` : undefined
    }
  }

  private async processBatch(
    context: ProcessingContext,
    batchIndex: number,
    startRow: number,
    endRow: number
  ): Promise<BatchResult> {
    const batchId = `${context.job.id}_batch_${batchIndex}`
    const startTime = Date.now()
    const initialMemory = process.memoryUsage().heapUsed

    const worker = await this.getOrCreateWorker(context.job.id)
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Batch ${batchIndex} timed out`))
      }, context.config.timeoutMs)

      const handleMessage = (event: MessageEvent<WorkerMessage>) => {
        if (event.data.batchId === batchId) {
          clearTimeout(timeout)
          worker.removeEventListener('message', handleMessage)
          
          if (event.data.type === 'error') {
            reject(new Error(event.data.payload.message))
          } else if (event.data.type === 'complete') {
            const currentMemory = process.memoryUsage().heapUsed
            resolve({
              batchId,
              startRow,
              endRow,
              processedRows: event.data.payload.processedRows,
              errors: event.data.payload.errors || [],
              warnings: event.data.payload.warnings || [],
              duration: Date.now() - startTime,
              memoryPeak: Math.max(initialMemory, currentMemory) / 1024 / 1024,
              rollbackPoint: context.config.enableRollback ? `rollback_${batchId}` : undefined
            })
          }
        }
      }

      worker.addEventListener('message', handleMessage)
      
      worker.postMessage({
        type: 'process_batch',
        jobId: context.job.id,
        batchId,
        payload: {
          startRow,
          endRow,
          mappings: context.mappings,
          transformations: context.transformations,
          validationRules: context.validationRules
        }
      })
    })
  }

  private async getOrCreateWorker(jobId: string): Promise<Worker> {
    if (!this.workers.has(jobId)) {
      const worker = new Worker('/lib/import-export/workers/batch-processor.js')
      this.workers.set(jobId, worker)
      
      worker.addEventListener('error', (error) => {
        this.handleWorkerError(jobId, error)
      })
    }
    
    return this.workers.get(jobId)!
  }

  private handleProcessingError(jobId: string, error: Error): void {
    this.circuitBreaker.failures++
    this.circuitBreaker.lastFailureTime = new Date()
    
    if (this.circuitBreaker.failures >= 5) {
      this.circuitBreaker.state = 'open'
    }
    
    const job = this.jobs.get(jobId)
    if (job) {
      this.jobs.set(jobId, { ...job, status: 'failed' })
    }
    
    this.emit('processingError', { jobId, error })
  }

  private handleBatchError(jobId: string, batchIndex: number, error: Error): void {
    this.emit('batchError', { jobId, batchIndex, error })
  }

  private handleWorkerError(jobId: string, error: ErrorEvent): void {
    this.emit('workerError', { jobId, error })
  }

  private shouldRetryCircuitBreaker(): boolean {
    if (!this.circuitBreaker.lastFailureTime) return true
    
    const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime.getTime()
    return timeSinceLastFailure > this.circuitBreaker.timeout
  }

  private calculateETA(startTime: number, processed: number, total: number): number {
    if (processed === 0) return 0
    
    const elapsed = Date.now() - startTime
    const rate = processed / elapsed
    const remaining = total - processed
    
    return remaining / rate
  }

  private async throttleIfNeeded(currentMemory: number, maxMemory: number): Promise<void> {
    if (currentMemory > maxMemory * 0.8) {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (global.gc) {
        global.gc()
      }
    }
  }

  private generateQualityReport(total: number, valid: number, invalid: number, warnings: ValidationWarning[]) {
    return {
      totalRecords: total,
      validRecords: valid,
      invalidRecords: invalid,
      duplicateRecords: 0,
      emptyFields: {},
      dataTypes: {},
      outliers: {},
      suggestions: warnings.map(w => w.suggestion).filter(Boolean)
    }
  }

  private cleanupJob(jobId: string): void {
    const worker = this.workers.get(jobId)
    if (worker) {
      worker.terminate()
      this.workers.delete(jobId)
    }
    
    setTimeout(() => {
      this.jobs.delete(jobId)
    }, 300000)
  }

  getJobStatus(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId)
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (!job) return false
    
    this.jobs.set(jobId, { ...job, status: 'cancelled' })
    this.cleanupJob(jobId)
    return true
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return { ...this.circuitBreaker }
  }
}