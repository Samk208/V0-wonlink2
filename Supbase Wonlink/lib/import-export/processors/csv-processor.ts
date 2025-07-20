import { FileMetadata, ValidationError, StreamingConfig } from '../types'

export class CSVProcessor {
  private delimiter: string = ','
  private quoteChar: string = '"'
  private escapeChar: string = '"'
  private encoding: BufferEncoding = 'utf8'
  private hasHeader: boolean = true
  private maxRowSize: number = 1024 * 1024 // 1MB
  private maxFileSize: number = 100 * 1024 * 1024 // 100MB

  constructor(options: {
    delimiter?: string
    quoteChar?: string
    escapeChar?: string
    encoding?: BufferEncoding
    hasHeader?: boolean
    maxRowSize?: number
    maxFileSize?: number
  } = {}) {
    Object.assign(this, options)
  }

  /**
   * Parse CSV file and extract metadata
   */
  public async parseFile(
    file: File | Buffer | string,
    streamingConfig?: StreamingConfig
  ): Promise<{
    metadata: FileMetadata
    data: Record<string, any>[]
    errors: ValidationError[]
  }> {
    const errors: ValidationError[] = []
    
    try {
      // Convert input to string
      const content = await this.getFileContent(file)
      
      // Validate file size
      if (content.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`)
      }
      
      // Detect delimiter if not specified
      const detectedDelimiter = this.detectDelimiter(content)
      if (detectedDelimiter !== this.delimiter) {
        this.delimiter = detectedDelimiter
      }
      
      // Parse CSV content
      const parseResult = this.parseCSVContent(content)
      
      // Extract headers and data
      const headers = this.hasHeader ? parseResult.rows[0] : this.generateHeaders(parseResult.rows[0]?.length || 0)
      const dataRows = this.hasHeader ? parseResult.rows.slice(1) : parseResult.rows
      
      // Convert to objects
      const data = this.convertRowsToObjects(headers, dataRows, errors)
      
      // Generate metadata
      const metadata = this.generateMetadata(file, headers, data, content)
      
      errors.push(...parseResult.errors)
      
      return { metadata, data, errors }
    } catch (error) {
      errors.push({
        type: 'custom',
        field: 'file',
        value: file,
        message: `Failed to parse CSV file: ${(error as Error).message}`,
        severity: 'error'
      })
      
      return {
        metadata: this.getEmptyMetadata(file),
        data: [],
        errors
      }
    }
  }

  /**
   * Parse CSV in streaming mode for large files
   */
  public async *parseStream(
    file: File | Buffer | string,
    config: StreamingConfig = { chunkSize: 1000, highWaterMark: 16384, objectMode: true }
  ): AsyncGenerator<{
    chunk: Record<string, any>[]
    headers: string[]
    chunkIndex: number
    totalProcessed: number
    errors: ValidationError[]
  }> {
    const content = await this.getFileContent(file)
    const parseResult = this.parseCSVContent(content)
    
    const headers = this.hasHeader ? parseResult.rows[0] : this.generateHeaders(parseResult.rows[0]?.length || 0)
    const dataRows = this.hasHeader ? parseResult.rows.slice(1) : parseResult.rows
    
    let chunkIndex = 0
    let totalProcessed = 0
    
    for (let i = 0; i < dataRows.length; i += config.chunkSize) {
      const chunkRows = dataRows.slice(i, i + config.chunkSize)
      const errors: ValidationError[] = []
      
      const chunk = this.convertRowsToObjects(headers, chunkRows, errors, i + 1)
      
      totalProcessed += chunk.length
      
      yield {
        chunk,
        headers,
        chunkIndex: chunkIndex++,
        totalProcessed,
        errors
      }
    }
  }

  /**
   * Detect CSV delimiter
   */
  private detectDelimiter(content: string): string {
    const delimiters = [',', ';', '\t', '|']
    const sampleLines = content.split('\n').slice(0, 10)
    
    let bestDelimiter = ','
    let maxConsistency = 0
    
    for (const delimiter of delimiters) {
      const counts = sampleLines.map(line => {
        if (line.trim() === '') return 0
        return this.countDelimiterOccurrences(line, delimiter)
      }).filter(count => count > 0)
      
      if (counts.length === 0) continue
      
      const average = counts.reduce((sum, count) => sum + count, 0) / counts.length
      const variance = counts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / counts.length
      const consistency = average / (variance + 1)
      
      if (consistency > maxConsistency && average > 0) {
        maxConsistency = consistency
        bestDelimiter = delimiter
      }
    }
    
    return bestDelimiter
  }

  /**
   * Count delimiter occurrences outside of quotes
   */
  private countDelimiterOccurrences(line: string, delimiter: string): number {
    let count = 0
    let insideQuotes = false
    let i = 0
    
    while (i < line.length) {
      const char = line[i]
      
      if (char === this.quoteChar) {
        if (i + 1 < line.length && line[i + 1] === this.quoteChar) {
          i += 2 // Skip escaped quote
          continue
        }
        insideQuotes = !insideQuotes
      } else if (char === delimiter && !insideQuotes) {
        count++
      }
      
      i++
    }
    
    return count
  }

  /**
   * Parse CSV content into rows
   */
  private parseCSVContent(content: string): {
    rows: string[][]
    errors: ValidationError[]
  } {
    const rows: string[][] = []
    const errors: ValidationError[] = []
    const lines = content.split(/\r?\n/)
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      
      if (line.trim() === '') continue
      
      if (line.length > this.maxRowSize) {
        errors.push({
          type: 'invalid_format',
          field: 'row',
          value: line.substring(0, 100) + '...',
          message: `Row ${lineIndex + 1} exceeds maximum size limit`,
          severity: 'error',
          row: lineIndex + 1
        })
        continue
      }
      
      try {
        const row = this.parseCSVRow(line)
        rows.push(row)
      } catch (error) {
        errors.push({
          type: 'invalid_format',
          field: 'row',
          value: line,
          message: `Failed to parse row ${lineIndex + 1}: ${(error as Error).message}`,
          severity: 'error',
          row: lineIndex + 1
        })
      }
    }
    
    return { rows, errors }
  }

  /**
   * Parse a single CSV row
   */
  private parseCSVRow(line: string): string[] {
    const row: string[] = []
    let current = ''
    let insideQuotes = false
    let i = 0
    
    while (i < line.length) {
      const char = line[i]
      
      if (char === this.quoteChar) {
        if (insideQuotes && i + 1 < line.length && line[i + 1] === this.quoteChar) {
          // Escaped quote
          current += this.quoteChar
          i += 2
          continue
        }
        insideQuotes = !insideQuotes
      } else if (char === this.delimiter && !insideQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
      
      i++
    }
    
    // Add the last field
    row.push(current.trim())
    
    return row
  }

  /**
   * Generate headers for headerless CSV
   */
  private generateHeaders(columnCount: number): string[] {
    const headers: string[] = []
    for (let i = 0; i < columnCount; i++) {
      headers.push(`Column_${i + 1}`)
    }
    return headers
  }

  /**
   * Convert rows to objects
   */
  private convertRowsToObjects(
    headers: string[],
    rows: string[][],
    errors: ValidationError[],
    startRowIndex: number = 1
  ): Record<string, any>[] {
    const data: Record<string, any>[] = []
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowIndex = startRowIndex + i
      
      if (row.length !== headers.length) {
        errors.push({
          type: 'invalid_format',
          field: 'row',
          value: row,
          message: `Row ${rowIndex} has ${row.length} columns but expected ${headers.length}`,
          severity: 'warning',
          row: rowIndex,
          suggestion: 'Check for missing or extra delimiters in this row'
        })
      }
      
      const obj: Record<string, any> = {}
      
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]
        const value = row[j] || ''
        
        // Convert value to appropriate type
        obj[header] = this.convertValue(value, header, rowIndex, errors)
      }
      
      data.push(obj)
    }
    
    return data
  }

  /**
   * Convert string value to appropriate type
   */
  private convertValue(
    value: string,
    header: string,
    rowIndex: number,
    errors: ValidationError[]
  ): any {
    if (value === '') return null
    
    // Try to convert to number
    if (/^\d+(\.\d+)?$/.test(value)) {
      const num = parseFloat(value)
      if (!isNaN(num)) return num
    }
    
    // Try to convert to boolean
    const lowerValue = value.toLowerCase()
    if (['true', 'false', 'yes', 'no', '1', '0'].includes(lowerValue)) {
      return ['true', 'yes', '1'].includes(lowerValue)
    }
    
    // Try to convert to date
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }
    
    // Return as string (trimmed)
    return value.trim()
  }

  /**
   * Generate file metadata
   */
  private generateMetadata(
    file: File | Buffer | string,
    headers: string[],
    data: Record<string, any>[],
    content: string
  ): FileMetadata {
    const fileName = file instanceof File ? file.name : 'unknown.csv'
    const fileSize = file instanceof File ? file.size : 
                     file instanceof Buffer ? file.length : 
                     content.length
    
    // Generate sample data (first 5 rows)
    const sampleData = data.slice(0, 5)
    
    // Estimate total rows (including header if present)
    const estimatedRows = content.split(/\r?\n/).filter(line => line.trim() !== '').length
    
    return {
      name: fileName,
      size: fileSize,
      type: 'text/csv',
      encoding: this.encoding,
      delimiter: this.delimiter,
      headers,
      sampleData,
      estimatedRows,
      checksum: this.generateChecksum(content)
    }
  }

  /**
   * Get empty metadata for error cases
   */
  private getEmptyMetadata(file: File | Buffer | string): FileMetadata {
    const fileName = file instanceof File ? file.name : 'unknown.csv'
    const fileSize = file instanceof File ? file.size : 0
    
    return {
      name: fileName,
      size: fileSize,
      type: 'text/csv',
      encoding: this.encoding,
      headers: [],
      sampleData: [],
      estimatedRows: 0
    }
  }

  /**
   * Get file content as string
   */
  private async getFileContent(file: File | Buffer | string): Promise<string> {
    if (typeof file === 'string') {
      return file
    }
    
    if (file instanceof Buffer) {
      return file.toString(this.encoding)
    }
    
    if (file instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = (e) => reject(new Error('Failed to read file'))
        reader.readAsText(file, this.encoding)
      })
    }
    
    throw new Error('Unsupported file type')
  }

  /**
   * Generate simple checksum for file integrity
   */
  private generateChecksum(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Validate CSV structure
   */
  public validateStructure(content: string): {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationError[]
  } {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    
    try {
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== '')
      
      if (lines.length === 0) {
        errors.push({
          type: 'invalid_format',
          field: 'file',
          value: content,
          message: 'File is empty',
          severity: 'error'
        })
        return { isValid: false, errors, warnings }
      }
      
      // Check header consistency
      const firstRowLength = this.parseCSVRow(lines[0]).length
      
      for (let i = 1; i < Math.min(lines.length, 100); i++) {
        const rowLength = this.parseCSVRow(lines[i]).length
        
        if (rowLength !== firstRowLength) {
          warnings.push({
            type: 'invalid_format',
            field: 'row',
            value: lines[i],
            message: `Row ${i + 1} has ${rowLength} columns but first row has ${firstRowLength}`,
            severity: 'warning',
            row: i + 1
          })
        }
      }
      
      // Check for common issues
      if (lines.some(line => line.includes('\t') && this.delimiter === ',')) {
        warnings.push({
          type: 'data_quality',
          field: 'delimiter',
          value: this.delimiter,
          message: 'File contains tabs, consider using tab delimiter',
          severity: 'warning'
        })
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      errors.push({
        type: 'invalid_format',
        field: 'file',
        value: content,
        message: `Structure validation failed: ${(error as Error).message}`,
        severity: 'error'
      })
      
      return { isValid: false, errors, warnings }
    }
  }
}