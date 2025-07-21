'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X,
  Download,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useClientTranslation } from '@/lib/translations'
import { uploadFile, getUserUploads, deleteUpload, getUploadStatus } from '@/lib/upload-utils'
import { cn } from '@/lib/utils'

interface UploadItem {
  id: string
  fileName: string
  fileSize: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  uploadId?: string
  error?: string
  metadata?: {
    totalRecords?: number
    processedRecords?: number
    successCount?: number
    errorCount?: number
  }
}

interface EnhancedUploadInterfaceProps {
  bucket?: 'imports' | 'exports' | 'avatars' | 'campaigns'
  folder?: string
  maxFileSize?: number
  acceptedFileTypes?: string[]
  processImmediately?: boolean
  showQueue?: boolean
  autoUpload?: boolean
  className?: string
}

export function EnhancedUploadInterface({
  bucket = 'imports',
  folder = 'uploads',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['.csv', '.xlsx', '.xls', '.json'],
  processImmediately = true,
  showQueue = true,
  autoUpload = true,
  className
}: EnhancedUploadInterfaceProps) {
  const { t } = useClientTranslation()
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState<string | null>(null)
  const [userUploads, setUserUploads] = useState<any[]>([])

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon based on type
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

  // Validate file before upload
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      return t('file.validation.tooLarge', { size: formatFileSize(maxFileSize) })
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFileTypes.includes(fileExtension)) {
      return t('file.validation.invalidFormat')
    }

    if (file.size === 0) {
      return t('file.validation.empty')
    }

    return null
  }, [maxFileSize, acceptedFileTypes, t, formatFileSize])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    const uploadItem: UploadItem = {
      id: Math.random().toString(36).substring(2, 15),
      fileName: file.name,
      fileSize: file.size,
      status: 'pending',
      progress: 0
    }

    setUploads(prev => [...prev, uploadItem])
    setError(null)
    setSuccess(null)

    try {
      setIsUploading(true)
      
      // Update status to uploading
      setUploads(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'uploading' }
          : item
      ))

      const result = await uploadFile(file, {
        bucket,
        folder,
        maxFileSize,
        allowedTypes: acceptedFileTypes,
        processImmediately,
        onProgress: (progress) => {
          setUploads(prev => prev.map(item => 
            item.id === uploadItem.id 
              ? { ...item, progress }
              : item
          ))
        },
        onError: (errorMessage) => {
          setError(errorMessage)
          setUploads(prev => prev.map(item => 
            item.id === uploadItem.id 
              ? { ...item, status: 'failed', error: errorMessage }
              : item
          ))
        }
      })

      if (result.success) {
        setSuccess(t('file.upload.success'))
        setUploads(prev => prev.map(item => 
          item.id === uploadItem.id 
            ? { 
                ...item, 
                status: 'completed', 
                progress: 100,
                uploadId: result.uploadId,
                metadata: result.metadata
              }
            : item
        ))
      } else {
        setError(result.error || t('file.upload.failed'))
        setUploads(prev => prev.map(item => 
          item.id === uploadItem.id 
            ? { ...item, status: 'failed', error: result.error }
            : item
        ))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('file.upload.failed')
      setError(errorMessage)
      setUploads(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'failed', error: errorMessage }
          : item
      ))
    } finally {
      setIsUploading(false)
    }
  }, [bucket, folder, maxFileSize, acceptedFileTypes, processImmediately, validateFile, t])

  // Handle dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      handleFileUpload(file)
    })
  }, [handleFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: true
  })

  // Load user uploads
  const loadUserUploads = useCallback(async () => {
    try {
      const uploads = await getUserUploads(20, 0)
      setUserUploads(uploads)
    } catch (error) {
      console.error('Failed to load uploads:', error)
    }
  }, [])

  // Delete upload
  const handleDeleteUpload = useCallback(async (uploadId: string) => {
    try {
      await deleteUpload(uploadId)
      setUploads(prev => prev.filter(item => item.uploadId !== uploadId))
      setSuccess(t('file.delete.success'))
    } catch (error) {
      setError(t('file.delete.failed'))
    }
  }, [t])

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'uploading':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{t('import.title')}</CardTitle>
          <CardDescription>
            {t('import.dropZone.formats')} • {t('file.validation.maxSize', { size: formatFileSize(maxFileSize) })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragActive 
                ? "border-blue-400 bg-blue-50" 
                : "border-gray-300 hover:border-blue-400"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {isDragActive ? t('import.dropZone.dropping') : t('import.dropZone.idle')}
            </p>
            <p className="text-sm text-gray-500">
              {t('import.dropZone.formats')} • {t('file.validation.maxSize', { size: formatFileSize(maxFileSize) })}
            </p>
            <Button variant="outline" className="mt-4">
              {t('import.chooseFile')}
            </Button>
          </div>

          {/* Upload Queue */}
          {showQueue && uploads.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{t('recent.title')}</h3>
              {uploads.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(upload.status)}
                      <div>
                        <p className="font-medium">{upload.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(upload.fileSize)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(upload.status)}>
                        {t(`recent.status.${upload.status}`)}
                      </Badge>
                      {upload.uploadId && (
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => getUploadStatus(upload.uploadId!)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUpload(upload.uploadId!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <Progress value={upload.progress} className="mb-2" />
                  )}
                  
                  {/* Error Message */}
                  {upload.error && (
                    <p className="text-sm text-red-600 mt-2">{upload.error}</p>
                  )}
                  
                  {/* Processing Results */}
                  {upload.metadata && upload.status === 'completed' && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{t('file.processing.totalRecords')}:</span> {upload.metadata.totalRecords}
                        </div>
                        <div>
                          <span className="font-medium">{t('file.processing.processedRecords')}:</span> {upload.metadata.processedRecords}
                        </div>
                        <div>
                          <span className="font-medium text-green-600">{t('file.processing.successCount')}:</span> {upload.metadata.successCount}
                        </div>
                        <div>
                          <span className="font-medium text-red-600">{t('file.processing.errorCount')}:</span> {upload.metadata.errorCount}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={loadUserUploads}
              variant="outline"
              disabled={isUploading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('recent.loadMore')}
            </Button>
            <Button
              onClick={() => setUploads([])}
              variant="outline"
              disabled={uploads.length === 0}
            >
              <X className="w-4 h-4 mr-2" />
              {t('recent.clearAll')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Details Dialog */}
      <Dialog open={!!showErrorDetails} onOpenChange={() => setShowErrorDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('file.errorDetails')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {showErrorDetails && (
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {showErrorDetails}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 