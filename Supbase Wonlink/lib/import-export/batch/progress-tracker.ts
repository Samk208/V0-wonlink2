import { ProcessingProgress, ProcessingJob, BatchResult } from '../types'

export class ProgressTracker {
  private progressCallbacks = new Map<string, (progress: ProcessingProgress) => void>()
  private jobProgress = new Map<string, ProcessingProgress>()
  private batchResults = new Map<string, BatchResult[]>()
  private startTimes = new Map<string, number>()

  /**
   * Register progress callback for a job
   */
  public registerCallback(jobId: string, callback: (progress: ProcessingProgress) => void): void {
    this.progressCallbacks.set(jobId, callback)
  }

  /**
   * Start tracking progress for a job
   */
  public startTracking(job: ProcessingJob, totalBatches: number): void {
    const startTime = Date.now()
    this.startTimes.set(job.id, startTime)
    
    const initialProgress: ProcessingProgress = {
      jobId: job.id,
      stage: 'parsing',
      totalRecords: job.totalRecords,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      percentage: 0,
      estimatedTimeRemaining: 0,
      currentBatch: 0,
      totalBatches,
      memoryUsage: this.getCurrentMemoryUsage(),
      throughputPerSecond: 0,
      errors: [],
      lastUpdate: new Date()
    }
    
    this.jobProgress.set(job.id, initialProgress)
    this.batchResults.set(job.id, [])
    this.notifyProgress(job.id)
  }

  /**
   * Update progress for a specific batch
   */
  public updateBatchProgress(
    jobId: string,
    batchIndex: number,
    stage: 'parsing' | 'mapping' | 'validation' | 'transformation' | 'saving',
    processedInBatch: number,
    totalInBatch: number
  ): void {
    const progress = this.jobProgress.get(jobId)
    if (!progress) return

    const startTime = this.startTimes.get(jobId) || Date.now()
    const elapsed = Date.now() - startTime
    
    const batchResults = this.batchResults.get(jobId) || []
    const completedBatches = batchResults.length
    
    const estimatedBatchCompletion = completedBatches + (processedInBatch / totalInBatch)
    const overallProgress = (estimatedBatchCompletion / progress.totalBatches) * 100
    
    const totalProcessed = batchResults.reduce((sum, batch) => sum + batch.processedRows, 0) + processedInBatch
    const throughput = elapsed > 0 ? totalProcessed / (elapsed / 1000) : 0
    
    const remainingBatches = progress.totalBatches - estimatedBatchCompletion
    const estimatedTimeRemaining = throughput > 0 ? 
      (remainingBatches * (totalInBatch / throughput)) * 1000 : 0

    const updatedProgress: ProcessingProgress = {
      ...progress,
      stage,
      processedRecords: totalProcessed,
      percentage: Math.min(overallProgress, 100),
      estimatedTimeRemaining,
      currentBatch: batchIndex + 1,
      memoryUsage: this.getCurrentMemoryUsage(),
      throughputPerSecond: Math.round(throughput),
      lastUpdate: new Date()
    }
    
    this.jobProgress.set(jobId, updatedProgress)
    this.notifyProgress(jobId)
  }

  /**
   * Complete a batch and update overall progress
   */
  public completeBatch(jobId: string, batchResult: BatchResult): void {
    const batchResults = this.batchResults.get(jobId) || []
    batchResults.push(batchResult)
    this.batchResults.set(jobId, batchResults)
    
    const progress = this.jobProgress.get(jobId)
    if (!progress) return

    const totalProcessed = batchResults.reduce((sum, batch) => sum + batch.processedRows, 0)
    const totalErrors = batchResults.reduce((sum, batch) => sum + batch.errors.length, 0)
    const totalWarnings = batchResults.reduce((sum, batch) => sum + batch.warnings.length, 0)
    const successCount = totalProcessed - totalErrors

    const startTime = this.startTimes.get(jobId) || Date.now()
    const elapsed = Date.now() - startTime
    const throughput = elapsed > 0 ? totalProcessed / (elapsed / 1000) : 0

    const completedBatches = batchResults.length
    const remainingBatches = progress.totalBatches - completedBatches
    const estimatedTimeRemaining = remainingBatches > 0 && throughput > 0 ?
      (remainingBatches * (progress.totalRecords / progress.totalBatches) / throughput) * 1000 : 0

    const allErrors = batchResults.flatMap(batch => batch.errors)
    const recentErrors = allErrors.slice(-10)

    const updatedProgress: ProcessingProgress = {
      ...progress,
      stage: completedBatches === progress.totalBatches ? 'saving' : progress.stage,
      processedRecords: totalProcessed,
      successCount,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      percentage: (completedBatches / progress.totalBatches) * 100,
      estimatedTimeRemaining,
      currentBatch: completedBatches,
      memoryUsage: this.getCurrentMemoryUsage(),
      throughputPerSecond: Math.round(throughput),
      errors: recentErrors,
      lastUpdate: new Date()
    }
    
    this.jobProgress.set(jobId, updatedProgress)
    this.notifyProgress(jobId)
  }

  /**
   * Mark job as completed
   */
  public completeJob(jobId: string): void {
    const progress = this.jobProgress.get(jobId)
    if (!progress) return

    const updatedProgress: ProcessingProgress = {
      ...progress,
      stage: 'saving',
      percentage: 100,
      estimatedTimeRemaining: 0,
      currentBatch: progress.totalBatches,
      lastUpdate: new Date()
    }
    
    this.jobProgress.set(jobId, updatedProgress)
    this.notifyProgress(jobId)
  }

  /**
   * Add error to job progress
   */
  public addError(jobId: string, error: any): void {
    const progress = this.jobProgress.get(jobId)
    if (!progress) return

    const updatedErrors = [...progress.errors, error].slice(-10)
    
    const updatedProgress: ProcessingProgress = {
      ...progress,
      errorCount: progress.errorCount + 1,
      errors: updatedErrors,
      lastUpdate: new Date()
    }
    
    this.jobProgress.set(jobId, updatedProgress)
    this.notifyProgress(jobId)
  }

  /**
   * Get current progress for a job
   */
  public getProgress(jobId: string): ProcessingProgress | undefined {
    return this.jobProgress.get(jobId)
  }

  /**
   * Get all batch results for a job
   */
  public getBatchResults(jobId: string): BatchResult[] {
    return this.batchResults.get(jobId) || []
  }

  /**
   * Calculate estimated completion time
   */
  public getEstimatedCompletion(jobId: string): Date | undefined {
    const progress = this.jobProgress.get(jobId)
    if (!progress || progress.estimatedTimeRemaining <= 0) return undefined
    
    return new Date(Date.now() + progress.estimatedTimeRemaining)
  }

  /**
   * Get processing statistics
   */
  public getStatistics(jobId: string): {
    averageBatchTime: number
    averageThroughput: number
    memoryEfficiency: number
    errorRate: number
    warningRate: number
  } | undefined {
    const batchResults = this.batchResults.get(jobId)
    if (!batchResults || batchResults.length === 0) return undefined

    const averageBatchTime = batchResults.reduce((sum, batch) => sum + batch.duration, 0) / batchResults.length
    const totalProcessed = batchResults.reduce((sum, batch) => sum + batch.processedRows, 0)
    const totalTime = batchResults.reduce((sum, batch) => sum + batch.duration, 0)
    const averageThroughput = totalTime > 0 ? totalProcessed / (totalTime / 1000) : 0
    
    const maxMemory = Math.max(...batchResults.map(batch => batch.memoryPeak))
    const avgMemory = batchResults.reduce((sum, batch) => sum + batch.memoryPeak, 0) / batchResults.length
    const memoryEfficiency = maxMemory > 0 ? avgMemory / maxMemory : 1

    const totalErrors = batchResults.reduce((sum, batch) => sum + batch.errors.length, 0)
    const totalWarnings = batchResults.reduce((sum, batch) => sum + batch.warnings.length, 0)
    
    const errorRate = totalProcessed > 0 ? (totalErrors / totalProcessed) * 100 : 0
    const warningRate = totalProcessed > 0 ? (totalWarnings / totalProcessed) * 100 : 0

    return {
      averageBatchTime,
      averageThroughput,
      memoryEfficiency,
      errorRate,
      warningRate
    }
  }

  /**
   * Clean up tracking data for completed job
   */
  public cleanup(jobId: string): void {
    setTimeout(() => {
      this.progressCallbacks.delete(jobId)
      this.jobProgress.delete(jobId)
      this.batchResults.delete(jobId)
      this.startTimes.delete(jobId)
    }, 300000) // Keep data for 5 minutes after completion
  }

  /**
   * Notify progress callback
   */
  private notifyProgress(jobId: string): void {
    const callback = this.progressCallbacks.get(jobId)
    const progress = this.jobProgress.get(jobId)
    
    if (callback && progress) {
      try {
        callback(progress)
      } catch (error) {
        console.error(`Progress callback error for job ${jobId}:`, error)
      }
    }
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
    
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024
    }
    
    return 0
  }

  /**
   * Export progress data for debugging
   */
  public exportProgressData(jobId: string): {
    progress: ProcessingProgress | undefined
    batchResults: BatchResult[]
    statistics: any
  } {
    return {
      progress: this.getProgress(jobId),
      batchResults: this.getBatchResults(jobId),
      statistics: this.getStatistics(jobId)
    }
  }
}