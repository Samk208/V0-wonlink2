// Core types for the advanced data processing engine

export interface ProcessingJob {
  id: string
  userId: string
  fileName: string
  fileType: 'csv' | 'xlsx' | 'json'
  status: 'pending' | 'mapping' | 'processing' | 'completed' | 'failed' | 'cancelled'
  totalRecords: number
  processedRecords: number
  successCount: number
  errorCount: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  estimatedTimeRemaining?: number
  memoryUsage?: number
}

export interface ColumnMapping {
  sourceColumn: string
  targetField: string
  confidence: number
  isRequired: boolean
  transformation?: DataTransformation
}

export interface DataTransformation {
  type: 'text' | 'number' | 'currency' | 'date' | 'category' | 'url' | 'custom'
  rules: TransformationRule[]
}

export interface TransformationRule {
  name: string
  pattern?: RegExp
  replacement?: string
  validator?: (value: any) => boolean
  transformer?: (value: any) => any
  errorMessage?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  transformedData?: any
}

export interface ValidationError {
  type: 'missing_required' | 'invalid_format' | 'business_rule' | 'duplicate' | 'custom'
  field: string
  value: any
  message: string
  suggestion?: string
  severity: 'error' | 'warning'
  row?: number
  column?: string
}

export interface ValidationWarning {
  type: 'data_quality' | 'performance' | 'suggestion'
  field: string
  value: any
  message: string
  suggestion: string
  row?: number
}

export interface ProcessingProgress {
  jobId: string
  stage: 'parsing' | 'mapping' | 'validation' | 'transformation' | 'saving'
  totalRecords: number
  processedRecords: number
  successCount: number
  errorCount: number
  warningCount: number
  percentage: number
  estimatedTimeRemaining: number
  currentBatch: number
  totalBatches: number
  memoryUsage: number
  throughputPerSecond: number
  errors: ValidationError[]
  lastUpdate: Date
}

export interface BatchProcessingConfig {
  batchSize: number
  maxMemoryUsage: number
  timeoutMs: number
  retryAttempts: number
  parallelWorkers: number
  enableStreaming: boolean
}

export interface ColumnPattern {
  field: string
  patterns: RegExp[]
  priority: number
  isRequired: boolean
  aliases: string[]
}

export interface MappingTemplate {
  id: string
  name: string
  description?: string
  userId: string
  mappings: ColumnMapping[]
  createdAt: Date
  lastUsed?: Date
  useCount: number
}

export interface DataQualityReport {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  duplicateRecords: number
  emptyFields: Record<string, number>
  dataTypes: Record<string, Record<string, number>>
  outliers: Record<string, any[]>
  suggestions: string[]
}

export interface ProcessingContext {
  job: ProcessingJob
  config: BatchProcessingConfig
  mappings: ColumnMapping[]
  transformations: Record<string, DataTransformation>
  validationRules: ValidationRule[]
  onProgress?: (progress: ProcessingProgress) => void
  onError?: (error: Error) => void
  onComplete?: (result: ProcessingResult) => void
}

export interface ProcessingResult {
  jobId: string
  success: boolean
  totalRecords: number
  processedRecords: number
  successCount: number
  errorCount: number
  warningCount: number
  insertedRecords: number
  updatedRecords: number
  skippedRecords: number
  processingTime: number
  memoryPeak: number
  throughputPerSecond: number
  errors: ValidationError[]
  warnings: ValidationWarning[]
  qualityReport: DataQualityReport
  rollbackAvailable: boolean
  rollbackId?: string
}

export interface ValidationRule {
  field: string
  type: 'required' | 'format' | 'range' | 'custom' | 'business'
  constraint: any
  message: string
  severity: 'error' | 'warning' | 'info'
  async?: boolean
  dependencies?: string[]
}

export interface DuplicateInfo {
  sourceRow: number
  duplicateRows: number[]
  matchFields: string[]
  confidence: number
  action: 'skip' | 'update' | 'create_new'
  reason: string
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  encoding?: string
  delimiter?: string
  headers: string[]
  sampleData: Record<string, any>[]
  estimatedRows: number
  checksum?: string
}

export interface BatchResult {
  batchId: string
  startRow: number
  endRow: number
  processedRows: number
  errors: ValidationError[]
  warnings: ValidationWarning[]
  duration: number
  memoryPeak: number
  rollbackPoint?: string
}

export interface WorkerMessage {
  type: 'process_batch' | 'validate_data' | 'transform_data' | 'progress_update' | 'error' | 'complete'
  payload: any
  jobId: string
  batchId?: string
}

export interface CircuitBreakerState {
  failures: number
  lastFailureTime?: Date
  state: 'closed' | 'open' | 'half_open'
  timeout: number
}

export interface StreamingConfig {
  chunkSize: number
  highWaterMark: number
  objectMode: boolean
  encoding?: BufferEncoding
}

// Product-specific types
export interface ProductRecord {
  name: string
  description?: string
  price: number
  category: string
  brand?: string
  sku?: string
  imageUrl?: string
  tags?: string[]
  availability?: 'in_stock' | 'out_of_stock' | 'discontinued'
  commissionRate?: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  metadata?: Record<string, any>
}

export interface ProductValidationRules {
  name: {
    minLength: number
    maxLength: number
    required: true
  }
  price: {
    min: number
    max: number
    required: true
    currency?: string
  }
  category: {
    allowedValues?: string[]
    required: true
  }
  sku: {
    pattern?: RegExp
    unique: boolean
  }
  imageUrl: {
    format: 'url'
    required: false
  }
}