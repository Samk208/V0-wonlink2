// Core engine and processing
export { ProcessingEngine } from './core/processing-engine'
export { ProgressTracker } from './batch/progress-tracker'
export { ErrorHandler } from './error-handler'

// Data transformation and mapping
export { IntelligentColumnMapper } from './transformers/column-mapper'
export { DataTransformer } from './transformers/data-transformer'

// Validation
export { ValidationEngine } from './validators/validation-engine'
export { DuplicateDetector } from './validators/duplicate-detector'

// File processors
export { CSVProcessor } from './processors/csv-processor'
export { ExcelProcessor } from './processors/excel-processor'
export { JSONProcessor } from './processors/json-processor'

// Types
export * from './types'

// Main class for easy integration
export class ImportExportEngine {
  private processingEngine: ProcessingEngine
  private progressTracker: ProgressTracker
  private errorHandler: ErrorHandler
  private columnMapper: IntelligentColumnMapper
  private dataTransformer: DataTransformer
  private validationEngine: ValidationEngine
  private duplicateDetector: DuplicateDetector
  
  // File processors
  private csvProcessor: CSVProcessor
  private excelProcessor: ExcelProcessor
  private jsonProcessor: JSONProcessor

  constructor(config: {
    maxConcurrency?: number
    batchSize?: number
    enableProgress?: boolean
    enableRollback?: boolean
  } = {}) {
    this.processingEngine = new ProcessingEngine({ 
      maxConcurrency: config.maxConcurrency || 4 
    })
    this.progressTracker = new ProgressTracker()
    this.errorHandler = new ErrorHandler()
    this.columnMapper = new IntelligentColumnMapper()
    this.dataTransformer = new DataTransformer()
    this.validationEngine = new ValidationEngine()
    this.duplicateDetector = new DuplicateDetector({
      matchFields: ['name', 'sku', 'id'],
      similarity: { threshold: 0.85, algorithm: 'fuzzy', caseSensitive: false, ignoreWhitespace: true },
      actions: { onDuplicate: 'prompt' },
      performance: { batchSize: config.batchSize || 1000, maxComparisons: 10000, useIndexing: true }
    })
    
    this.csvProcessor = new CSVProcessor()
    this.excelProcessor = new ExcelProcessor()
    this.jsonProcessor = new JSONProcessor()
  }

  /**
   * Get all processors for external access
   */
  public getProcessors() {
    return {
      processing: this.processingEngine,
      progress: this.progressTracker,
      errors: this.errorHandler,
      mapping: this.columnMapper,
      transformation: this.dataTransformer,
      validation: this.validationEngine,
      duplicates: this.duplicateDetector,
      csv: this.csvProcessor,
      excel: this.excelProcessor,
      json: this.jsonProcessor
    }
  }

  /**
   * Process file with full pipeline
   */
  public async processFile(
    file: File | Buffer | string,
    options: {
      fileType?: 'csv' | 'xlsx' | 'json'
      mappingTemplate?: string
      validationLevel?: 'basic' | 'standard' | 'strict'
      enableDuplicateDetection?: boolean
      transformationRules?: Record<string, any>
      onProgress?: (progress: any) => void
    } = {}
  ) {
    const {
      fileType = this.detectFileType(file),
      mappingTemplate,
      validationLevel = 'standard',
      enableDuplicateDetection = true,
      transformationRules = {},
      onProgress
    } = options

    try {
      // Step 1: Parse file
      const parseResult = await this.parseFile(file, fileType)
      if (parseResult.errors.length > 0) {
        return { success: false, errors: parseResult.errors }
      }

      // Step 2: Auto-map columns
      const mappings = this.columnMapper.autoMapColumns(parseResult.metadata.headers)
      
      // Step 3: Apply mapping template if provided
      // TODO: Load and apply template from database
      
      // Step 4: Generate mapping preview
      const mappingPreview = this.columnMapper.generateMappingPreview(
        mappings,
        parseResult.data.slice(0, 5)
      )

      // Step 5: Transform data
      const transformResult = await this.dataTransformer.transformData(
        parseResult.data,
        transformationRules
      )

      // Step 6: Validate data
      const validationRules = this.validationEngine.getProductValidationRules()
      const validationResult = await this.validationEngine.validateData(
        transformResult.transformedData,
        validationRules,
        validationLevel
      )

      // Step 7: Detect duplicates
      let duplicateResult
      if (enableDuplicateDetection) {
        duplicateResult = await this.duplicateDetector.detectDuplicates(
          transformResult.transformedData,
          onProgress ? (progress) => onProgress({ stage: 'duplicate_detection', ...progress }) : undefined
        )
      }

      return {
        success: true,
        metadata: parseResult.metadata,
        mappings,
        mappingPreview,
        data: duplicateResult?.cleanData || transformResult.transformedData,
        validation: validationResult,
        duplicates: duplicateResult,
        errors: [
          ...parseResult.errors,
          ...transformResult.errors,
          ...validationResult.errors
        ],
        warnings: [
          ...transformResult.warnings,
          ...validationResult.warnings
        ]
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          type: 'custom' as const,
          field: 'processing',
          value: file,
          message: `Processing failed: ${(error as Error).message}`,
          severity: 'error' as const
        }]
      }
    }
  }

  /**
   * Parse file based on type
   */
  private async parseFile(file: File | Buffer | string, fileType: string) {
    switch (fileType) {
      case 'csv':
        return this.csvProcessor.parseFile(file)
      case 'xlsx':
        return this.excelProcessor.parseFile(file as File | Buffer)
      case 'json':
        return this.jsonProcessor.parseFile(file)
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  /**
   * Detect file type from file
   */
  private detectFileType(file: File | Buffer | string): string {
    if (file instanceof File) {
      const extension = file.name.toLowerCase().split('.').pop()
      switch (extension) {
        case 'csv': return 'csv'
        case 'xlsx': case 'xls': return 'xlsx'
        case 'json': return 'json'
        default: return 'csv'
      }
    }
    
    if (typeof file === 'string') {
      const trimmed = file.trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return 'json'
      }
      return 'csv'
    }
    
    return 'csv'
  }

  /**
   * Create job for batch processing
   */
  public async createProcessingJob(
    file: File | Buffer | string,
    options: any = {}
  ) {
    // Implementation would create a job in the database
    // and return job ID for tracking
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      jobId,
      status: 'pending',
      // ... other job details
    }
  }

  /**
   * Get job status
   */
  public getJobStatus(jobId: string) {
    return this.processingEngine.getJobStatus(jobId)
  }

  /**
   * Cancel processing job
   */
  public cancelJob(jobId: string) {
    return this.processingEngine.cancelJob(jobId)
  }
}