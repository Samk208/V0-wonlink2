import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { withSecurity, API_RATE_LIMIT } from '@/lib/security/middleware'
import { ValidationSchemas } from '@/lib/security/validation-schemas'
import { logger, logDataProcessing, logSecurityViolation } from '@/lib/security/logger'
import { z } from 'zod'

// Export validation schema
const ExportRequestSchema = z.object({
  exportType: z.enum(['products', 'campaigns', 'analytics']),
  format: z.enum(['csv', 'xlsx', 'json']),
  filters: z.object({
    category: z.string().max(100).optional(),
    availability: z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
    status: z.string().max(50).optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().max(999999.99).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional()
  }).optional().default({}),
  columns: z.array(z.string().max(50)).max(50).optional().default([])
})

// Secure XLSX generation (replacement for vulnerable xlsx package)
function generateSecureXLSX(data: any[], sheetName: string): Buffer {
  // For now, we'll generate CSV and return it as XLSX alternative
  // In production, implement a secure XLSX library or service
  const csv = Papa.unparse(data)
  return Buffer.from(csv, 'utf-8')
}

// Secure POST handler for data export
const securePostHandler = async (request: NextRequest, context: any) => {
  const requestId = logger.generateRequestId()
  const { user, validatedData } = context
  const { exportType, format, filters, columns } = validatedData
  
  try {
    const supabase = createClient()

    // Create export job record with security metadata
    const { data: exportJob, error: jobError } = await supabase
      .from('export_jobs')
      .insert({
        user_id: user.id,
        export_type: exportType,
        file_format: format,
        filters,
        columns,
        status: 'processing',
        progress: 0,
        request_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (jobError) {
      await logger.error('Failed to create export job', jobError, {
        exportType,
        format,
        userId: user.id,
        requestId
      })
      return NextResponse.json(
        { error: 'Failed to create export job' },
        { status: 500 }
      )
    }

    await logger.info('Export job created', {
      exportJobId: exportJob.id,
      exportType,
      format,
      userId: user.id,
      requestId
    })

    let data: any[] = []
    let fileName = ''

    try {
      // Fetch data based on export type
      if (exportType === 'products') {
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            category,
            brand,
            sku,
            image_url,
            tags,
            availability,
            commission_rate,
            created_at,
            updated_at
          `)
          .eq('brand_id', user.id)

        // Apply filters
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.availability) {
          query = query.eq('availability', filters.availability)
        }
        if (filters.priceMin) {
          query = query.gte('price', filters.priceMin)
        }
        if (filters.priceMax) {
          query = query.lte('price', filters.priceMax)
        }
        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom)
        }
        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo)
        }

        const { data: products, error: productsError } = await query

        if (productsError) {
          throw new Error(`Failed to fetch products: ${productsError.message}`)
        }

        data = products || []
        fileName = `products_export_${Date.now()}`

      } else if (exportType === 'campaigns') {
        let query = supabase
          .from('campaigns')
          .select(`
            id,
            title,
            description,
            budget,
            status,
            start_date,
            end_date,
            application_deadline,
            tags,
            created_at,
            updated_at,
            campaign_applications (
              count
            )
          `)
          .eq('brand_id', user.id)

        // Apply filters
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom)
        }
        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo)
        }

        const { data: campaigns, error: campaignsError } = await query

        if (campaignsError) {
          throw new Error(`Failed to fetch campaigns: ${campaignsError.message}`)
        }

        data = campaigns || []
        fileName = `campaigns_export_${Date.now()}`

      } else if (exportType === 'analytics') {
        // Fetch analytics data
        const { data: analytics, error: analyticsError } = await supabase
          .from('import_export_analytics')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (analyticsError) {
          throw new Error(`Failed to fetch analytics: ${analyticsError.message}`)
        }

        data = analytics ? [analytics] : []
        fileName = `analytics_export_${Date.now()}`

      } else {
        throw new Error('Invalid export type')
      }

      // Update progress
      await supabase
        .from('export_jobs')
        .update({ 
          progress: 50,
          total_records: data.length 
        })
        .eq('id', exportJob.id)

      // Filter columns if specified with security validation
      if (columns.length > 0) {
        const safeColumns = columns.filter((col: string) => 
          typeof col === 'string' && 
          col.length <= 50 && 
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col) // Safe column names only
        )
        
        data = data.map(item => {
          const filteredItem: any = {}
          safeColumns.forEach((col: string) => {
            if (item.hasOwnProperty(col)) {
              filteredItem[col] = item[col]
            }
          })
          return filteredItem
        })
      }

      // Limit export size for security
      if (data.length > 10000) {
        data = data.slice(0, 10000) // Limit to 10k records
        await logger.warn('Export data truncated due to size limit', {
          originalCount: data.length,
          truncatedCount: 10000,
          exportJobId: exportJob.id,
          userId: user.id,
          requestId
        })
      }

      // Generate file content based on format with security measures
      let fileContent: Buffer
      let mimeType: string
      let fileExtension: string

      if (format === 'csv') {
        const csv = Papa.unparse(data, {
          header: true,
          delimiter: ',',
          newline: '\n',
          skipEmptyLines: true
        })
        fileContent = Buffer.from(csv, 'utf-8')
        mimeType = 'text/csv'
        fileExtension = 'csv'
      } else if (format === 'xlsx') {
        // Use secure CSV format instead of vulnerable XLSX
        const csv = Papa.unparse(data)
        fileContent = Buffer.from(csv, 'utf-8')
        mimeType = 'text/csv' // Return as CSV for security
        fileExtension = 'csv'
        
        await logger.warn('XLSX export converted to CSV for security', {
          exportJobId: exportJob.id,
          userId: user.id,
          requestId
        })
      } else { // json
        const jsonString = JSON.stringify(data, null, 2)
        if (jsonString.length > 50 * 1024 * 1024) { // 50MB limit
          throw new Error('Export data too large')
        }
        fileContent = Buffer.from(jsonString, 'utf-8')
        mimeType = 'application/json'
        fileExtension = 'json'
      }

      const fullFileName = `${fileName}.${fileExtension}`
      const storagePath = `exports/${user.id}/${fullFileName}`

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exports')
        .upload(`${user.id}/${fullFileName}`, fileContent, {
          contentType: mimeType,
          duplex: 'half'
        })

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`)
      }

      // Update export job as completed
      await supabase
        .from('export_jobs')
        .update({
          status: 'completed',
          progress: 100,
          file_name: fullFileName,
          storage_path: storagePath,
          completed_at: new Date().toISOString()
        })
        .eq('id', exportJob.id)

      // Get download URL
      const { data: urlData } = await supabase.storage
        .from('exports')
        .createSignedUrl(`${user.id}/${fullFileName}`, 3600) // 1 hour expiry

      return NextResponse.json({
        success: true,
        export: {
          id: exportJob.id,
          fileName: fullFileName,
          format,
          recordCount: data.length,
          downloadUrl: urlData?.signedUrl,
          expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }
      })

    } catch (error) {
      await logger.error('Export processing failed', error, {
        exportJobId: exportJob?.id,
        exportType,
        format,
        userId: user.id,
        requestId
      })
      
      // Update export job as failed
      if (exportJob) {
        await supabase
          .from('export_jobs')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : String(error),
            failed_at: new Date().toISOString()
          })
          .eq('id', exportJob.id)
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Export failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    await logger.error('Export API error', error, {
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
  rateLimit: { windowMs: 60 * 60 * 1000, maxRequests: 10, message: 'Export rate limit exceeded' }, // 10 exports per hour
  validateCSRF: true,
  inputValidation: ExportRequestSchema
})

// Secure GET handler for export history
const secureGetHandler = async (request: NextRequest, context: any) => {
  const requestId = logger.generateRequestId()
  const { user } = context
  
  try {
    const supabase = createClient()
    
    // Parse query parameters
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
    const status = url.searchParams.get('status')
    
    // Build query with security filters
    let query = supabase
      .from('export_jobs')
      .select(`
        id,
        export_type,
        file_format,
        file_name,
        status,
        progress,
        total_records,
        error_message,
        created_at,
        started_at,
        completed_at,
        failed_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    // Apply status filter
    if (status && ['processing', 'completed', 'failed'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: exports, error, count } = await query

    if (error) {
      await logger.error('Failed to fetch export jobs', error, {
        userId: user.id,
        requestId
      })
      return NextResponse.json(
        { error: 'Failed to fetch exports' },
        { status: 500 }
      )
    }

    // Log access for audit trail
    await logger.info('Export history accessed', {
      userId: user.id,
      page,
      limit,
      resultCount: exports?.length || 0,
      requestId
    })

    return NextResponse.json({
      success: true,
      exports: exports?.map(exp => ({
        id: exp.id,
        exportType: exp.export_type,
        fileFormat: exp.file_format,
        fileName: exp.file_name,
        status: exp.status,
        progress: exp.progress,
        totalRecords: exp.total_records,
        errorMessage: exp.error_message,
        createdAt: exp.created_at,
        startedAt: exp.started_at,
        completedAt: exp.completed_at,
        failedAt: exp.failed_at
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (exports?.length || 0) === limit
      }
    })

  } catch (error) {
    await logger.error('Get exports handler error', error, {
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