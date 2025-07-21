'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Upload } from 'lucide-react'
import { uploadFile } from '@/lib/upload-utils'

export function SimpleUploadExample() {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setResult(null)

    try {
      const uploadResult = await uploadFile(file, {
        bucket: 'imports',
        folder: 'uploads',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['.csv', '.xlsx', '.xls', '.json'],
        processImmediately: true, // Automatically process import files
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`)
        },
        onError: (error) => {
          console.error('Upload error:', error)
        }
      })

      if (uploadResult.success) {
        setResult({
          success: true,
          message: `File "${file.name}" uploaded successfully! Upload ID: ${uploadResult.uploadId}`
        })
        
        // Log metadata if available
        if (uploadResult.metadata) {
          console.log('Upload metadata:', uploadResult.metadata)
        }
      } else {
        setResult({
          success: false,
          message: uploadResult.error || 'Upload failed'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      })
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ''
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Simple File Upload</CardTitle>
        <CardDescription>
          Basic example of using the file upload utility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Result Messages */}
        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : ''}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className={result.success ? 'text-green-800' : ''}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <div className="text-center">
          <Button
            onClick={() => document.getElementById('simple-file-input')?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </>
            )}
          </Button>
          
          <input
            id="simple-file-input"
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-gray-500 mt-2">
            Supports CSV, Excel, JSON • Max 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 