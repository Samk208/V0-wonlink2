'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X,
  Trash2,
  Play,
  Pause,
  Eye,
  Download,
  AlertTriangle,
  Info,
  Clock,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useClientTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'

interface FileUploadItem {
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

interface EnhancedFileUploadZoneProps {
  onFileSelect?: (files: File[]) => void
  onUploadComplete?: (uploadId: string, file: File) => void
  onUploadError?: (error: string, file: File) => void
  onQueueComplete?: (results: Array<{ uploadId: string; file: File }>) => void
  maxFileSize?: number // in bytes, default 10MB
  maxFiles?: number // default 10
  acceptedFileTypes?: string[]
  className?: string
  showQueue?: boolean
  autoUpload?: boolean
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'csv':
      return <FileText className="w-4 h-4 text-green-600" />
    case 'xlsx':
    case 'xls':
      return <FileText className="w-4 h-4 text-blue-600" />
    case 'json':
      return <FileText className="w-4 h-4 text-orange-600" />
    default:
      return <FileText className="w-4 h-4 text-gray-600" />
  }
}

export function EnhancedFileUploadZone({
  onFileSelect,
  onUploadComplete,
  onUploadError,
  onQueueComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  acceptedFileTypes = ['.csv', '.xlsx', '.xls', '.json'],
  className,
  showQueue = true,
  autoUpload = true
}: EnhancedFileUploadZoneProps) {
  const { t } = useClientTranslation()
  const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [queueProcessing, setQueueProcessing] = useState(false)
  const [showErrorDetails, setShowErrorDetails] = useState<string | null>(null)
  const uploadQueueRef = useRef<FileUploadItem[]>([])

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return t('fileValidationTooLarge', { size: formatFileSize(maxFileSize) })
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFileTypes.includes(fileExtension)) {
      return t('fileValidationInvalidFormat', { formats: acceptedFileTypes.join(', ') })
    }

    // Check if file is empty
    if (file.size === 0) {
      return t('fileValidationEmpty')
    }

    // Check for duplicate files
    const existingFile = uploadQueue.find(item => item.file.name === file.name)
    if (existingFile) {
      return t('fileValidationDuplicate')
    }

    return null
  }, [maxFileSize, acceptedFileTypes, t, uploadQueue])

  const uploadFile = useCallback(async (fileItem: FileUploadItem) => {
    try {
      // Update status to uploading
      setUploadQueue(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'uploading', progress: 0 }
          : item
      ))

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', fileItem.file)

      // Upload file to API
      const response = await fetch('/api/import-export/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      if (result.success && result.upload) {
        // Update status to processing
        setUploadQueue(prev => prev.map(item => 
          item.id === fileItem.id 
            ? { ...item, status: 'processing', progress: 50, uploadId: result.upload.id }
            : item
        ))

        // Process the file
        const processResponse = await fetch('/api/import-export/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uploadId: result.upload.id })
        })

        if (processResponse.ok) {
          const processResult = await processResponse.json()
          
          setUploadQueue(prev => prev.map(item => 
            item.id === fileItem.id 
              ? { 
                  ...item, 
                  status: 'completed', 
                  progress: 100,
                  result: {
                    totalRecords: processResult.totalRecords || 0,
                    successCount: processResult.successCount || 0,
                    errorCount: processResult.errorCount || 0,
                    downloadUrl: processResult.downloadUrl
                  }
                }
              : item
          ))

          onUploadComplete?.(result.upload.id, fileItem.file)
        } else {
          throw new Error('Processing failed')
        }
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadQueue(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'error', error: errorMessage }
          : item
      ))

      onUploadError?.(errorMessage, fileItem.file)
    }
  }, [onUploadComplete, onUploadError])

  const processQueue = useCallback(async () => {
    if (queueProcessing) return

    setQueueProcessing(true)
    const pendingFiles = uploadQueue.filter(item => item.status === 'pending')
    
    for (const fileItem of pendingFiles) {
      await uploadFile(fileItem)
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setQueueProcessing(false)
    
    // Check if all files are completed
    const completedFiles = uploadQueue.filter(item => item.status === 'completed')
    if (completedFiles.length > 0) {
      onQueueComplete?.(completedFiles.map(item => ({ 
        uploadId: item.uploadId!, 
        file: item.file 
      })))
    }
  }, [uploadQueue, queueProcessing, uploadFile, onQueueComplete])

  const handleDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      const errorMessage = errors.map((error: any) => {
        if (error.code === 'file-too-large') {
          return t('fileValidationTooLarge', { size: formatFileSize(maxFileSize) })
        }
        if (error.code === 'file-invalid-type') {
          return t('fileValidationInvalidFormat', { formats: acceptedFileTypes.join(', ') })
        }
        return error.message
      }).join(', ')
      
      // Show error alert
      console.error('File rejected:', file.name, errorMessage)
    })

    // Add valid files to queue
    const newFiles: FileUploadItem[] = acceptedFiles.map(file => {
      const validationError = validateFile(file)
      return {
        id: `${file.name}-${Date.now()}`,
        file,
        status: validationError ? 'error' : 'pending',
        progress: 0,
        error: validationError || undefined
      }
    })

    setUploadQueue(prev => [...prev, ...newFiles])
    onFileSelect?.(acceptedFiles)

    // Auto-upload if enabled
    if (autoUpload && newFiles.some(f => f.status === 'pending')) {
      setTimeout(() => processQueue(), 100)
    }
  }, [validateFile, onFileSelect, autoUpload, processQueue, maxFileSize, acceptedFileTypes, t])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    maxFiles,
    maxSize: maxFileSize,
    disabled: queueProcessing
  })

  const removeFile = (fileId: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== fileId))
  }

  const retryFile = (fileItem: FileUploadItem) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === fileItem.id 
        ? { ...item, status: 'pending', progress: 0, error: undefined }
        : item
    ))
    
    if (autoUpload) {
      setTimeout(() => processQueue(), 100)
    }
  }

  const pauseQueue = () => {
    setQueueProcessing(false)
  }

  const resumeQueue = () => {
    processQueue()
  }

  const getQueueStats = () => {
    const stats = {
      total: uploadQueue.length,
      pending: uploadQueue.filter(item => item.status === 'pending').length,
      uploading: uploadQueue.filter(item => item.status === 'uploading').length,
      processing: uploadQueue.filter(item => item.status === 'processing').length,
      completed: uploadQueue.filter(item => item.status === 'completed').length,
      error: uploadQueue.filter(item => item.status === 'error').length
    }
    return stats
  }

  const stats = getQueueStats()

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Zone */}
      <Card className={cn(
        'border-2 border-dashed transition-all duration-200',
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
        queueProcessing && 'opacity-75'
      )}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="cursor-pointer transition-colors rounded-lg p-8 text-center"
            onDragEnter={() => setIsDragActive(true)}
            onDragLeave={() => setIsDragActive(false)}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                isDragActive ? 'bg-blue-100' : 'bg-gray-100'
              )}>
                <Upload className={cn(
                  'w-8 h-8',
                  isDragActive ? 'text-blue-600' : 'text-gray-400'
                )} />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive 
                    ? t('fileUploadDropHere') 
                    : t('fileUploadDragDrop')
                  }
                </p>
                
                <p className="text-sm text-gray-500">
                  {t('fileUploadFormats', { formats: acceptedFileTypes.join(', ') })}
                </p>
                
                <p className="text-xs text-gray-400">
                  {t('fileUploadMaxSize', { size: formatFileSize(maxFileSize) })} • {t('fileUploadMaxFiles', { count: maxFiles })}
                </p>
              </div>
              
              <Button variant="outline" disabled={queueProcessing}>
                {t('fileUploadChooseFiles')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Stats */}
      {showQueue && uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('fileUploadQueue')}</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{stats.total}</Badge>
                {queueProcessing && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    {t('fileUploadProcessing')}
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              {t('fileUploadQueueDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                <div className="text-xs text-gray-600">{t('fileUploadPending')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.uploading + stats.processing}</div>
                <div className="text-xs text-gray-600">{t('fileUploadActive')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-gray-600">{t('fileUploadCompleted')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                <div className="text-xs text-gray-600">{t('fileUploadError')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round(((stats.completed + stats.error) / stats.total) * 100)}%
                </div>
                <div className="text-xs text-gray-600">{t('fileUploadComplete')}</div>
              </div>
            </div>

            {/* Queue Actions */}
            {stats.pending > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                {queueProcessing ? (
                  <Button variant="outline" size="sm" onClick={pauseQueue}>
                    <Pause className="w-4 h-4 mr-2" />
                    {t('fileUploadPause')}
                  </Button>
                ) : (
                  <Button size="sm" onClick={resumeQueue}>
                    <Play className="w-4 h-4 mr-2" />
                    {t('fileUploadResume')}
                  </Button>
                )}
              </div>
            )}

            {/* File List */}
            <div className="space-y-3">
              {uploadQueue.map((fileItem) => (
                <FileQueueItem
                  key={fileItem.id}
                  fileItem={fileItem}
                  onRemove={removeFile}
                  onRetry={retryFile}
                  onViewError={setShowErrorDetails}
                  formatFileSize={formatFileSize}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details Dialog */}
      <Dialog open={!!showErrorDetails} onOpenChange={() => setShowErrorDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('fileUploadErrorDetails')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {showErrorDetails && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{showErrorDetails}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FileQueueItem({
  fileItem,
  onRemove,
  onRetry,
  onViewError,
  formatFileSize,
  getFileIcon
}: {
  fileItem: FileUploadItem
  onRemove: (id: string) => void
  onRetry: (fileItem: FileUploadItem) => void
  onViewError: (error: string) => void
  formatFileSize: (bytes: number) => string
  getFileIcon: (fileName: string) => React.ReactNode
}) {
  const { t } = useClientTranslation()

  const getStatusIcon = () => {
    switch (fileItem.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (fileItem.status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'uploading':
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      case 'paused':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={cn(
      'flex items-center justify-between p-3 border rounded-lg transition-colors',
      getStatusColor()
    )}>
      <div className="flex items-center space-x-3 flex-1">
        {getStatusIcon()}
        
        <div className="flex items-center space-x-2">
          {getFileIcon(fileItem.file.name)}
          <div>
            <p className="font-medium text-sm">{fileItem.file.name}</p>
            <p className="text-xs text-gray-500">
              {formatFileSize(fileItem.file.size)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Progress */}
        {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
          <div className="w-20">
            <Progress value={fileItem.progress} className="h-2" />
          </div>
        )}

        {/* Result Stats */}
        {fileItem.status === 'completed' && fileItem.result && (
          <div className="flex items-center space-x-2 text-xs">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {fileItem.result.successCount} {t('fileUploadSuccess')}
            </Badge>
            {fileItem.result.errorCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {fileItem.result.errorCount} {t('fileUploadErrors')}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {fileItem.status === 'completed' && fileItem.result?.downloadUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileItem.result!.downloadUrl, '_blank')}
            >
              <Download className="w-3 h-3" />
            </Button>
          )}

          {fileItem.status === 'error' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewError(fileItem.error || 'Unknown error')}
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}

          {fileItem.status === 'error' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(fileItem)}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(fileItem.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
} 