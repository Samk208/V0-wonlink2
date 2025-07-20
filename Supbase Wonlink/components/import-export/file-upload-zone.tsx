'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useClientTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  onUploadComplete?: (uploadId: string) => void
  onUploadError?: (error: string) => void
  maxFileSize?: number // in bytes, default 10MB
  acceptedFileTypes?: string[]
  className?: string
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  fileName?: string
  fileSize?: number
  error?: string
  uploadId?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ['.csv', '.xlsx', '.xls', '.json'],
  className
}) => {
  const { t } = useClientTranslation()
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  })

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return t('fileValidationTooLarge')
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFileTypes.includes(fileExtension)) {
      return t('fileValidationInvalidFormat')
    }

    // Check if file is empty
    if (file.size === 0) {
      return t('fileValidationEmpty')
    }

    return null
  }, [maxFileSize, acceptedFileTypes, t])

  const uploadFile = useCallback(async (file: File) => {
    try {
      setUploadState({
        status: 'uploading',
        progress: 0,
        fileName: file.name,
        fileSize: file.size
      })

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

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
        setUploadState(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          uploadId: result.upload.id
        }))

        onUploadComplete?.(result.upload.id)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }))
      onUploadError?.(errorMessage)
    }
  }, [onUploadComplete, onUploadError])

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: validationError
      })
      onUploadError?.(validationError)
      return
    }

    onFileSelect(file)
    await uploadFile(file)
  }, [validateFile, onFileSelect, uploadFile, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled: uploadState.status === 'uploading' || uploadState.status === 'processing'
  })

  const resetUpload = () => {
    setUploadState({
      status: 'idle',
      progress: 0
    })
  }

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />
      default:
        return <Upload className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusMessage = () => {
    switch (uploadState.status) {
      case 'uploading':
        return `${t('importDropZoneUploading')} ${uploadState.progress}%`
      case 'processing':
        return t('importDropZoneProcessing')
      case 'completed':
        return t('importDropZoneComplete')
      case 'error':
        return uploadState.error || t('importDropZoneError')
      default:
        return t('importDropZoneIdle')
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="border-2 border-dashed transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer transition-colors rounded-lg p-8 text-center',
              isDragActive && 'bg-blue-50 border-blue-300',
              uploadState.status === 'error' && 'bg-red-50 border-red-300',
              uploadState.status === 'completed' && 'bg-green-50 border-green-300',
              (uploadState.status === 'uploading' || uploadState.status === 'processing') && 'bg-blue-50'
            )}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {getStatusIcon()}
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  {getStatusMessage()}
                </p>
                
                {uploadState.fileName && (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{uploadState.fileName}</span>
                    {uploadState.fileSize && (
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(uploadState.fileSize)}
                      </Badge>
                    )}
                  </div>
                )}
                
                {uploadState.status === 'idle' && (
                  <p className="text-sm text-gray-500">
                    {t('importDropZoneFormats')}
                  </p>
                )}
              </div>
              
              {uploadState.status === 'idle' && (
                <Button variant="outline" className="mt-4">
                  {t('importChooseFile')}
                </Button>
              )}
              
              {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
                <div className="w-full max-w-xs space-y-2">
                  <Progress 
                    value={uploadState.status === 'processing' ? 100 : uploadState.progress} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{uploadState.status === 'processing' ? t('importDropZoneProcessing') : t('importDropZoneUploading')}</span>
                    <span>{uploadState.status === 'processing' ? '100%' : `${uploadState.progress}%`}</span>
                  </div>
                </div>
              )}
              
              {(uploadState.status === 'error' || uploadState.status === 'completed') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetUpload}
                  className="mt-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadState.status === 'error' && uploadState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {uploadState.error}
          </AlertDescription>
        </Alert>
      )}

      {uploadState.status === 'completed' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {t('fileUploadSuccess')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default FileUploadZone