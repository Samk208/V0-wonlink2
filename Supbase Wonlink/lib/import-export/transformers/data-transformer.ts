import { TransformationRule, DataTransformation, ValidationError } from '../types'

export class DataTransformer {
  private currencyPatterns = {
    symbols: /[$€£¥₹₦₽¢]/g,
    codes: /(USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|SEK|NZD|MXN|SGD|HKD|NOK|TRY|RUB|INR|BRL|ZAR|KRW|PLN|CZK|HUF|BGN|RON|HRK|DKK|THB|MYR|PHP|IDR|VND|NGN|EGP|MAD|KES|GHS|UGX|TZS|ZMW|BWP|NAD|SZL|LSL|AOA|MZN|XAF|XOF)/gi,
    formats: [
      /^\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)$/,
      /^(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|SEK|NZD|MXN|SGD|HKD|NOK|TRY|RUB|INR|BRL|ZAR|KRW|PLN|CZK|HUF|BGN|RON|HRK|DKK|THB|MYR|PHP|IDR|VND|NGN|EGP|MAD|KES|GHS|UGX|TZS|ZMW|BWP|NAD|SZL|LSL|AOA|MZN|XAF|XOF)$/i
    ]
  }

  private datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
    /^\d{4}\/\d{2}\/\d{2}$/,
    /^\d{2}\.\d{2}\.\d{4}$/,
    /^\w{3}\s\d{1,2},?\s\d{4}$/i
  ]

  private categoryMappings = new Map<string, string>([
    // Electronics
    ['electronics', 'Electronics'],
    ['electronic', 'Electronics'],
    ['tech', 'Electronics'],
    ['technology', 'Electronics'],
    ['computers', 'Electronics'],
    ['computer', 'Electronics'],
    ['laptops', 'Electronics'],
    ['laptop', 'Electronics'],
    ['phones', 'Electronics'],
    ['phone', 'Electronics'],
    ['mobile', 'Electronics'],
    ['smartphones', 'Electronics'],
    ['smartphone', 'Electronics'],
    
    // Clothing & Fashion
    ['clothing', 'Clothing & Fashion'],
    ['clothes', 'Clothing & Fashion'],
    ['fashion', 'Clothing & Fashion'],
    ['apparel', 'Clothing & Fashion'],
    ['shirts', 'Clothing & Fashion'],
    ['shirt', 'Clothing & Fashion'],
    ['pants', 'Clothing & Fashion'],
    ['jeans', 'Clothing & Fashion'],
    ['shoes', 'Clothing & Fashion'],
    ['footwear', 'Clothing & Fashion'],
    ['accessories', 'Clothing & Fashion'],
    
    // Home & Garden
    ['home', 'Home & Garden'],
    ['house', 'Home & Garden'],
    ['garden', 'Home & Garden'],
    ['furniture', 'Home & Garden'],
    ['kitchen', 'Home & Garden'],
    ['bathroom', 'Home & Garden'],
    ['bedroom', 'Home & Garden'],
    ['living room', 'Home & Garden'],
    ['outdoor', 'Home & Garden'],
    ['tools', 'Home & Garden'],
    
    // Health & Beauty
    ['health', 'Health & Beauty'],
    ['beauty', 'Health & Beauty'],
    ['cosmetics', 'Health & Beauty'],
    ['skincare', 'Health & Beauty'],
    ['makeup', 'Health & Beauty'],
    ['wellness', 'Health & Beauty'],
    ['fitness', 'Health & Beauty'],
    ['supplements', 'Health & Beauty'],
    
    // Sports & Recreation
    ['sports', 'Sports & Recreation'],
    ['sport', 'Sports & Recreation'],
    ['recreation', 'Sports & Recreation'],
    ['fitness', 'Sports & Recreation'],
    ['outdoor', 'Sports & Recreation'],
    ['games', 'Sports & Recreation'],
    ['toys', 'Sports & Recreation'],
    
    // Food & Beverages
    ['food', 'Food & Beverages'],
    ['beverages', 'Food & Beverages'],
    ['drinks', 'Food & Beverages'],
    ['snacks', 'Food & Beverages'],
    ['grocery', 'Food & Beverages'],
    ['groceries', 'Food & Beverages']
  ])

  /**
   * Transform data based on field type and rules
   */
  public async transformData(
    data: Record<string, any>[],
    transformations: Record<string, DataTransformation>
  ): Promise<{
    transformedData: Record<string, any>[]
    errors: ValidationError[]
    warnings: ValidationError[]
  }> {
    const transformedData: Record<string, any>[] = []
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex]
      const transformedRow: Record<string, any> = { ...row }

      for (const [field, transformation] of Object.entries(transformations)) {
        const value = row[field]
        
        if (value === undefined || value === null || value === '') {
          continue
        }

        try {
          const result = await this.transformField(value, transformation, rowIndex, field)
          transformedRow[field] = result.value
          
          if (result.warnings) {
            warnings.push(...result.warnings)
          }
        } catch (error) {
          errors.push({
            type: 'custom',
            field,
            value,
            message: `Transformation failed: ${(error as Error).message}`,
            severity: 'error',
            row: rowIndex
          })
        }
      }

      transformedData.push(transformedRow)
    }

    return { transformedData, errors, warnings }
  }

  /**
   * Transform individual field value
   */
  private async transformField(
    value: any,
    transformation: DataTransformation,
    rowIndex: number,
    field: string
  ): Promise<{
    value: any
    warnings?: ValidationError[]
  }> {
    let transformedValue = value
    const warnings: ValidationError[] = []

    switch (transformation.type) {
      case 'currency':
        transformedValue = this.transformCurrency(value, transformation.rules)
        break
      
      case 'date':
        const dateResult = this.transformDate(value, transformation.rules)
        transformedValue = dateResult.value
        if (dateResult.warning) {
          warnings.push({
            type: 'data_quality',
            field,
            value,
            message: dateResult.warning,
            severity: 'warning',
            row: rowIndex
          })
        }
        break
      
      case 'text':
        transformedValue = this.transformText(value, transformation.rules)
        break
      
      case 'category':
        transformedValue = this.transformCategory(value, transformation.rules)
        break
      
      case 'number':
        const numberResult = this.transformNumber(value, transformation.rules)
        transformedValue = numberResult.value
        if (numberResult.warning) {
          warnings.push({
            type: 'data_quality',
            field,
            value,
            message: numberResult.warning,
            severity: 'warning',
            row: rowIndex
          })
        }
        break
      
      case 'url':
        transformedValue = this.transformUrl(value, transformation.rules)
        break
      
      case 'custom':
        transformedValue = await this.applyCustomTransformation(value, transformation.rules)
        break
    }

    return { value: transformedValue, warnings: warnings.length > 0 ? warnings : undefined }
  }

  /**
   * Transform currency values
   */
  private transformCurrency(value: any, rules: TransformationRule[]): number {
    let strValue = String(value).trim()
    
    // Remove currency symbols and codes
    strValue = strValue.replace(this.currencyPatterns.symbols, '')
    strValue = strValue.replace(this.currencyPatterns.codes, '')
    
    // Remove commas and other formatting
    strValue = strValue.replace(/,/g, '').trim()
    
    // Extract numeric value
    const numericValue = parseFloat(strValue)
    
    if (isNaN(numericValue)) {
      throw new Error(`Invalid currency format: ${value}`)
    }
    
    // Apply transformation rules
    let result = numericValue
    for (const rule of rules) {
      if (rule.name === 'conversion' && rule.transformer) {
        result = rule.transformer(result)
      } else if (rule.name === 'round') {
        const decimals = rule.transformer ? rule.transformer(2) : 2
        result = Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals)
      }
    }
    
    return result
  }

  /**
   * Transform date values
   */
  private transformDate(value: any, rules: TransformationRule[]): { value: Date | string; warning?: string } {
    const strValue = String(value).trim()
    let date: Date | null = null
    let warning: string | undefined
    
    // Try parsing as ISO date first
    date = new Date(strValue)
    if (!isNaN(date.getTime())) {
      return { value: date }
    }
    
    // Try common date patterns
    for (const pattern of this.datePatterns) {
      if (pattern.test(strValue)) {
        date = this.parseDate(strValue, pattern)
        if (date && !isNaN(date.getTime())) {
          break
        }
      }
    }
    
    if (!date || isNaN(date.getTime())) {
      warning = `Could not parse date format: ${value}`
      date = new Date(strValue)
    }
    
    // Apply transformation rules
    for (const rule of rules) {
      if (rule.name === 'format' && rule.transformer) {
        return { value: rule.transformer(date), warning }
      }
    }
    
    return { value: date, warning }
  }

  /**
   * Parse date with specific pattern
   */
  private parseDate(value: string, pattern: RegExp): Date | null {
    try {
      if (pattern.source.includes('\\d{4}-\\d{2}-\\d{2}')) {
        return new Date(value)
      } else if (pattern.source.includes('\\d{2}\\/\\d{2}\\/\\d{4}')) {
        const [month, day, year] = value.split('/')
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else if (pattern.source.includes('\\d{2}-\\d{2}-\\d{4}')) {
        const [month, day, year] = value.split('-')
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      return new Date(value)
    } catch {
      return null
    }
  }

  /**
   * Transform text values
   */
  private transformText(value: any, rules: TransformationRule[]): string {
    let result = String(value)
    
    for (const rule of rules) {
      switch (rule.name) {
        case 'trim':
          result = result.trim()
          break
        case 'lowercase':
          result = result.toLowerCase()
          break
        case 'uppercase':
          result = result.toUpperCase()
          break
        case 'title_case':
          result = result.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          )
          break
        case 'clean_whitespace':
          result = result.replace(/\s+/g, ' ').trim()
          break
        case 'remove_special_chars':
          result = result.replace(/[^\w\s]/g, '')
          break
        case 'regex_replace':
          if (rule.pattern && rule.replacement !== undefined) {
            result = result.replace(rule.pattern, rule.replacement)
          }
          break
        case 'custom':
          if (rule.transformer) {
            result = rule.transformer(result)
          }
          break
      }
    }
    
    return result
  }

  /**
   * Transform category values
   */
  private transformCategory(value: any, rules: TransformationRule[]): string {
    const strValue = String(value).trim().toLowerCase()
    
    // Try to map to standard category
    const standardCategory = this.categoryMappings.get(strValue)
    if (standardCategory) {
      return standardCategory
    }
    
    // Try partial matches
    for (const [key, mappedValue] of this.categoryMappings.entries()) {
      if (strValue.includes(key) || key.includes(strValue)) {
        return mappedValue
      }
    }
    
    // Apply custom transformation rules
    let result = String(value).trim()
    for (const rule of rules) {
      if (rule.name === 'title_case') {
        result = result.replace(/\w\S*/g, (txt) =>
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      } else if (rule.transformer) {
        result = rule.transformer(result)
      }
    }
    
    return result
  }

  /**
   * Transform number values
   */
  private transformNumber(value: any, rules: TransformationRule[]): { value: number; warning?: string } {
    let strValue = String(value).trim()
    let warning: string | undefined
    
    // Remove common formatting
    strValue = strValue.replace(/,/g, '')
    
    const numericValue = parseFloat(strValue)
    if (isNaN(numericValue)) {
      warning = `Could not parse as number: ${value}`
      return { value: 0, warning }
    }
    
    let result = numericValue
    
    for (const rule of rules) {
      switch (rule.name) {
        case 'round':
          const decimals = rule.transformer ? rule.transformer(0) : 0
          result = Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals)
          break
        case 'abs':
          result = Math.abs(result)
          break
        case 'multiply':
          if (rule.transformer) {
            result = result * rule.transformer(1)
          }
          break
        case 'custom':
          if (rule.transformer) {
            result = rule.transformer(result)
          }
          break
      }
    }
    
    return { value: result, warning }
  }

  /**
   * Transform URL values
   */
  private transformUrl(value: any, rules: TransformationRule[]): string {
    let url = String(value).trim()
    
    // Add protocol if missing
    if (!/^https?:\/\//.test(url) && url.length > 0) {
      url = 'https://' + url
    }
    
    // Apply transformation rules
    for (const rule of rules) {
      if (rule.transformer) {
        url = rule.transformer(url)
      }
    }
    
    return url
  }

  /**
   * Apply custom transformation
   */
  private async applyCustomTransformation(value: any, rules: TransformationRule[]): Promise<any> {
    let result = value
    
    for (const rule of rules) {
      if (rule.transformer) {
        result = await rule.transformer(result)
      }
    }
    
    return result
  }

  /**
   * Get default transformation rules for common field types
   */
  public getDefaultTransformationRules(fieldType: string): TransformationRule[] {
    switch (fieldType) {
      case 'currency':
        return [
          { name: 'round', transformer: () => 2 }
        ]
      
      case 'text':
        return [
          { name: 'trim' },
          { name: 'clean_whitespace' }
        ]
      
      case 'category':
        return [
          { name: 'title_case' }
        ]
      
      case 'date':
        return [
          { name: 'format', transformer: (date: Date) => date.toISOString().split('T')[0] }
        ]
      
      case 'url':
        return []
      
      default:
        return []
    }
  }

  /**
   * Validate transformation configuration
   */
  public validateTransformation(transformation: DataTransformation): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (!transformation.type) {
      errors.push('Transformation type is required')
    }
    
    if (!Array.isArray(transformation.rules)) {
      errors.push('Transformation rules must be an array')
    }
    
    for (const rule of transformation.rules) {
      if (!rule.name) {
        errors.push('Rule name is required')
      }
      
      if (rule.validator && typeof rule.validator !== 'function') {
        errors.push(`Validator for rule '${rule.name}' must be a function`)
      }
      
      if (rule.transformer && typeof rule.transformer !== 'function') {
        errors.push(`Transformer for rule '${rule.name}' must be a function`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}