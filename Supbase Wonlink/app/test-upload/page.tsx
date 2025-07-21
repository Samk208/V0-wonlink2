'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react'

export default function TestUploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setProgress(0)
    setResult(null)
    setError(null)

    try {
      // Simulate upload progress
      const simulateProgress = () => {
        let currentProgress = 0
        const interval = setInterval(() => {
          currentProgress += Math.random() * 20
          if (currentProgress >= 100) {
            currentProgress = 100
            clearInterval(interval)
            setResult({
              success: true,
              uploadId: `upload_${Date.now()}`,
              filePath: `uploads/${file.name}`,
              metadata: {
                fileSize: file.size,
                fileName: file.name,
                fileType: file.type
              }
            })
            setIsUploading(false)
          } else {
            setProgress(currentProgress)
          }
        }, 200)
      }

      simulateProgress()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setIsUploading(false)
    }
    
    // Reset input
    event.target.value = ''
  }

  const createTestFile = () => {
    const testContent = 'name,description,price\n"Test Product","Test Description",99.99'
    const file = new File([testContent], 'test-product.csv', { type: 'text/csv' })
    
    // Create a fake event to trigger file upload
    const event = {
      target: { files: [file] }
    } as React.ChangeEvent<HTMLInputElement>
    
    handleFileSelect(event)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Test</CardTitle>
          <CardDescription>
            Test the file upload utility with sample files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {result?.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File uploaded successfully! Upload ID: {result.uploadId}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Controls */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button onClick={createTestFile} disabled={isUploading}>
                <FileText className="w-4 h-4 mr-2" />
                Create Test CSV
              </Button>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Supported formats: CSV, Excel (.xlsx, .xls), JSON
            </p>
          </div>

          {/* Upload Result Details */}
          {result?.success && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">File Name:</span>
                    <span>{result.metadata.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">File Size:</span>
                    <span>{(result.metadata.fileSize / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">File Type:</span>
                    <span>{result.metadata.fileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Upload ID:</span>
                    <span className="font-mono text-xs">{result.uploadId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Storage Path:</span>
                    <span className="font-mono text-xs">{result.filePath}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 