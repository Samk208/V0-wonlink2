import { FileMetadata, ValidationError, StreamingConfig } from '../types'

export class ExcelProcessor {
  private maxFileSize: number = 100 * 1024 * 1024 // 100MB
  private maxSheetSize: number = 100000 // 100k rows
  private allowedExtensions: string[] = ['.xlsx', '.xls']

  constructor(options: {
    maxFileSize?: number
    maxSheetSize?: number
    allowedExtensions?: string[]
  } = {}) {
    Object.assign(this, options)
  }

  /**
   * Parse Excel file and extract metadata
   */
  public async parseFile(
    file: File | Buffer,
    options: {
      sheetName?: string
      sheetIndex?: number
      startRow?: number
      endRow?: number
      startCol?: number
      endCol?: number
    } = {}
  ): Promise<{
    metadata: FileMetadata
    data: Record<string, any>[]
    errors: ValidationError[]
    sheets: string[]
  }> {
    const errors: ValidationError[] = []
    
    try {
      // Validate file
      this.validateFile(file)
      
      // Import xlsx library dynamically to avoid bundling issues
      const XLSX = await this.importXLSX()
      
      // Read workbook
      const arrayBuffer = await this.getArrayBuffer(file)
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      })
      
      const sheetNames = workbook.SheetNames
      
      if (sheetNames.length === 0) {
        throw new Error('No worksheets found in file')
      }
      
      // Determine which sheet to process
      let targetSheet: string
      if (options.sheetName && sheetNames.includes(options.sheetName)) {
        targetSheet = options.sheetName
      } else if (options.sheetIndex !== undefined && options.sheetIndex < sheetNames.length) {
        targetSheet = sheetNames[options.sheetIndex]
      } else {
        targetSheet = sheetNames[0] // Default to first sheet
      }
      
      const worksheet = workbook.Sheets[targetSheet]
      
      // Check sheet size
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      const rowCount = range.e.r - range.s.r + 1
      
      if (rowCount > this.maxSheetSize) {
        errors.push({
          type: 'invalid_format',
          field: 'sheet',
          value: rowCount,
          message: `Sheet has ${rowCount} rows, exceeding maximum of ${this.maxSheetSize}`,
          severity: 'warning',
          suggestion: 'Consider processing in smaller chunks or filtering data'
        })
      }
      
      // Apply range restrictions
      const processRange = this.calculateProcessRange(range, options)
      
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        range: processRange,
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd',
        blankrows: false,
        defval: null
      }) as any[][]
      
      // Process data
      const { headers, data } = this.processSheetData(jsonData, errors)
      
      // Generate metadata
      const metadata = this.generateMetadata(file, headers, data, sheetNames, targetSheet)
      
      return {
        metadata,
        data,
        errors,
        sheets: sheetNames
      }
    } catch (error) {
      errors.push({
        type: 'custom',
        field: 'file',
        value: file,
        message: `Failed to parse Excel file: ${(error as Error).message}`,
        severity: 'error'
      })
      
      return {
        metadata: this.getEmptyMetadata(file),
        data: [],
        errors,
        sheets: []
      }
    }
  }

  /**
   * Parse Excel in streaming mode for large files
   */
  public async *parseStream(
    file: File | Buffer,
    options: {
      sheetName?: string
      sheetIndex?: number
      chunkSize?: number
    } = {}
  ): AsyncGenerator<{
    chunk: Record<string, any>[]
    headers: string[]
    chunkIndex: number
    totalProcessed: number
    errors: ValidationError[]
    sheetInfo: { name: string; totalRows: number }
  }> {
    const chunkSize = options.chunkSize || 1000
    const parseResult = await this.parseFile(file, { ...options, endRow: chunkSize + 1 })
    
    if (parseResult.errors.length > 0) {
      yield {
        chunk: [],
        headers: [],
        chunkIndex: 0,
        totalProcessed: 0,
        errors: parseResult.errors,
        sheetInfo: { name: '', totalRows: 0 }
      }
      return
    }
    
    const XLSX = await this.importXLSX()
    const arrayBuffer = await this.getArrayBuffer(file)
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    const sheetName = options.sheetName || workbook.SheetNames[options.sheetIndex || 0]
    const worksheet = workbook.Sheets[sheetName]
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    const totalRows = range.e.r - range.s.r + 1
    
    const headers = parseResult.metadata.headers
    let chunkIndex = 0
    let totalProcessed = 0
    
    for (let startRow = 1; startRow < totalRows; startRow += chunkSize) {
      const endRow = Math.min(startRow + chunkSize - 1, totalRows - 1)
      
      const chunkData = XLSX.utils.sheet_to_json(worksheet, {
        range: { s: { r: startRow, c: 0 }, e: { r: endRow, c: range.e.c } },
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd'
      }) as any[][]
      
      const errors: ValidationError[] = []
      const { data } = this.processSheetData([headers, ...chunkData], errors)
      
      totalProcessed += data.length
      
      yield {
        chunk: data,
        headers,
        chunkIndex: chunkIndex++,
        totalProcessed,
        errors,
        sheetInfo: { name: sheetName, totalRows }
      }
    }
  }

  /**
   * Get sheet information without parsing full content
   */
  public async getSheetInfo(file: File | Buffer): Promise<{
    sheets: Array<{
      name: string
      rowCount: number
      columnCount: number
      range: string
    }>
    errors: ValidationError[]
  }> {
    const errors: ValidationError[] = []
    
    try {
      this.validateFile(file)
      
      const XLSX = await this.importXLSX()
      const arrayBuffer = await this.getArrayBuffer(file)
      const workbook = XLSX.read(arrayBuffer, { type: 'array', sheetStubs: true })
      
      const sheets = workbook.SheetNames.map(name => {
        const worksheet = workbook.Sheets[name]
        const range = worksheet['!ref'] || 'A1'
        const decodedRange = XLSX.utils.decode_range(range)
        
        return {
          name,
          rowCount: decodedRange.e.r - decodedRange.s.r + 1,
          columnCount: decodedRange.e.c - decodedRange.s.c + 1,
          range
        }
      })
      
      return { sheets, errors }
    } catch (error) {
      errors.push({
        type: 'custom',
        field: 'file',
        value: file,
        message: `Failed to read Excel file info: ${(error as Error).message}`,
        severity: 'error'
      })
      
      return { sheets: [], errors }
    }
  }

  /**
   * Validate Excel file
   */
  public validateFile(file: File | Buffer): void {
    const fileName = file instanceof File ? file.name : 'unknown'
    const fileSize = file instanceof File ? file.size : file.length
    
    // Check file extension
    if (file instanceof File) {
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      if (!this.allowedExtensions.includes(extension)) {
        throw new Error(`Unsupported file extension: ${extension}. Allowed: ${this.allowedExtensions.join(', ')}`)
      }
    }
    
    // Check file size
    if (fileSize > this.maxFileSize) {
      throw new Error(`File size ${fileSize} bytes exceeds maximum allowed size of ${this.maxFileSize} bytes`)
    }
    
    if (fileSize === 0) {
      throw new Error('File is empty')
    }
  }

  /**
   * Import XLSX library dynamically
   */
  private async importXLSX(): Promise<any> {
    try {
      // Try to import XLSX
      const XLSX = await import('xlsx')
      return XLSX
    } catch (error) {
      throw new Error('XLSX library not available. Please install xlsx package: npm install xlsx')
    }
  }

  /**
   * Get ArrayBuffer from file
   */
  private async getArrayBuffer(file: File | Buffer): Promise<ArrayBuffer> {
    if (file instanceof Buffer) {
      return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    }
    
    if (file instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsArrayBuffer(file)
      })
    }
    
    throw new Error('Unsupported file type')
  }

  /**
   * Calculate processing range based on options
   */
  private calculateProcessRange(
    range: any,
    options: {
      startRow?: number
      endRow?: number
      startCol?: number
      endCol?: number
    }
  ): any {
    return {
      s: {
        r: options.startRow || range.s.r,
        c: options.startCol || range.s.c
      },
      e: {
        r: options.endRow !== undefined ? Math.min(options.endRow, range.e.r) : range.e.r,
        c: options.endCol !== undefined ? Math.min(options.endCol, range.e.c) : range.e.c
      }
    }
  }

  /**
   * Process sheet data and convert to objects
   */
  private processSheetData(
    jsonData: any[][],
    errors: ValidationError[]
  ): {
    headers: string[]
    data: Record<string, any>[]
  } {
    if (jsonData.length === 0) {
      return { headers: [], data: [] }
    }
    
    // Extract headers (first row)
    const rawHeaders = jsonData[0] || []
    const headers = this.cleanHeaders(rawHeaders, errors)
    
    // Process data rows
    const data: Record<string, any>[] = []
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] || []
      const rowIndex = i + 1
      
      if (this.isEmptyRow(row)) {
        continue
      }
      
      const obj: Record<string, any> = {}
      
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]
        const rawValue = row[j]
        
        // Convert and validate value
        obj[header] = this.convertExcelValue(rawValue, header, rowIndex, errors)
      }
      
      data.push(obj)
    }
    
    return { headers, data }
  }

  /**
   * Clean and validate headers
   */
  private cleanHeaders(rawHeaders: any[], errors: ValidationError[]): string[] {
    const headers: string[] = []
    const headerCounts = new Map<string, number>()
    
    for (let i = 0; i < rawHeaders.length; i++) {
      let header = String(rawHeaders[i] || `Column_${i + 1}`).trim()
      
      // Clean header name
      header = header.replace(/[^\w\s]/g, '_').replace(/\s+/g, '_')
      
      // Handle duplicates
      const originalHeader = header
      let count = headerCounts.get(originalHeader) || 0
      
      if (count > 0) {
        header = `${originalHeader}_${count + 1}`
        errors.push({
          type: 'data_quality',
          field: 'header',
          value: originalHeader,
          message: `Duplicate header '${originalHeader}' renamed to '${header}'`,
          severity: 'warning',
          suggestion: 'Consider using unique column names'
        })
      }
      
      headerCounts.set(originalHeader, count + 1)
      headers.push(header)
    }
    
    return headers
  }

  /**
   * Check if row is empty
   */
  private isEmptyRow(row: any[]): boolean {
    return row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')
  }

  /**
   * Convert Excel value to appropriate type
   */
  private convertExcelValue(
    value: any,
    header: string,
    rowIndex: number,
    errors: ValidationError[]
  ): any {
    if (value === null || value === undefined) {
      return null
    }
    
    // Handle dates (Excel dates come as Date objects or serial numbers)
    if (value instanceof Date) {
      return value.toISOString().split('T')[0]
    }
    
    // Handle Excel serial date numbers
    if (typeof value === 'number' && this.isExcelDate(value)) {
      try {
        const date = this.excelDateToJSDate(value)
        return date.toISOString().split('T')[0]
      } catch {
        // If date conversion fails, treat as number
      }
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value
    }
    
    // Handle numbers
    if (typeof value === 'number') {
      return value
    }
    
    // Handle strings
    const strValue = String(value).trim()
    
    // Try to convert string numbers
    if (/^\d+(\.\d+)?$/.test(strValue)) {
      const num = parseFloat(strValue)
      if (!isNaN(num)) return num
    }
    
    // Try to convert boolean strings
    const lowerValue = strValue.toLowerCase()
    if (['true', 'false', 'yes', 'no'].includes(lowerValue)) {
      return ['true', 'yes'].includes(lowerValue)
    }
    
    return strValue
  }

  /**
   * Check if number is likely an Excel date
   */
  private isExcelDate(value: number): boolean {
    // Excel dates are typically between 1 (1900-01-01) and 2958465 (9999-12-31)
    return value >= 1 && value <= 2958465 && Number.isInteger(value)
  }

  /**
   * Convert Excel serial number to JavaScript Date
   */
  private excelDateToJSDate(serial: number): Date {
    // Excel epoch starts at 1900-01-01, but has a leap year bug
    const epoch = new Date(1899, 11, 30) // December 30, 1899
    return new Date(epoch.getTime() + serial * 24 * 60 * 60 * 1000)
  }

  /**
   * Generate file metadata
   */
  private generateMetadata(
    file: File | Buffer,
    headers: string[],
    data: Record<string, any>[],
    sheetNames: string[],
    activeSheet: string
  ): FileMetadata {
    const fileName = file instanceof File ? file.name : 'unknown.xlsx'
    const fileSize = file instanceof File ? file.size : file.length
    
    // Generate sample data (first 5 rows)
    const sampleData = data.slice(0, 5)
    
    return {
      name: fileName,
      size: fileSize,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      headers,
      sampleData,
      estimatedRows: data.length,
      checksum: this.generateChecksum(fileName + fileSize + data.length),
      // Additional Excel-specific metadata
      ...(sheetNames.length > 0 && {
        sheets: sheetNames,
        activeSheet
      })
    }
  }

  /**
   * Get empty metadata for error cases
   */
  private getEmptyMetadata(file: File | Buffer): FileMetadata {
    const fileName = file instanceof File ? file.name : 'unknown.xlsx'
    const fileSize = file instanceof File ? file.size : 0
    
    return {
      name: fileName,
      size: fileSize,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      headers: [],
      sampleData: [],
      estimatedRows: 0
    }
  }

  /**
   * Generate simple checksum
   */
  private generateChecksum(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
}