import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('uploadId')
    const exportId = searchParams.get('exportId')

    if (uploadId) {
      // Get upload status
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

  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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