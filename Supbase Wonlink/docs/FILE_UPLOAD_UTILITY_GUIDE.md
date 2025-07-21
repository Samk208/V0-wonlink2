# File Upload Utility Guide

## Overview

The file upload utility provides a comprehensive solution for uploading files to Supabase Storage with automatic processing for import files (CSV, Excel, JSON). It integrates seamlessly with your existing import/export system.

## Features

✅ **File Upload to Supabase Storage**  
✅ **Automatic File Processing**  
✅ **Progress Tracking**  
✅ **Error Handling**  
✅ **Database Record Management**  
✅ **File Validation**  
✅ **Import/Export Integration**  
✅ **TypeScript Support**  

## Quick Start

### 1. Basic Usage

```typescript
import { uploadFile } from '@/lib/upload-utils'

const handleFileUpload = async (file: File) => {
  const result = await uploadFile(file, {
    bucket: 'imports',
    processImmediately: true
  })
  
  if (result.success) {
    console.log('Upload successful:', result.uploadId)
  } else {
    console.error('Upload failed:', result.error)
  }
}
```

### 2. With Progress Tracking

```typescript
const result = await uploadFile(file, {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`)
  },
  onError: (error) => {
    console.error('Upload error:', error)
  }
})
```

### 3. Advanced Configuration

```typescript
const result = await uploadFile(file, {
  bucket: 'imports',
  folder: 'uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.csv', '.xlsx', '.xls', '.json'],
  processImmediately: true,
  onProgress: (progress) => {
    // Update UI progress
  },
  onError: (error) => {
    // Handle error
  }
})
```

## API Reference

### `uploadFile(file: File, options?: UploadOptions): Promise<UploadResult>`

Uploads a file to Supabase Storage with optional processing.

#### Parameters

- `file`: The file to upload
- `options`: Configuration options

#### UploadOptions

```typescript
interface UploadOptions {
  bucket?: 'imports' | 'exports' | 'avatars' | 'campaigns' // Default: 'imports'
  folder?: string // Default: 'uploads'
  maxFileSize?: number // Default: 10MB
  allowedTypes?: string[] // Default: ['.csv', '.xlsx', '.xls', '.json', '.pdf', '.jpg', '.png']
  processImmediately?: boolean // Default: false
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}
```

#### UploadResult

```typescript
interface UploadResult {
  success: boolean
  uploadId?: string
  filePath?: string
  error?: string
  metadata?: {
    fileSize: number
    fileName: string
    fileType: string
    totalRecords?: number
    processedRecords?: number
    successCount?: number
    errorCount?: number
  }
}
```

### Additional Functions

#### `processUploadedFile(uploadId: string, file: File, onProgress?: (progress: number) => void)`

Process an already uploaded file for import.

#### `getUploadStatus(uploadId: string)`

Get the status and details of an upload.

#### `getUserUploads(limit?: number, offset?: number)`

Get all uploads for the current user.

#### `deleteUpload(uploadId: string)`

Delete an upload and its associated files.

## React Component Examples

### 1. Simple Upload Component

```tsx
import { uploadFile } from '@/lib/upload-utils'

export function SimpleUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    const result = await uploadFile(file, {
      processImmediately: true,
      onProgress: (progress) => {
        console.log(`Progress: ${progress}%`)
      }
    })
    
    setResult(result)
    setIsUploading(false)
  }

  return (
    <div>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      {result && (
        <div>
          {result.success ? 'Upload successful!' : `Error: ${result.error}`}
        </div>
      )}
    </div>
  )
}
```

### 2. Drag & Drop Upload

```tsx
export function DragDropUpload() {
  const [uploads, setUploads] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const handleDrop = async (event) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    
    setIsUploading(true)
    
    for (const file of Array.from(files)) {
      const result = await uploadFile(file, {
        processImmediately: true,
        onProgress: (progress) => {
          // Update progress for this file
        }
      })
      
      setUploads(prev => [...prev, { file, result }])
    }
    
    setIsUploading(false)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed p-8 text-center"
    >
      <p>Drag and drop files here</p>
      {isUploading && <p>Uploading...</p>}
    </div>
  )
}
```

### 3. Upload Queue with Progress

```tsx
export function UploadQueue() {
  const [queue, setQueue] = useState([])
  const [progress, setProgress] = useState({})

  const addToQueue = (files) => {
    const newItems = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }))
    
    setQueue(prev => [...prev, ...newItems])
  }

  const processQueue = async () => {
    for (const item of queue.filter(q => q.status === 'pending')) {
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'uploading' } : q
      ))
      
      const result = await uploadFile(item.file, {
        processImmediately: true,
        onProgress: (progress) => {
          setProgress(prev => ({ ...prev, [item.id]: progress }))
        }
      })
      
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'completed', result } : q
      ))
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => addToQueue(e.target.files)}
      />
      <button onClick={processQueue}>Process Queue</button>
      
      {queue.map(item => (
        <div key={item.id}>
          <span>{item.file.name}</span>
          <span>{item.status}</span>
          {item.status === 'uploading' && (
            <span>{progress[item.id] || 0}%</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

## Integration with Import/Export System

The file upload utility automatically integrates with your import/export system:

1. **Automatic Processing**: When `processImmediately: true`, import files are automatically processed
2. **Database Tracking**: All uploads are tracked in the `file_uploads` table
3. **Error Handling**: Import errors are stored in the `import_errors` table
4. **Progress Tracking**: Real-time progress updates during processing

### Example: Import Processing

```typescript
const result = await uploadFile(file, {
  processImmediately: true,
  onProgress: (progress) => {
    // Progress includes:
    // - Upload progress
    // - Processing progress
    // - Validation progress
    // - Import progress
  }
})

if (result.success && result.metadata) {
  console.log(`Imported ${result.metadata.successCount} records`)
  console.log(`Failed to import ${result.metadata.errorCount} records`)
}
```

## Error Handling

The utility provides comprehensive error handling:

```typescript
const result = await uploadFile(file, {
  onError: (error) => {
    // Handle upload errors
    console.error('Upload failed:', error)
  }
})

if (!result.success) {
  // Handle specific error types
  switch (result.error) {
    case 'FILE_TOO_LARGE':
      // Handle file size error
      break
    case 'INVALID_FILE_TYPE':
      // Handle file type error
      break
    case 'STORAGE_ERROR':
      // Handle storage error
      break
    default:
      // Handle other errors
  }
}
```

## Best Practices

### 1. File Validation

```typescript
// Always validate files before upload
const allowedTypes = ['.csv', '.xlsx', '.xls', '.json']
const maxSize = 10 * 1024 * 1024 // 10MB

const result = await uploadFile(file, {
  allowedTypes,
  maxFileSize: maxSize
})
```

### 2. Progress Feedback

```typescript
// Provide user feedback during upload
const result = await uploadFile(file, {
  onProgress: (progress) => {
    // Update UI progress bar
    setProgress(progress)
  }
})
```

### 3. Error Recovery

```typescript
// Implement retry logic for failed uploads
const uploadWithRetry = async (file: File, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    const result = await uploadFile(file)
    if (result.success) return result
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
  }
  
  throw new Error('Upload failed after retries')
}
```

### 4. Batch Processing

```typescript
// Process multiple files efficiently
const processBatch = async (files: File[]) => {
  const results = []
  
  for (const file of files) {
    const result = await uploadFile(file, {
      processImmediately: true
    })
    results.push(result)
  }
  
  return results
}
```

## Database Schema

The utility uses these database tables:

### `file_uploads`
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users)
- `file_name`: TEXT
- `original_name`: TEXT
- `file_size`: BIGINT
- `file_type`: TEXT
- `mime_type`: TEXT
- `storage_path`: TEXT
- `status`: TEXT (uploaded, processing, completed, failed)
- `progress`: INTEGER
- `total_records`: INTEGER
- `processed_records`: INTEGER
- `success_count`: INTEGER
- `error_count`: INTEGER
- `error_details`: JSONB
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### `import_errors`
- `id`: UUID (Primary Key)
- `file_upload_id`: UUID (References file_uploads)
- `row_number`: INTEGER
- `column_name`: TEXT
- `error_message`: TEXT
- `raw_data`: JSONB
- `created_at`: TIMESTAMP

## Storage Buckets

The utility supports multiple storage buckets:

- `imports`: For import files (CSV, Excel, JSON)
- `exports`: For exported files
- `avatars`: For user profile images
- `campaigns`: For campaign assets

## Security

- **Row Level Security**: All database operations are protected by RLS
- **File Validation**: Files are validated before upload
- **User Isolation**: Users can only access their own uploads
- **Storage Policies**: Supabase storage policies ensure secure access

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size and type restrictions
2. **Processing Fails**: Verify file format and data structure
3. **Permission Errors**: Ensure user is authenticated
4. **Storage Quota**: Check Supabase storage limits

### Debug Mode

```typescript
// Enable detailed logging
const result = await uploadFile(file, {
  onError: (error) => {
    console.error('Upload error details:', error)
  }
})
```

## Migration from Existing Code

If you have existing upload code, you can easily migrate:

```typescript
// Old way
const { data, error } = await supabase.storage
  .from('bucket')
  .upload('path', file)

// New way
const result = await uploadFile(file, {
  bucket: 'bucket',
  folder: 'path'
})
```

The new utility provides better error handling, progress tracking, and integration with your import/export system. 