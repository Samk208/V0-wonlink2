import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { z } from 'zod'

// Product validation schema
export const ProductImportSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.union([
    z.number().positive("Price must be positive"),
    z.string().transform((val) => {
      const num = parseFloat(val.replace(/[^0-9.-]/g, ''))
      if (isNaN(num) || num <= 0) {
        throw new Error("Invalid price format")
      }
      return num
    })
  ]),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional().default(""),
  brand: z.string().min(1, "Brand is required"),
  sku: z.string().optional().default(""),
  image_url: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional().default(""),
  availability: z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional().default('in_stock'),
  commission_rate: z.union([
    z.number().min(0).max(100),
    z.string().transform((val) => {
      const num = parseFloat(val.replace('%', ''))
      if (isNaN(num) || num < 0 || num > 100) {
        throw new Error("Invalid commission rate")
      }
      return num
    })
  ]).optional().default(0)
})

export type ProductImport = z.infer<typeof ProductImportSchema>

export interface ValidationResult {
  valid: ProductImport[]
  errors: ValidationError[]
  totalRows: number
  validRows: number
  errorRows: number
}

export interface ValidationError {
  row: number
  column?: string
  error: string
  rawData: any
}

export interface ProcessingProgress {
  current: number
  total: number
  percentage: number
  stage: 'parsing' | 'validating' | 'processing' | 'complete'
}

export type ProgressCallback = (progress: ProcessingProgress) => void

export class FileProcessor {
  private progressCallback?: ProgressCallback

  constructor(progressCallback?: ProgressCallback) {
    this.progressCallback = progressCallback
  }

  private updateProgress(current: number, total: number, stage: ProcessingProgress['stage']) {
    if (this.progressCallback) {
      this.progressCallback({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        stage
      })
    }
  }

  /**
   * Parse CSV file using PapaParse
   */
  private async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normalize header names
          return header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        },
        complete: (result) => {
          if (result.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`))
          } else {
            resolve(result.data)
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`))
        }
      })
    })
  }

  /**
   * Parse Excel file using SheetJS
   */
  private async parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0]
          if (!firstSheetName) {
            reject(new Error('No sheets found in Excel file'))
            return
          }
          
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          })
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'))
            return
          }
          
          // Convert to object format with normalized headers
          const headers = (jsonData[0] as string[]).map(header => 
            header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
          )
          
          const rows = jsonData.slice(1).map((row: any[]) => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index] || ''
            })
            return obj
          })
          
          resolve(rows)
        } catch (error) {
          reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Parse JSON file
   */
  private async parseJSON(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)
          
          // Ensure data is an array
          if (!Array.isArray(data)) {
            reject(new Error('JSON file must contain an array of objects'))
            return
          }
          
          // Normalize keys in each object
          const normalizedData = data.map(item => {
            const normalizedItem: any = {}
            Object.keys(item).forEach(key => {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
              normalizedItem[normalizedKey] = item[key]
            })
            return normalizedItem
          })
          
          resolve(normalizedData)
        } catch (error) {
          reject(new Error(`JSON parsing failed: ${error instanceof Error ? error.message : 'Invalid JSON format'}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read JSON file'))
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Parse file based on its type
   */
  async parseFile(file: File): Promise<any[]> {
    this.updateProgress(0, 100, 'parsing')
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    let data: any[]
    
    try {
      switch (fileExtension) {
        case '.csv':
          data = await this.parseCSV(file)
          break
        case '.xlsx':
        case '.xls':
          data = await this.parseExcel(file)
          break
        case '.json':
          data = await this.parseJSON(file)
          break
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`)
      }
      
      this.updateProgress(100, 100, 'parsing')
      return data
    } catch (error) {
      throw new Error(`File parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Map and normalize column names to expected schema
   */
  private mapColumns(data: any[]): any[] {
    const columnMapping: Record<string, string> = {
      // Product name variations
      'product_name': 'name',
      'productname': 'name',
      'title': 'name',
      'product_title': 'name',
      'item_name': 'name',
      
      // Price variations
      'cost': 'price',
      'amount': 'price',
      'product_price': 'price',
      'unit_price': 'price',
      
      // Category variations
      'product_category': 'category',
      'type': 'category',
      'genre': 'category',
      
      // Description variations
      'product_description': 'description',
      'desc': 'description',
      'details': 'description',
      
      // Brand variations
      'brand_name': 'brand',
      'manufacturer': 'brand',
      'vendor': 'brand',
      
      // SKU variations
      'product_id': 'sku',
      'item_id': 'sku',
      'product_code': 'sku',
      
      // Image URL variations
      'image': 'image_url',
      'photo': 'image_url',
      'picture': 'image_url',
      'image_link': 'image_url',
      
      // Commission rate variations
      'commission': 'commission_rate',
      'commission_percentage': 'commission_rate',
      'affiliate_rate': 'commission_rate'
    }
    
    return data.map(row => {
      const mappedRow: any = {}
      Object.keys(row).forEach(key => {
        const mappedKey = columnMapping[key] || key
        mappedRow[mappedKey] = row[key]
      })
      return mappedRow
    })
  }

  /**
   * Validate parsed data against schema
   */
  async validateData(data: any[]): Promise<ValidationResult> {
    this.updateProgress(0, data.length, 'validating')
    
    const mappedData = this.mapColumns(data)
    const valid: ProductImport[] = []
    const errors: ValidationError[] = []
    
    for (let i = 0; i < mappedData.length; i++) {
      try {
        const validatedRow = ProductImportSchema.parse(mappedData[i])
        valid.push(validatedRow)
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: i + 2, // +2 because row 1 is header and array is 0-indexed
            error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '),
            rawData: mappedData[i]
          })
        } else {
          errors.push({
            row: i + 2,
            error: error instanceof Error ? error.message : 'Unknown validation error',
            rawData: mappedData[i]
          })
        }
      }
      
      // Update progress every 100 rows
      if (i % 100 === 0) {
        this.updateProgress(i, mappedData.length, 'validating')
      }
    }
    
    this.updateProgress(mappedData.length, mappedData.length, 'validating')
    
    return {
      valid,
      errors,
      totalRows: mappedData.length,
      validRows: valid.length,
      errorRows: errors.length
    }
  }

  /**
   * Process file in chunks for better performance
   */
  async processInChunks<T>(
    data: T[], 
    chunkSize: number = 100,
    processor: (chunk: T[], chunkIndex: number) => Promise<void>
  ): Promise<void> {
    this.updateProgress(0, data.length, 'processing')
    
    const chunks = []
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize))
    }
    
    for (let i = 0; i < chunks.length; i++) {
      await processor(chunks[i], i)
      this.updateProgress((i + 1) * chunkSize, data.length, 'processing')
    }
    
    this.updateProgress(data.length, data.length, 'complete')
  }

  /**
   * Generate a sample CSV template for download
   */
  generateCSVTemplate(): string {
    const sampleData = [
      {
        'Product Name': 'Sample Product 1',
        'Price': '29.99',
        'Category': 'Fashion',
        'Description': 'A beautiful sample product',
        'Brand': 'Sample Brand',
        'SKU': 'SP001',
        'Image URL': 'https://example.com/image1.jpg',
        'Tags': 'sample, fashion, new',
        'Availability': 'in_stock',
        'Commission Rate': '5.0'
      },
      {
        'Product Name': 'Sample Product 2',
        'Price': '49.99',
        'Category': 'Beauty',
        'Description': 'Another sample product',
        'Brand': 'Sample Brand',
        'SKU': 'SP002',
        'Image URL': 'https://example.com/image2.jpg',
        'Tags': 'sample, beauty, trending',
        'Availability': 'in_stock',
        'Commission Rate': '7.5'
      }
    ]
    
    return Papa.unparse(sampleData)
  }

  /**
   * Generate Excel template
   */
  generateExcelTemplate(): ArrayBuffer {
    const sampleData = [
      {
        'Product Name': 'Sample Product 1',
        'Price': 29.99,
        'Category': 'Fashion',
        'Description': 'A beautiful sample product',
        'Brand': 'Sample Brand',
        'SKU': 'SP001',
        'Image URL': 'https://example.com/image1.jpg',
        'Tags': 'sample, fashion, new',
        'Availability': 'in_stock',
        'Commission Rate': 5.0
      },
      {
        'Product Name': 'Sample Product 2',
        'Price': 49.99,
        'Category': 'Beauty',
        'Description': 'Another sample product',
        'Brand': 'Sample Brand',
        'SKU': 'SP002',
        'Image URL': 'https://example.com/image2.jpg',
        'Tags': 'sample, beauty, trending',
        'Availability': 'in_stock',
        'Commission Rate': 7.5
      }
    ]
    
    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
    
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  }

  /**
   * Auto-detect column mappings based on content analysis
   */
  detectColumnMappings(data: any[]): Record<string, string> {
    if (data.length === 0) return {}
    
    const sampleRow = data[0]
    const detectedMappings: Record<string, string> = {}
    
    Object.keys(sampleRow).forEach(column => {
      const normalizedColumn = column.toLowerCase().replace(/\s+/g, '_')
      
      // Pattern matching for common column names
      if (/name|title|product/.test(normalizedColumn)) {
        detectedMappings[column] = 'name'
      } else if (/price|cost|amount/.test(normalizedColumn)) {
        detectedMappings[column] = 'price'
      } else if (/category|type|genre/.test(normalizedColumn)) {
        detectedMappings[column] = 'category'
      } else if (/desc|description|details/.test(normalizedColumn)) {
        detectedMappings[column] = 'description'
      } else if (/brand|manufacturer|vendor/.test(normalizedColumn)) {
        detectedMappings[column] = 'brand'
      } else if (/sku|id|code/.test(normalizedColumn)) {
        detectedMappings[column] = 'sku'
      } else if (/image|photo|picture/.test(normalizedColumn)) {
        detectedMappings[column] = 'image_url'
      } else if (/commission|rate/.test(normalizedColumn)) {
        detectedMappings[column] = 'commission_rate'
      } else if (/tag/.test(normalizedColumn)) {
        detectedMappings[column] = 'tags'
      } else if (/availability|stock/.test(normalizedColumn)) {
        detectedMappings[column] = 'availability'
      }
    })
    
    return detectedMappings
  }
}