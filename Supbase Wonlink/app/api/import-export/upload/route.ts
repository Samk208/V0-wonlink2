import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withSecurity, UPLOAD_RATE_LIMIT, validateFile, generateSecureFilename } from '@/lib/security/middleware'
import { ValidationSchemas } from '@/lib/security/validation-schemas'
import { logger, logFileUpload, logSecurityViolation } from '@/lib/security/logger'
import { SecureXLSXParser } from '@/lib/security/secure-xlsx-parser'

// Secure file upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json']
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.json']

// File type magic numbers for validation
const FILE_SIGNATURES = {
  'text/csv': null, // CSV doesn't have a specific signature
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4B], // ZIP signature
  'application/json': [0x7B, 0x5B] // { or [ for JSON
}

// Secure POST handler with comprehensive security measures
const securePostHandler = async (request: NextRequest, context: any) => {
  const requestId = logger.generateRequestId()
  const { user } = context
  
  try {
    const supabase = createClient()
    
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('uploadType') as string || 'products'
    
    if (!file) {
      await logSecurityViolation('File upload attempted without file', user.id, { requestId })
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Comprehensive file validation
    const fileValidation = validateFile(file, {
      maxSize: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_TYPES,
      allowedExtensions: ALLOWED_EXTENSIONS,
      requireMagicNumber: true
    })

    if (!fileValidation.success) {
      await logSecurityViolation(`Invalid file upload attempt: ${fileValidation.error}`, user.id, {
        filename: file.name,
        fileSize: file.size,
        fileType: file.type,
        requestId
      })
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      )
    }

    // Additional security checks for XLSX files
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const fileBuffer = await file.arrayBuffer()
      const xlsxValidation = await SecureXLSXParser.validateFile(fileBuffer)
      
      if (!xlsxValidation.valid) {
        await logSecurityViolation(`XLSX validation failed: ${xlsxValidation.error}`, user.id, {
          filename: file.name,
          requestId
        })
        return NextResponse.json(
          { error: `File validation failed: ${xlsxValidation.error}` },
          { status: 400 }
        )
      }
    }

    // Generate secure filename
    const fileName = generateSecureFilename(user.id, file.name)
    const storagePath = `imports/${fileName}`

    // Convert file to buffer for Supabase storage
    const fileBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(fileBuffer)

    // Upload file to Supabase Storage with security metadata
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('imports')
      .upload(fileName, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false // Prevent overwriting
      })

    if (uploadError) {
      await logger.error('Storage upload failed', uploadError, {
        filename: file.name,
        userId: user.id,
        requestId
      })
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Create file upload record in database with security metadata
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert({
        user_id: user.id,
        file_name: fileName,
        original_name: file.name,
        file_size: file.size,
        file_type: file.name.split('.').pop()?.toLowerCase(),
        mime_type: file.type,
        storage_path: storagePath,
        upload_type: uploadType,
        status: 'uploaded',
        progress: 0,
        total_records: 0,
        processed_records: 0,
        success_count: 0,
        error_count: 0,
        security_scan_status: 'pending',
        upload_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single()

    if (dbError) {
      await logger.error('Database insert failed', dbError, {
        filename: file.name,
        userId: user.id,
        requestId
      })
      
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('imports').remove([fileName])
      return NextResponse.json(
        { error: 'Failed to create file record' },
        { status: 500 }
      )
    }

    // Log successful upload
    await logFileUpload(user.id, file.name, file.size, file.type, true, {
      uploadId: fileRecord.id,
      uploadType,
      requestId
    })

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
    await logger.error('Upload handler error', error, {
      userId: user?.id,
      requestId
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const POST = withSecurity(securePostHandler, {
  requireAuth: true,
  rateLimit: UPLOAD_RATE_LIMIT,
  validateCSRF: true
})

// Secure GET handler for fetching upload history
const secureGetHandler = async (request: NextRequest, context: any) => {
  const requestId = logger.generateRequestId()
  const { user } = context
  
  try {
    const supabase = createClient()
    
    // Parse query parameters with validation
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')))
    const status = url.searchParams.get('status')
    const uploadType = url.searchParams.get('type')
    
    // Build query with filters
    let query = supabase
      .from('file_uploads')
      .select(`
        id,
        original_name,
        file_size,
        file_type,
        upload_type,
        status,
        progress,
        total_records,
        processed_records,
        success_count,
        error_count,
        security_scan_status,
        created_at,
        started_at,
        completed_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    // Apply filters
    if (status && ['uploaded', 'processing', 'completed', 'failed'].includes(status)) {
      query = query.eq('status', status)
    }
    
    if (uploadType && ['products', 'campaigns', 'users'].includes(uploadType)) {
      query = query.eq('upload_type', uploadType)
    }

    const { data: uploads, error, count } = await query

    if (error) {
      await logger.error('Failed to fetch uploads', error, {
        userId: user.id,
        requestId
      })
      return NextResponse.json(
        { error: 'Failed to fetch uploads' },
        { status: 500 }
      )
    }

    // Log access for audit trail
    await logger.info('Upload history accessed', {
      userId: user.id,
      page,
      limit,
      resultCount: uploads?.length || 0,
      requestId
    })

    return NextResponse.json({
      success: true,
      uploads: uploads?.map(upload => ({
        id: upload.id,
        fileName: upload.original_name,
        fileSize: upload.file_size,
        fileType: upload.file_type,
        uploadType: upload.upload_type,
        status: upload.status,
        progress: upload.progress,
        totalRecords: upload.total_records,
        processedRecords: upload.processed_records,
        successCount: upload.success_count,
        errorCount: upload.error_count,
        securityScanStatus: upload.security_scan_status,
        createdAt: upload.created_at,
        startedAt: upload.started_at,
        completedAt: upload.completed_at
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (uploads?.length || 0) === limit
      }
    })

  } catch (error) {
    await logger.error('Get uploads handler error', error, {
      userId: user?.id,
      requestId
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = withSecurity(secureGetHandler, {
  requireAuth: true,
  rateLimit: { windowMs: 60 * 1000, maxRequests: 60, message: 'Too many requests' } // 60 requests per minute
})