import * as XLSX from 'xlsx'

// Security wrapper for xlsx to mitigate known vulnerabilities
export class SecureXLSXParser {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly MAX_ROWS = 100000
  private static readonly MAX_COLS = 100
  private static readonly TIMEOUT = 30000 // 30 seconds

  static parseBuffer(buffer: ArrayBuffer, options: {
    maxRows?: number,
    maxCols?: number,
    timeout?: number
  } = {}): any[] {
    const { maxRows = this.MAX_ROWS, maxCols = this.MAX_COLS, timeout = this.TIMEOUT } = options

    // Size validation
    if (buffer.byteLength > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${buffer.byteLength} bytes (max: ${this.MAX_FILE_SIZE})`)
    }

    // Timeout protection
    const startTime = Date.now()
    const checkTimeout = () => {
      if (Date.now() - startTime > timeout) {
        throw new Error('File parsing timeout')
      }
    }

    try {
      checkTimeout()
      
      // Parse workbook with security restrictions
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: false, // Prevent date parsing vulnerabilities
        cellNF: false,    // Prevent number format vulnerabilities
        cellStyles: false, // Prevent style vulnerabilities
        sheetStubs: false, // Prevent stub vulnerabilities
        cellFormula: false // Prevent formula execution
      })

      checkTimeout()

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in workbook')
      }

      // Take only the first sheet for security
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      if (!worksheet) {
        throw new Error('Invalid worksheet')
      }

      checkTimeout()

      // Convert to JSON with restrictions
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false, // Prevent raw value vulnerabilities
        defval: '', // Default empty value
        header: 1,  // Use array format first
        range: 0,   // Start from first row
        blankrows: false // Skip blank rows
      })

      checkTimeout()

      // Validate dimensions
      if (jsonData.length > maxRows) {
        throw new Error(`Too many rows: ${jsonData.length} (max: ${maxRows})`)
      }

      // Convert array format to object format safely
      if (jsonData.length === 0) {
        return []
      }

      const headers = jsonData[0] as string[]
      if (headers.length > maxCols) {
        throw new Error(`Too many columns: ${headers.length} (max: ${maxCols})`)
      }

      // Sanitize headers
      const sanitizedHeaders = headers.map((header, index) => {
        if (typeof header !== 'string') {
          return `column_${index}`
        }
        return this.sanitizeString(header.trim().toLowerCase().replace(/\s+/g, '_'))
      })

      // Convert rows to objects with sanitized data
      const result = jsonData.slice(1).map((row: any[], rowIndex) => {
        checkTimeout()
        
        const obj: Record<string, string> = {}
        sanitizedHeaders.forEach((header, colIndex) => {
          const cellValue = row[colIndex]
          obj[header] = this.sanitizeString(String(cellValue || ''))
        })
        return obj
      })

      return result

    } catch (error) {
      if (error instanceof Error) {
        // Re-throw our own errors
        if (error.message.includes('timeout') || 
            error.message.includes('Too many') || 
            error.message.includes('File too large')) {
          throw error
        }
      }
      
      // Wrap unknown errors
      throw new Error('Failed to parse Excel file: Invalid format or corrupted data')
    }
  }

  private static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }

    // Remove potentially dangerous characters and patterns
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
      .replace(/[<>'"&]/g, '') // HTML/XML special chars
      .replace(/javascript:/gi, '') // JavaScript protocol
      .replace(/data:/gi, '') // Data URLs
      .replace(/vbscript:/gi, '') // VBScript
      .replace(/on\w+=/gi, '') // Event handlers
      .substring(0, 1000) // Limit length
      .trim()
  }
}