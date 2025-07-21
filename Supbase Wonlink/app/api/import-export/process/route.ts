import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { SecureXLSXParser } from '@/lib/security/secure-xlsx-parser'
import { withSecurity, API_RATE_LIMIT } from '@/lib/security/middleware'
import { ValidationSchemas } from '@/lib/security/validation-schemas'
import { logger, logDataProcessing, logSecurityViolation } from '@/lib/security/logger'
import { z } from 'zod'

// Product validation schema
const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
  commission_rate: z.number().min(0).max(100).optional()
})

type ProductData = z.infer<typeof ProductSchema>

const BATCH_SIZE = 100

// Secure POST handler with comprehensive security measures
const securePostHandler = async (request: NextRequest, context: any) => {
  const requestId = logger.generateRequestId()
  const { user, validatedData } = context
  const { uploadId, options = {} } = validatedData
  
  try {
    const supabase = createClient()

    // uploadId is already validated by middleware

    // Get file upload record with security checks
    const { data: upload, error: uploadError } = await supabase
      .from('file_uploads')
      .select(`
        id,
        user_id,
        file_name,
        original_name,
        file_size,
        file_type,
        mime_type,
        storage_path,
        upload_type,
        status,
        security_scan_status,
        created_at
      `)
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single()

    if (uploadError || !upload) {
      await logSecurityViolation('Attempt to process non-existent or unauthorized upload', user.id, {
        uploadId,
        requestId
      })
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    if (upload.status !== 'uploaded') {
      await logSecurityViolation('Attempt to process file not in uploaded status', user.id, {
        uploadId,
        currentStatus: upload.status,
        requestId
      })
      return NextResponse.json(
        { error: 'File is not ready for processing' },
        { status: 400 }
      )
    }

    // Additional security check for scan status
    if (upload.security_scan_status === 'failed') {
      await logSecurityViolation('Attempt to process file that failed security scan', user.id, {
        uploadId,
        requestId
      })
      return NextResponse.json(
        { error: 'File failed security validation' },
        { status: 400 }
      )
    }

    // Update status to processing with security metadata
    await supabase
      .from('file_uploads')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString(),
        progress: 0,
        processing_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        processing_user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .eq('id', uploadId)

    await logger.info('File processing started', {
      uploadId,
      filename: upload.original_name,
      fileSize: upload.file_size,
      userId: user.id,
      requestId
    })

    // Download file from storage with timeout protection
    const downloadTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Download timeout')), 30000) // 30 second timeout
    })

    let fileData
    try {
      const downloadPromise = supabase.storage
        .from('imports')
        .download(upload.file_name)
      
      const result = await Promise.race([downloadPromise, downloadTimeout]) as { data: Blob | null; error: any }
      fileData = result.data
      
      if (result.error || !fileData) {
        throw new Error(result.error?.message || 'Failed to download file')
      }
    } catch (downloadError) {
      await logger.error('File download failed', downloadError, {
        uploadId,
        filename: upload.file_name,
        userId: user.id,
        requestId
      })
      
      await supabase
        .from('file_uploads')
        .update({ 
          status: 'failed', 
          error_details: { error: 'Failed to download file', timestamp: new Date().toISOString() }
        })
        .eq('id', uploadId)
      
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      )
    }

    // Secure file parsing with comprehensive validation
    let records: any[] = []
    const maxFileSize = 50 * 1024 * 1024 // 50MB text limit
    
    try {
      if (upload.file_type === 'csv') {
        const fileText = await fileData.text()
        
        if (fileText.length > maxFileSize) {
          throw new Error('File content too large for processing')
        }
        
        const parseResult = Papa.parse(fileText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => {
            // Secure header transformation
            return header
              .trim()
              .toLowerCase()
              .replace(/[<>"'&]/g, '') // Remove dangerous chars
              .replace(/\s+/g, '_')
              .replace(/[^a-zA-Z0-9_]/g, '') // Keep only safe chars
              .substring(0, 50) // Limit length
          },
          transform: (value: string) => {
            // Prevent CSV injection
            if (typeof value === 'string' && /^[=+\-@]/.test(value.trim())) {
              return "'" + value // Prefix with quote
            }
            return value?.substring(0, 1000) // Limit cell length
          }
        })
        
        if (parseResult.errors && parseResult.errors.length > 0) {
          throw new Error(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`)
        }
        
        records = parseResult.data.slice(0, options.maxRows || 10000) // Limit rows
        
      } else if (upload.file_type === 'xlsx') {
        const fileBuffer = await fileData.arrayBuffer()
        
        if (fileBuffer.byteLength > maxFileSize) {
          throw new Error('File too large for processing')
        }
        
        records = await SecureXLSXParser.parseBuffer(fileBuffer, {
          maxRows: options.maxRows || 10000,
          maxCols: 100,
          maxCellLength: 1000,
          timeout: 60000 // 1 minute timeout
        })
        
      } else if (upload.file_type === 'json') {
        const fileText = await fileData.text()
        
        if (fileText.length > maxFileSize) {
          throw new Error('File content too large for processing')
        }
        
        const parsedJson = JSON.parse(fileText)
        
        if (!Array.isArray(parsedJson)) {
          throw new Error('JSON file must contain an array of records')
        }
        
        records = parsedJson.slice(0, options.maxRows || 10000) // Limit rows
        
      } else {
        throw new Error(`Unsupported file type: ${upload.file_type}`)
      }
      
      // Additional validation
      if (records.length === 0) {
        throw new Error('No valid records found in file')
      }
      
      if (records.length > 50000) {
        throw new Error('File contains too many records (max 50,000)')
      }
      
    } catch (parseError) {
      await logger.error('File parsing failed', parseError, {
        uploadId,
        filename: upload.original_name,
        fileType: upload.file_type,
        userId: user.id,
        requestId
      })
      
      await supabase
        .from('file_uploads')
        .update({ 
          status: 'failed', 
          error_details: { 
            error: `Failed to parse file: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', uploadId)
      
      return NextResponse.json(
        { error: `Failed to parse file: ${parseError instanceof Error ? parseError.message : String(parseError)}` },
        { status: 400 }
      )
    }

    // Update total records count with security metadata
    await supabase
      .from('file_uploads')
      .update({ 
        total_records: records.length,
        processing_started_at: new Date().toISOString()
      })
      .eq('id', uploadId)

    await logger.info('Starting batch processing', {
      uploadId,
      totalRecords: records.length,
      batchSize: options.batchSize || BATCH_SIZE,
      userId: user.id,
      requestId
    })

    // Process records in secure batches
    let processedCount = 0
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []
    const batchSize = Math.min(options.batchSize || BATCH_SIZE, 500) // Limit batch size

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const validProducts: ProductData[] = []
      
      // Validate each record in the batch with enhanced security
      for (const [index, record] of batch.entries()) {
        const rowNumber = i + index + 1
        
        try {
          // Sanitize and validate input data
          const mappedRecord = {
            name: String(record.name || record.product_name || record.title || '').trim().substring(0, 255),
            description: String(record.description || record.desc || '').trim().substring(0, 2000),
            price: Math.max(0, Math.min(999999.99, parseFloat(record.price || record.cost || record.amount || '0') || 0)),
            category: String(record.category || record.type || '').trim().substring(0, 100),
            brand: String(record.brand || record.manufacturer || '').trim().substring(0, 100),
            sku: String(record.sku || record.product_id || record.id || '').trim().substring(0, 50).replace(/[^A-Za-z0-9-_]/g, ''),
            image_url: String(record.image_url || record.image || record.photo || '').trim().substring(0, 2048),
            tags: Array.isArray(record.tags) 
              ? record.tags.slice(0, 20).map((t: any) => String(t).trim().substring(0, 50))
              : String(record.tags || '').split(',').slice(0, 20).map((t: string) => t.trim().substring(0, 50)).filter(Boolean),
            availability: ['in_stock', 'out_of_stock', 'discontinued'].includes(record.availability || record.status) 
              ? record.availability || record.status 
              : 'in_stock',
            commission_rate: Math.max(0, Math.min(100, parseFloat(record.commission_rate || record.commission || '0') || 0))
          }

          const validatedProduct = ProductSchema.parse(mappedRecord)
          validProducts.push(validatedProduct)
        } catch (validationError) {
          errorCount++
          
          // Store error details
          await supabase
            .from('import_errors')
            .insert({
              upload_id: uploadId,
              row_number: rowNumber,
              error_type: 'validation',
              error_message: validationError instanceof z.ZodError 
                ? validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
                : String(validationError),
              raw_data: record
            })

          errors.push({
            row: rowNumber,
            error: validationError instanceof z.ZodError 
              ? validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
              : String(validationError),
            data: record
          })
        }
      }

      // Insert valid products using the bulk insert function
      if (validProducts.length > 0) {
        try {
          const { data: insertResult } = await supabase.rpc('bulk_insert_products', {
            products_data: JSON.stringify(validProducts),
            batch_id: uploadId,
            user_id: user.id
          })

          if (insertResult && insertResult.length > 0) {
            const result = insertResult[0]
            successCount += result.success_count || 0
            errorCount += result.error_count || 0
            
            // Store any database insertion errors
            if (result.errors && result.errors.length > 0) {
              for (const error of result.errors) {
                await supabase
                  .from('import_errors')
                  .insert({
                    upload_id: uploadId,
                    row_number: processedCount + 1,
                    error_type: 'database',
                    error_message: error.error,
                    raw_data: error.product
                  })
              }
            }
          }
        } catch (insertError) {
          console.error('Bulk insert error:', insertError)
          errorCount += validProducts.length
          
          await supabase
            .from('import_errors')
            .insert({
              upload_id: uploadId,
              row_number: i + 1,
              error_type: 'database',
              error_message: String(insertError),
              raw_data: { batch: validProducts }
            })
        }
      }

      processedCount += batch.length
      const progress = Math.round((processedCount / records.length) * 100)

      // Update progress
      await supabase
        .from('file_uploads')
        .update({
          progress,
          processed_records: processedCount,
          success_count: successCount,
          error_count: errorCount
        })
        .eq('id', uploadId)
    }

    // Mark as completed
    await supabase
      .from('file_uploads')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        processed_records: processedCount,
        success_count: successCount,
        error_count: errorCount,
        error_details: errors.length > 0 ? { errors: errors.slice(0, 10) } : null // Store first 10 errors
      })
      .eq('id', uploadId)

    return NextResponse.json({
      success: true,
      result: {
        totalRecords: records.length,
        processedRecords: processedCount,
        successCount,
        errorCount,
        hasErrors: errorCount > 0,
        sampleErrors: errors.slice(0, 5) // Return first 5 errors as samples
      }
    })

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}