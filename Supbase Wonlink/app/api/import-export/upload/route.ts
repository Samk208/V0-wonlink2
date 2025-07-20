import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json']
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.json']

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension) || !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: CSV, Excel (.xlsx), JSON' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtensionClean = fileExtension.replace('.', '')
    const fileName = `${user.id}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const storagePath = `imports/${fileName}`

    // Convert file to buffer for Supabase storage
    const fileBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(fileBuffer)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('imports')
      .upload(fileName, uint8Array, {
        contentType: file.type,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Create file upload record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert({
        user_id: user.id,
        file_name: fileName,
        original_name: file.name,
        file_size: file.size,
        file_type: fileExtensionClean,
        mime_type: file.type,
        storage_path: storagePath,
        status: 'uploaded',
        progress: 0,
        total_records: 0,
        processed_records: 0,
        success_count: 0,
        error_count: 0
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('imports').remove([fileName])
      return NextResponse.json(
        { error: 'Failed to create file record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      upload: {
        id: fileRecord.id,
        fileName: fileRecord.original_name,
        fileSize: fileRecord.file_size,
        fileType: fileRecord.file_type,
        status: fileRecord.status,
        progress: fileRecord.progress,
        createdAt: fileRecord.created_at
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's recent uploads
    const { data: uploads, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch uploads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      uploads: uploads.map(upload => ({
        id: upload.id,
        fileName: upload.original_name,
        fileSize: upload.file_size,
        fileType: upload.file_type,
        status: upload.status,
        progress: upload.progress,
        totalRecords: upload.total_records,
        processedRecords: upload.processed_records,
        successCount: upload.success_count,
        errorCount: upload.error_count,
        createdAt: upload.created_at,
        startedAt: upload.started_at,
        completedAt: upload.completed_at
      }))
    })

  } catch (error) {
    console.error('Get uploads error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}