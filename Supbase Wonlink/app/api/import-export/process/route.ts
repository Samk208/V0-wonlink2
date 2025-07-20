import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { SecureXLSXParser } from '@/lib/import-export/secure-xlsx-parser'
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

    const { uploadId } = await request.json()

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
        { status: 400 }
      )
    }

    // Get file upload record
    const { data: upload, error: uploadError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single()

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    if (upload.status !== 'uploaded') {
      return NextResponse.json(
        { error: 'File is not ready for processing' },
        { status: 400 }
      )
    }

    // Update status to processing
    await supabase
      .from('file_uploads')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString(),
        progress: 0
      })
      .eq('id', uploadId)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(upload.file_name)

    if (downloadError || !fileData) {
      await supabase
        .from('file_uploads')
        .update({ status: 'failed', error_details: { error: 'Failed to download file' } })
        .eq('id', uploadId)
      
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      )
    }

    // Parse file based on type
    let records: any[] = []
    const fileText = await fileData.text()

    try {
      if (upload.file_type === 'csv') {
        const parseResult = Papa.parse(fileText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_')
        })
        records = parseResult.data
      } else if (upload.file_type === 'xlsx') {
        const fileBuffer = await fileData.arrayBuffer()
        records = SecureXLSXParser.parseBuffer(fileBuffer, {
          maxRows: 10000,
          maxCols: 50,
          timeout: 30000
        })
      } else if (upload.file_type === 'json') {
        records = JSON.parse(fileText)
        if (!Array.isArray(records)) {
          throw new Error('JSON file must contain an array of products')
        }
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (parseError) {
      await supabase
        .from('file_uploads')
        .update({ 
          status: 'failed', 
          error_details: { error: `Failed to parse file: ${parseError}` }
        })
        .eq('id', uploadId)
      
      return NextResponse.json(
        { error: `Failed to parse file: ${parseError}` },
        { status: 400 }
      )
    }

    // Update total records count
    await supabase
      .from('file_uploads')
      .update({ total_records: records.length })
      .eq('id', uploadId)

    // Process records in batches
    let processedCount = 0
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE)
      const validProducts: ProductData[] = []
      
      // Validate each record in the batch
      for (const [index, record] of batch.entries()) {
        const rowNumber = i + index + 1
        
        try {
          // Map common field variations
          const mappedRecord = {
            name: record.name || record.product_name || record.title,
            description: record.description || record.desc,
            price: parseFloat(record.price || record.cost || record.amount || '0'),
            category: record.category || record.type,
            brand: record.brand || record.manufacturer,
            sku: record.sku || record.product_id || record.id,
            image_url: record.image_url || record.image || record.photo,
            tags: record.tags ? (Array.isArray(record.tags) ? record.tags : record.tags.split(',').map((t: string) => t.trim())) : [],
            availability: record.availability || record.status || 'in_stock',
            commission_rate: parseFloat(record.commission_rate || record.commission || '0')
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