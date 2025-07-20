import { WorkerMessage, ColumnMapping, DataTransformation, ValidationRule, BatchResult } from '../types'
import { DataTransformer } from '../transformers/data-transformer'
import { ValidationEngine } from '../validators/validation-engine'

class BatchWorker {
  private transformer: DataTransformer
  private validator: ValidationEngine
  private isProcessing = false

  constructor() {
    this.transformer = new DataTransformer()
    this.validator = new ValidationEngine()
    this.setupMessageHandler()
  }

  private setupMessageHandler(): void {
    self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
      try {
        await this.handleMessage(event.data)
      } catch (error) {
        this.sendError(event.data.jobId, event.data.batchId, error as Error)
      }
    })
  }

  private async handleMessage(message: WorkerMessage): Promise<void> {
    switch (message.type) {
      case 'process_batch':
        await this.processBatch(message)
        break
      case 'validate_data':
        await this.validateData(message)
        break
      case 'transform_data':
        await this.transformData(message)
        break
      default:
        throw new Error(`Unknown message type: ${message.type}`)
    }
  }

  private async processBatch(message: WorkerMessage): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Worker is already processing a batch')
    }

    this.isProcessing = true
    const startTime = Date.now()
    
    try {
      const { startRow, endRow, mappings, transformations, validationRules } = message.payload
      
      const batchData = await this.loadBatchData(message.jobId, startRow, endRow)
      
      this.sendProgress(message.jobId, message.batchId, 'mapping', 0, batchData.length)
      
      const mappedData = this.mapColumns(batchData, mappings)
      
      this.sendProgress(message.jobId, message.batchId, 'transformation', 0, mappedData.length)
      
      const { transformedData, errors: transformErrors, warnings: transformWarnings } = 
        await this.transformer.transformData(mappedData, transformations)
      
      this.sendProgress(message.jobId, message.batchId, 'validation', 0, transformedData.length)
      
      const validationResult = await this.validator.validateData(
        transformedData,
        validationRules,
        'standard'
      )
      
      this.sendProgress(message.jobId, message.batchId, 'saving', 0, transformedData.length)
      
      await this.saveBatchData(message.jobId, message.batchId, transformedData)
      
      const result: Partial<BatchResult> = {
        batchId: message.batchId!,
        startRow,
        endRow,
        processedRows: transformedData.length,
        errors: [...transformErrors, ...validationResult.errors],
        warnings: [...transformWarnings, ...validationResult.warnings],
        duration: Date.now() - startTime,
        memoryPeak: this.getMemoryUsage()
      }
      
      this.sendComplete(message.jobId, message.batchId, result)
    } finally {
      this.isProcessing = false
    }
  }

  private async loadBatchData(jobId: string, startRow: number, endRow: number): Promise<Record<string, any>[]> {
    const data: Record<string, any>[] = []
    
    for (let i = startRow; i < endRow; i++) {
      data.push({
        id: i,
        name: `Product ${i}`,
        price: Math.random() * 1000,
        category: ['Electronics', 'Clothing', 'Home'][Math.floor(Math.random() * 3)]
      })
      
      if (i % 100 === 0) {
        await this.sleep(1)
      }
    }
    
    return data
  }

  private mapColumns(data: Record<string, any>[], mappings: ColumnMapping[]): Record<string, any>[] {
    const mappingMap = new Map(mappings.map(m => [m.sourceColumn, m.targetField]))
    
    return data.map(row => {
      const mappedRow: Record<string, any> = {}
      
      for (const [sourceCol, value] of Object.entries(row)) {
        const targetField = mappingMap.get(sourceCol) || sourceCol
        mappedRow[targetField] = value
      }
      
      return mappedRow
    })
  }

  private async saveBatchData(jobId: string, batchId: string, data: Record<string, any>[]): Promise<void> {
    const chunkSize = 50
    const chunks = this.chunkArray(data, chunkSize)
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      await this.saveChunk(chunk)
      
      this.sendProgress(
        jobId,
        batchId,
        'saving',
        (i + 1) * chunkSize,
        data.length
      )
      
      await this.sleep(10)
    }
  }

  private async saveChunk(chunk: Record<string, any>[]): Promise<void> {
    await this.sleep(Math.random() * 50 + 25)
  }

  private async validateData(message: WorkerMessage): Promise<void> {
    const { data, rules, level } = message.payload
    
    const result = await this.validator.validateData(data, rules, level)
    
    this.sendMessage({
      type: 'complete',
      jobId: message.jobId,
      batchId: message.batchId,
      payload: result
    })
  }

  private async transformData(message: WorkerMessage): Promise<void> {
    const { data, transformations } = message.payload
    
    const result = await this.transformer.transformData(data, transformations)
    
    this.sendMessage({
      type: 'complete',
      jobId: message.jobId,
      batchId: message.batchId,
      payload: result
    })
  }

  private sendProgress(
    jobId: string,
    batchId: string | undefined,
    stage: string,
    processed: number,
    total: number
  ): void {
    this.sendMessage({
      type: 'progress_update',
      jobId,
      batchId,
      payload: {
        stage,
        processed,
        total,
        percentage: total > 0 ? (processed / total) * 100 : 0,
        timestamp: Date.now(),
        memoryUsage: this.getMemoryUsage()
      }
    })
  }

  private sendComplete(jobId: string, batchId: string | undefined, result: any): void {
    this.sendMessage({
      type: 'complete',
      jobId,
      batchId,
      payload: result
    })
  }

  private sendError(jobId: string, batchId: string | undefined, error: Error): void {
    this.sendMessage({
      type: 'error',
      jobId,
      batchId,
      payload: {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      }
    })
  }

  private sendMessage(message: WorkerMessage): void {
    self.postMessage(message)
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }
}

const worker = new BatchWorker()

export default worker