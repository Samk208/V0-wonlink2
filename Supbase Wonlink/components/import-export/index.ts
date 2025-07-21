// Import/Export UI Components for Wonlink Platform
// Modern, responsive components with full i18n support

export { default as FileUploadZone } from './file-upload-zone'
export { EnhancedFileUploadZone } from './enhanced-file-upload-zone'
export { ColumnMappingInterface } from './column-mapping-interface'
export { ExportWizard } from './export-wizard'
export { ProgressDashboard } from './progress-dashboard'

// Types
export interface FileUploadItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error' | 'paused'
  progress: number
  uploadId?: string
  error?: string
  result?: {
    totalRecords: number
    successCount: number
    errorCount: number
    downloadUrl?: string
  }
}

export interface ProcessingJob {
  id: string
  type: 'import' | 'export'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  fileName: string
  fileSize: number
  progress: number
  totalRecords: number
  processedRecords: number
  successCount: number
  errorCount: number
  startedAt: Date
  completedAt?: Date
  errorDetails?: string[]
  downloadUrl?: string
}

export interface ColumnMapping {
  sourceColumn: string
  targetField: string
  confidence: number
  isRequired: boolean
  sampleValue?: string
}

export interface ExportConfig {
  dateRange: {
    start: string
    end: string
  }
  columns: string[]
  format: 'csv' | 'xlsx' | 'pdf'
  filename: string
  filters: Record<string, any>
}

// Constants
export const REQUIRED_FIELDS = ['name', 'price', 'category']
export const OPTIONAL_FIELDS = ['description', 'brand', 'sku', 'imageUrl', 'tags']

export const FIELD_PATTERNS = {
  name: /name|title|product|item/i,
  price: /price|cost|amount|value/i,
  category: /category|type|genre|group/i,
  description: /description|desc|details|summary/i,
  brand: /brand|company|manufacturer/i,
  sku: /sku|code|id|reference/i,
  imageUrl: /image|photo|picture|url/i,
  tags: /tags|keywords|labels/i
}

export const EXPORT_TYPES = {
  products: {
    title: 'exportWizardProductsTitle',
    description: 'exportWizardProductsDescription',
    icon: 'FileText',
    defaultColumns: ['name', 'price', 'category', 'brand', 'description', 'sku'],
    availableColumns: ['name', 'price', 'category', 'brand', 'description', 'sku', 'imageUrl', 'tags', 'availability', 'commission']
  },
  campaigns: {
    title: 'exportWizardCampaignsTitle',
    description: 'exportWizardCampaignsDescription',
    icon: 'BarChart3',
    defaultColumns: ['title', 'budget', 'status', 'startDate', 'endDate', 'applications'],
    availableColumns: ['title', 'budget', 'status', 'startDate', 'endDate', 'applications', 'deliverables', 'platforms', 'audienceSize', 'roi']
  },
  analytics: {
    title: 'exportWizardAnalyticsTitle',
    description: 'exportWizardAnalyticsDescription',
    icon: 'BarChart3',
    defaultColumns: ['date', 'impressions', 'clicks', 'conversions', 'revenue'],
    availableColumns: ['date', 'impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'cpc', 'roas', 'campaign', 'platform']
  }
}

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'csv':
      return 'FileText' // text-green-600
    case 'xlsx':
    case 'xls':
      return 'FileText' // text-blue-600
    case 'json':
      return 'FileText' // text-orange-600
    default:
      return 'FileText' // text-gray-600
  }
}

export const validateFile = (file: File, maxSize: number, acceptedTypes: string[]): string | null => {
  if (file.size > maxSize) {
    return `File is too large. Maximum size is ${formatFileSize(maxSize)}.`
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!acceptedTypes.includes(fileExtension)) {
    return `Invalid file format. Please use ${acceptedTypes.join(', ')}.`
  }

  if (file.size === 0) {
    return 'File is empty. Please select a file with data.'
  }

  return null
} 