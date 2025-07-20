import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

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

    const { 
      exportType, 
      format, 
      filters = {}, 
      columns = [] 
    } = await request.json()

    if (!exportType || !format) {
      return NextResponse.json(
        { error: 'Export type and format are required' },
        { status: 400 }
      )
    }

    if (!['csv', 'xlsx', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: csv, xlsx, json' },
        { status: 400 }
      )
    }

    // Create export job record
    const { data: exportJob, error: jobError } = await supabase
      .from('export_jobs')
      .insert({
        user_id: user.id,
        export_type: exportType,
        file_format: format,
        filters,
        columns,
        status: 'processing',
        progress: 0
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json(
        { error: 'Failed to create export job' },
        { status: 500 }
      )
    }

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

      // Filter columns if specified
      if (columns.length > 0) {
        data = data.map(item => {
          const filtered: any = {}
          columns.forEach(col => {
            if (col in item) {
              filtered[col] = item[col]
            }
          })
          return filtered
        })
      }

      // Generate file content based on format
      let fileContent: Buffer
      let mimeType: string
      let fileExtension: string

      if (format === 'csv') {
        const csv = Papa.unparse(data)
        fileContent = Buffer.from(csv, 'utf-8')
        mimeType = 'text/csv'
        fileExtension = 'csv'
      } else if (format === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, exportType)
        
        const excelBuffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'buffer' 
        })
        fileContent = excelBuffer
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
      } else { // json
        fileContent = Buffer.from(JSON.stringify(data, null, 2), 'utf-8')
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
      console.error('Export error:', error)
      
      // Update export job as failed
      await supabase
        .from('export_jobs')
        .update({
          status: 'failed',
          error_message: String(error)
        })
        .eq('id', exportJob.id)

      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Export API error:', error)
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

    // Get user's export jobs
    const { data: exports, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch exports' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      exports: exports.map(exp => ({
        id: exp.id,
        exportType: exp.export_type,
        fileFormat: exp.file_format,
        fileName: exp.file_name,
        status: exp.status,
        progress: exp.progress,
        totalRecords: exp.total_records,
        errorMessage: exp.error_message,
        createdAt: exp.created_at,
        completedAt: exp.completed_at
      }))
    })

  } catch (error) {
    console.error('Get exports error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}