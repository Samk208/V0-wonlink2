import { FileMetadata, ValidationError, StreamingConfig } from '../types'

export class JSONProcessor {
  private maxFileSize: number = 100 * 1024 * 1024 // 100MB
  private maxDepth: number = 10
  private maxArrayLength: number = 100000

  constructor(options: {
    maxFileSize?: number
    maxDepth?: number
    maxArrayLength?: number
  } = {}) {
    Object.assign(this, options)
  }

  /**
   * Parse JSON file and extract metadata
   */
  public async parseFile(
    file: File | Buffer | string,
    options: {
      arrayPath?: string // JSONPath to extract array from nested JSON
      flattenObjects?: boolean
      maxDepth?: number
    } = {}
  ): Promise<{
    metadata: FileMetadata
    data: Record<string, any>[]
    errors: ValidationError[]
  }> {
    const errors: ValidationError[] = []
    
    try {
      // Get file content
      const content = await this.getFileContent(file)
      
      // Validate file size
      if (content.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`)
      }
      
      // Parse JSON
      const jsonData = this.parseJSON(content, errors)
      if (!jsonData) {
        return {
          metadata: this.getEmptyMetadata(file),
          data: [],
          errors
        }
      }
      
      // Extract array data
      const arrayData = this.extractArrayData(jsonData, options.arrayPath, errors)
      
      // Flatten and normalize data
      const normalizedData = this.normalizeData(arrayData, options, errors)
      
      // Generate headers from data
      const headers = this.extractHeaders(normalizedData)
      
      // Generate metadata
      const metadata = this.generateMetadata(file, headers, normalizedData, content)
      
      return {
        metadata,
        data: normalizedData,
        errors
      }
    } catch (error) {
      errors.push({
        type: 'custom',
        field: 'file',
        value: file,
        message: `Failed to parse JSON file: ${(error as Error).message}`,
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
   * Parse JSON in streaming mode for large files
   */
  public async *parseStream(
    file: File | Buffer | string,
    config: StreamingConfig & {
      arrayPath?: string
      flattenObjects?: boolean
    } = { chunkSize: 1000, highWaterMark: 16384, objectMode: true }
  ): AsyncGenerator<{
    chunk: Record<string, any>[]
    headers: string[]
    chunkIndex: number
    totalProcessed: number
    errors: ValidationError[]
  }> {
    const parseResult = await this.parseFile(file, {
      arrayPath: config.arrayPath,
      flattenObjects: config.flattenObjects
    })
    
    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      yield {
        chunk: [],
        headers: [],
        chunkIndex: 0,
        totalProcessed: 0,
        errors: parseResult.errors
      }
      return
    }
    
    const data = parseResult.data
    const headers = parseResult.metadata.headers
    let chunkIndex = 0
    let totalProcessed = 0
    
    for (let i = 0; i < data.length; i += config.chunkSize) {
      const chunk = data.slice(i, i + config.chunkSize)
      totalProcessed += chunk.length
      
      yield {
        chunk,
        headers,
        chunkIndex: chunkIndex++,
        totalProcessed,
        errors: []
      }
    }
  }

  /**
   * Validate JSON structure
   */
  public validateStructure(content: string): {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationError[]
    structure: {
      type: 'object' | 'array' | 'primitive'
      depth: number
      arrayLength?: number
      keys?: string[]
    }
  } {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    
    try {
      if (!content.trim()) {
        errors.push({
          type: 'invalid_format',
          field: 'file',
          value: content,
          message: 'File is empty',
          severity: 'error'
        })
        return {
          isValid: false,
          errors,
          warnings,
          structure: { type: 'primitive', depth: 0 }
        }
      }
      
      const jsonData = JSON.parse(content)
      const structure = this.analyzeStructure(jsonData, warnings)
      
      // Check for potential issues
      if (structure.depth > this.maxDepth) {
        warnings.push({
          type: 'performance',
          field: 'structure',
          value: structure.depth,
          message: `JSON depth ${structure.depth} exceeds recommended maximum of ${this.maxDepth}`,
          severity: 'warning',
          suggestion: 'Consider flattening the structure for better performance'
        })
      }
      
      if (structure.arrayLength && structure.arrayLength > this.maxArrayLength) {
        warnings.push({
          type: 'performance',
          field: 'array',
          value: structure.arrayLength,
          message: `Array length ${structure.arrayLength} exceeds recommended maximum of ${this.maxArrayLength}`,
          severity: 'warning',
          suggestion: 'Consider processing in smaller chunks'
        })
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        structure
      }
    } catch (error) {
      errors.push({
        type: 'invalid_format',
        field: 'json',
        value: content.substring(0, 100) + '...',
        message: `Invalid JSON syntax: ${(error as Error).message}`,
        severity: 'error'
      })
      
      return {
        isValid: false,
        errors,
        warnings,
        structure: { type: 'primitive', depth: 0 }
      }
    }
  }

  /**
   * Parse JSON with error handling
   */
  private parseJSON(content: string, errors: ValidationError[]): any {
    try {
      return JSON.parse(content)
    } catch (error) {
      const errorMessage = (error as Error).message
      let suggestion = 'Check JSON syntax'
      
      if (errorMessage.includes('Unexpected token')) {
        suggestion = 'Look for missing quotes, commas, or brackets'
      } else if (errorMessage.includes('Unexpected end')) {
        suggestion = 'File appears to be truncated or incomplete'
      }
      
      errors.push({
        type: 'invalid_format',
        field: 'json',
        value: content.substring(0, 200) + '...',
        message: `JSON parsing failed: ${errorMessage}`,
        severity: 'error',
        suggestion
      })
      
      return null
    }
  }

  /**
   * Extract array data from JSON using JSONPath or direct access
   */
  private extractArrayData(
    jsonData: any,
    arrayPath?: string,
    errors: ValidationError[] = []
  ): any[] {
    if (Array.isArray(jsonData)) {
      return jsonData
    }
    
    if (arrayPath) {
      try {
        const extractedData = this.evaluateJSONPath(jsonData, arrayPath)
        if (Array.isArray(extractedData)) {
          return extractedData
        } else {
          errors.push({
            type: 'custom',
            field: 'arrayPath',
            value: arrayPath,
            message: `JSONPath '${arrayPath}' did not return an array`,
            severity: 'error',
            suggestion: 'Verify the JSONPath expression points to an array'
          })
        }
      } catch (error) {
        errors.push({
          type: 'custom',
          field: 'arrayPath',
          value: arrayPath,
          message: `Failed to evaluate JSONPath '${arrayPath}': ${(error as Error).message}`,
          severity: 'error'
        })
      }
    }
    
    // Try to find arrays in the top-level object
    if (typeof jsonData === 'object' && jsonData !== null) {
      const arrays = Object.entries(jsonData)
        .filter(([, value]) => Array.isArray(value))
        .sort(([, a], [, b]) => (b as any[]).length - (a as any[]).length)
      
      if (arrays.length > 0) {
        const [arrayKey, arrayValue] = arrays[0]
        if (arrays.length > 1) {
          errors.push({
            type: 'data_quality',
            field: 'array',
            value: arrayKey,
            message: `Multiple arrays found, using '${arrayKey}' (largest)`,
            severity: 'warning',
            suggestion: 'Specify arrayPath to select a specific array'
          })
        }
        return arrayValue as any[]
      }
    }
    
    // Wrap single object in array
    return [jsonData]
  }

  /**
   * Simple JSONPath evaluation (supports basic dot notation)
   */
  private evaluateJSONPath(data: any, path: string): any {
    const parts = path.split('.')
    let current = data
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        throw new Error(`Cannot access property '${part}' of ${current}`)
      }
      
      if (part.includes('[') && part.includes(']')) {
        // Handle array access like 'items[0]'
        const [propName, indexPart] = part.split('[')
        const index = parseInt(indexPart.replace(']', ''))
        
        if (propName) {
          current = current[propName]
        }
        
        if (Array.isArray(current) && !isNaN(index)) {
          current = current[index]
        } else {
          throw new Error(`Invalid array access: ${part}`)
        }
      } else {
        current = current[part]
      }
    }
    
    return current
  }

  /**
   * Normalize data to flat objects
   */
  private normalizeData(
    data: any[],
    options: {
      flattenObjects?: boolean
      maxDepth?: number
    },
    errors: ValidationError[]
  ): Record<string, any>[] {
    const normalized: Record<string, any>[] = []
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      
      try {
        let normalizedItem: Record<string, any>
        
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          if (options.flattenObjects) {
            normalizedItem = this.flattenObject(item, options.maxDepth || this.maxDepth)
          } else {
            normalizedItem = { ...item }
          }
        } else {
          // Convert primitives to objects
          normalizedItem = { value: item }
        }
        
        // Ensure all values are serializable
        normalizedItem = this.sanitizeObject(normalizedItem)
        
        normalized.push(normalizedItem)
      } catch (error) {
        errors.push({
          type: 'custom',
          field: 'item',
          value: item,
          message: `Failed to normalize item at index ${i}: ${(error as Error).message}`,
          severity: 'warning',
          row: i + 1
        })
      }
    }
    
    return normalized
  }

  /**
   * Flatten nested object to dot notation
   */
  private flattenObject(
    obj: any,
    maxDepth: number,
    prefix: string = '',
    depth: number = 0
  ): Record<string, any> {
    const flattened: Record<string, any> = {}
    
    if (depth >= maxDepth) {
      flattened[prefix || 'object'] = obj
      return flattened
    }
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (value === null || value === undefined) {
        flattened[newKey] = value
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings for simple cases
        if (value.length === 0) {
          flattened[newKey] = null
        } else if (value.every(item => typeof item !== 'object')) {
          flattened[newKey] = value.join(', ')
        } else {
          // For complex arrays, store as JSON string
          flattened[newKey] = JSON.stringify(value)
        }
      } else if (typeof value === 'object') {
        const nestedFlattened = this.flattenObject(value, maxDepth, newKey, depth + 1)
        Object.assign(flattened, nestedFlattened)
      } else {
        flattened[newKey] = value
      }
    }
    
    return flattened
  }

  /**
   * Sanitize object to ensure all values are serializable
   */
  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        sanitized[key] = null
      } else if (typeof value === 'function') {
        sanitized[key] = '[Function]'
      } else if (value instanceof Date) {
        sanitized[key] = value.toISOString().split('T')[0]
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = JSON.stringify(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  /**
   * Extract headers from normalized data
   */
  private extractHeaders(data: Record<string, any>[]): string[] {
    const headerSet = new Set<string>()
    
    // Collect all unique keys from all objects
    for (const item of data.slice(0, 100)) { // Sample first 100 items for performance
      Object.keys(item).forEach(key => headerSet.add(key))
    }
    
    return Array.from(headerSet).sort()
  }

  /**
   * Analyze JSON structure
   */
  private analyzeStructure(
    data: any,
    warnings: ValidationError[] = [],
    depth: number = 0
  ): {
    type: 'object' | 'array' | 'primitive'
    depth: number
    arrayLength?: number
    keys?: string[]
  } {
    if (Array.isArray(data)) {
      return {
        type: 'array',
        depth: depth + 1,
        arrayLength: data.length
      }
    }
    
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data)
      let maxChildDepth = depth
      
      for (const value of Object.values(data)) {
        if (typeof value === 'object' && value !== null) {
          const childStructure = this.analyzeStructure(value, warnings, depth + 1)
          maxChildDepth = Math.max(maxChildDepth, childStructure.depth)
        }
      }
      
      return {
        type: 'object',
        depth: maxChildDepth + 1,
        keys
      }
    }
    
    return {
      type: 'primitive',
      depth: depth + 1
    }
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
    const fileName = file instanceof File ? file.name : 'unknown.json'
    const fileSize = file instanceof File ? file.size : 
                     file instanceof Buffer ? file.length : 
                     content.length
    
    // Generate sample data (first 5 rows)
    const sampleData = data.slice(0, 5)
    
    return {
      name: fileName,
      size: fileSize,
      type: 'application/json',
      headers,
      sampleData,
      estimatedRows: data.length,
      checksum: this.generateChecksum(content)
    }
  }

  /**
   * Get empty metadata for error cases
   */
  private getEmptyMetadata(file: File | Buffer | string): FileMetadata {
    const fileName = file instanceof File ? file.name : 'unknown.json'
    const fileSize = file instanceof File ? file.size : 0
    
    return {
      name: fileName,
      size: fileSize,
      type: 'application/json',
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
      return file.toString('utf8')
    }
    
    if (file instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file, 'utf8')
      })
    }
    
    throw new Error('Unsupported file type')
  }

  /**
   * Generate simple checksum
   */
  private generateChecksum(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
}