import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Template data for different file types
const PRODUCT_TEMPLATE_DATA = [
  {
    name: "Sample Product Name",
    description: "Detailed product description",
    price: 29.99,
    category: "Fashion",
    brand: "Your Brand",
    sku: "SKU-001",
    image_url: "https://example.com/image.jpg",
    tags: "summer,trendy,popular",
    availability: "in_stock",
    commission_rate: 15.0
  },
  {
    name: "Another Product Example",
    description: "Another example product with all fields",
    price: 45.50,
    category: "Beauty",
    brand: "Beauty Brand",
    sku: "SKU-002",
    image_url: "https://example.com/image2.jpg",
    tags: "beauty,skincare",
    availability: "in_stock",
    commission_rate: 20.0
  }
]

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
    const format = searchParams.get('format') || 'csv'
    const type = searchParams.get('type') || 'products'

    if (!['csv', 'xlsx', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: csv, xlsx, json' },
        { status: 400 }
      )
    }

    if (type !== 'products') {
      return NextResponse.json(
        { error: 'Only products templates are currently supported' },
        { status: 400 }
      )
    }

    try {
      let fileContent: Buffer
      let mimeType: string
      let fileName: string

      if (format === 'csv') {
        const csv = Papa.unparse(PRODUCT_TEMPLATE_DATA)
        fileContent = Buffer.from(csv, 'utf-8')
        mimeType = 'text/csv'
        fileName = 'product_import_template.csv'
      } else if (format === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(PRODUCT_TEMPLATE_DATA)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
        
        // Add some styling and comments
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        
        // Add header styling
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
          if (worksheet[cellRef]) {
            worksheet[cellRef].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "E7E6E6" } }
            }
          }
        }

        const excelBuffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'buffer'
        })
        fileContent = excelBuffer
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileName = 'product_import_template.xlsx'
      } else { // json
        const templateWithInstructions = {
          instructions: {
            description: "Product Import Template",
            required_fields: ["name", "price", "category"],
            optional_fields: ["description", "brand", "sku", "image_url", "tags", "availability", "commission_rate"],
            field_descriptions: {
              name: "Product name (required)",
              description: "Product description (optional)",
              price: "Product price as decimal number (required)",
              category: "Product category (required)",
              brand: "Brand name (optional)",
              sku: "Stock Keeping Unit - unique identifier (optional)",
              image_url: "URL to product image (optional)",
              tags: "Comma-separated tags (optional)",
              availability: "Product availability: in_stock, out_of_stock, or discontinued (optional, default: in_stock)",
              commission_rate: "Commission rate as percentage (optional, default: 0)"
            }
          },
          products: PRODUCT_TEMPLATE_DATA
        }
        fileContent = Buffer.from(JSON.stringify(templateWithInstructions, null, 2), 'utf-8')
        mimeType = 'application/json'
        fileName = 'product_import_template.json'
      }

      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-cache'
        }
      })

    } catch (error) {
      console.error('Template generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate template' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Templates API error:', error)
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

    const { name, description, fileType, mappingConfig, isDefault = false } = await request.json()

    if (!name || !fileType || !mappingConfig) {
      return NextResponse.json(
        { error: 'Name, file type, and mapping configuration are required' },
        { status: 400 }
      )
    }

    // If setting as default, unset other defaults for this user and file type
    if (isDefault) {
      await supabase
        .from('import_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('file_type', fileType)
    }

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('import_templates')
      .insert({
        user_id: user.id,
        name,
        description,
        file_type: fileType,
        mapping_config: mappingConfig,
        is_default: isDefault
      })
      .select()
      .single()

    if (templateError) {
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        fileType: template.file_type,
        mappingConfig: template.mapping_config,
        isDefault: template.is_default,
        createdAt: template.created_at
      }
    })

  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, name, description, mappingConfig, isDefault = false } = await request.json()

    if (!id || !name || !mappingConfig) {
      return NextResponse.json(
        { error: 'ID, name, and mapping configuration are required' },
        { status: 400 }
      )
    }

    // Get existing template to check ownership and file type
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('import_templates')
      .select('file_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults for this user and file type
    if (isDefault) {
      await supabase
        .from('import_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('file_type', existingTemplate.file_type)
        .neq('id', id)
    }

    // Update template
    const { data: template, error: updateError } = await supabase
      .from('import_templates')
      .update({
        name,
        description,
        mapping_config: mappingConfig,
        is_default: isDefault,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        fileType: template.file_type,
        mappingConfig: template.mapping_config,
        isDefault: template.is_default,
        updatedAt: template.updated_at
      }
    })

  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Delete template
    const { error: deleteError } = await supabase
      .from('import_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })

  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}