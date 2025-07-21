'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  Trash2,
  Eye
} from 'lucide-react'
import { 
  uploadFile, 
  processUploadedFile, 
  getUploadStatus, 
  getUserUploads, 
  deleteUpload,
  type UploadResult 
} from '@/lib/upload-utils'

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

export function FileUploadExample() {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Handle file selection and upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    const newUploads: UploadItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 15),
      fileName: file.name,
      fileSize: file.size,
      status: 'pending',
      progress: 0
    }))

    setUploads(prev => [...prev, ...newUploads])

    try {
      for (const file of Array.from(files)) {
        const uploadItem = newUploads.find(item => item.fileName === file.name)
        if (!uploadItem) continue

        // Update status to uploading
        setUploads(prev => prev.map(item => 
          item.id === uploadItem.id 
            ? { ...item, status: 'uploading' }
            : item
        ))

        // Upload file with progress tracking
        const result = await uploadFile(file, {
          bucket: 'imports',
          folder: 'uploads',
          maxFileSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['.csv', '.xlsx', '.xls', '.json'],
          processImmediately: true, // Automatically process import files
          onProgress: (progress) => {
            setUploadProgress(prev => ({ ...prev, [uploadItem.id]: progress }))
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
          setSuccess(`Successfully uploaded ${file.name}`)
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
          setError(result.error || 'Upload failed')
          setUploads(prev => prev.map(item => 
            item.id === uploadItem.id 
              ? { ...item, status: 'failed', error: result.error }
              : item
          ))
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [])

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event.target.files)
    // Reset input
    event.target.value = ''
  }

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    handleFileUpload(event.dataTransfer.files)
  }, [handleFileUpload])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // Load user uploads
  const loadUserUploads = useCallback(async () => {
    try {
      const userUploads = await getUserUploads(20, 0)
      console.log('User uploads:', userUploads)
    } catch (error) {
      console.error('Failed to load uploads:', error)
    }
  }, [])

  // Delete upload
  const handleDeleteUpload = useCallback(async (uploadId: string) => {
    try {
      await deleteUpload(uploadId)
      setUploads(prev => prev.filter(item => item.uploadId !== uploadId))
      setSuccess('Upload deleted successfully')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete upload')
    }
  }, [])

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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Example</CardTitle>
          <CardDescription>
            Upload files to Supabase Storage with automatic processing for import files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error/Success Messages */}
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Upload Zone */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
            <p className="text-sm text-gray-500">
              Supports CSV, Excel, JSON • Max size: 10MB
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Upload Queue */}
          {uploads.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Upload Queue</h3>
              <div className="space-y-3">
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
                          {upload.status}
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
                            <span className="font-medium">Total Records:</span> {upload.metadata.totalRecords}
                          </div>
                          <div>
                            <span className="font-medium">Processed:</span> {upload.metadata.processedRecords}
                          </div>
                          <div>
                            <span className="font-medium text-green-600">Success:</span> {upload.metadata.successCount}
                          </div>
                          <div>
                            <span className="font-medium text-red-600">Errors:</span> {upload.metadata.errorCount}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-6">
            <Button
              onClick={loadUserUploads}
              variant="outline"
              disabled={isUploading}
            >
              Load My Uploads
            </Button>
            <Button
              onClick={() => setUploads([])}
              variant="outline"
              disabled={uploads.length === 0}
            >
              Clear Queue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 