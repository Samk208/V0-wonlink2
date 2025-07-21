import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/security/middleware'
import { logger } from '@/lib/security/logger'
import { statusRequestSchema, refreshAnalyticsSchema } from '@/lib/security/validation-schemas'

async function getStatusHandler(request: NextRequest) {
  const supabase = createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { searchParams } = new URL(request.url)
  const uploadId = searchParams.get('uploadId')
  const exportId = searchParams.get('exportId')
  
  // Validate query parameters
  const validationResult = statusRequestSchema.safeParse({ uploadId, exportId })
  if (!validationResult.success) {
    logger.warn('Status request validation failed', {
      userId: user.id,
      errors: validationResult.error.errors,
      uploadId,
      exportId
    })
    throw new Error('Invalid request parameters')
  }
  
  logger.info('Status request received', {
    userId: user.id,
    uploadId,
    exportId,
    requestType: uploadId ? 'upload' : exportId ? 'export' : 'overview'
  })

  if (uploadId) {
    // Get upload status
    const { data: upload, error: uploadError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single()

    if (uploadError || !upload) {
      logger.warn('Upload not found', { userId: user.id, uploadId })
      throw new Error('Upload not found')
    }

      // Get associated errors if any
      let errors: any[] = []
      if (upload.error_count > 0) {
        const { data: importErrors } = await supabase
          .from('import_errors')
          .select('*')
          .eq('upload_id', uploadId)
          .order('row_number', { ascending: true })
          .limit(10)

        errors = importErrors || []
      }

      return NextResponse.json({
        success: true,
        status: {
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
          errors: errors.map(error => ({
            rowNumber: error.row_number,
            columnName: error.column_name,
            errorType: error.error_type,
            errorMessage: error.error_message,
            rawData: error.raw_data
          })),
          createdAt: upload.created_at,
          startedAt: upload.started_at,
          completedAt: upload.completed_at
        }
      })

    } else if (exportId) {
      // Get export status
      const { data: exportJob, error: exportError } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', exportId)
        .eq('user_id', user.id)
        .single()

      if (exportError || !exportJob) {
        return NextResponse.json(
          { error: 'Export not found' },
          { status: 404 }
        )
      }

      // Generate download URL if completed
      let downloadUrl: string | null = null
      if (exportJob.status === 'completed' && exportJob.file_name) {
        const { data: urlData } = await supabase.storage
          .from('exports')
          .createSignedUrl(`${user.id}/${exportJob.file_name}`, 3600) // 1 hour expiry
        
        downloadUrl = urlData?.signedUrl || null
      }

      return NextResponse.json({
        success: true,
        status: {
          id: exportJob.id,
          exportType: exportJob.export_type,
          fileFormat: exportJob.file_format,
          fileName: exportJob.file_name,
          status: exportJob.status,
          progress: exportJob.progress,
          totalRecords: exportJob.total_records,
          errorMessage: exportJob.error_message,
          downloadUrl,
          createdAt: exportJob.created_at,
          completedAt: exportJob.completed_at
        }
      })

    } else {
      // Get overview status
      const [uploadsResult, exportsResult, analyticsResult] = await Promise.all([
        supabase
          .from('file_uploads')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('export_jobs')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('import_export_analytics')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ])

      const recentUploads = uploadsResult.data || []
      const recentExports = exportsResult.data || []
      const analytics = analyticsResult.data

      return NextResponse.json({
        success: true,
        overview: {
          recentActivity: {
            uploads: recentUploads.map(u => ({ status: u.status })),
            exports: recentExports.map(e => ({ status: e.status }))
          },
          analytics: analytics ? {
            totalImports: analytics.total_imports,
            successfulImports: analytics.successful_imports,
            failedImports: analytics.failed_imports,
            totalProductsImported: analytics.total_products_imported,
            totalImportErrors: analytics.total_import_errors,
            totalExports: analytics.total_exports,
            successfulExports: analytics.successful_exports,
            avgFileSize: analytics.avg_file_size,
            lastImportDate: analytics.last_import_date,
            lastExportDate: analytics.last_export_date
          } : null
        }
      })
    }
  }

  return NextResponse.json({
    success: true,
    status: 'Request completed successfully'
  })
}

// Wrap GET handler with security middleware
export const GET = withSecurity(getStatusHandler, {
  rateLimit: { maxRequests: 200, windowMs: 60 * 60 * 1000 }, // 200 requests per hour
  requireAuth: true,
  validateInput: false, // Query params validated in handler
  enableCSRF: true
})

async function postStatusHandler(request: NextRequest) {
  const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()

    if (action === 'refresh_analytics') {
      // Refresh the materialized view
      const { error: refreshError } = await supabase.rpc('refresh_import_export_analytics')
      
      if (refreshError) {
        console.error('Analytics refresh error:', refreshError)
        return NextResponse.json(
          { error: 'Failed to refresh analytics' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Analytics refreshed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Status action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}