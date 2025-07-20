import {
  ValidationRule,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ProductValidationRules,
  ProductRecord
} from '../types'

export class ValidationEngine {
  private customValidators = new Map<string, (value: any, rule: ValidationRule) => Promise<boolean>>()
  private businessRules = new Map<string, (data: Record<string, any>) => Promise<ValidationError[]>>()

  constructor() {
    this.initializeDefaultValidators()
    this.initializeBusinessRules()
  }

  /**
   * Validate data with multi-level validation
   */
  public async validateData(
    data: Record<string, any>[],
    rules: ValidationRule[],
    level: 'basic' | 'standard' | 'strict' = 'standard'
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    let validRows = 0

    // Group rules by validation level
    const basicRules = rules.filter(r => r.type === 'required')
    const standardRules = rules.filter(r => ['required', 'format', 'range'].includes(r.type))
    const strictRules = rules

    const activeRules = level === 'basic' ? basicRules : 
                       level === 'standard' ? standardRules : 
                       strictRules

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex]
      const rowErrors: ValidationError[] = []
      const rowWarnings: ValidationWarning[] = []

      // Field-level validation
      for (const rule of activeRules) {
        try {
          const fieldResult = await this.validateField(row[rule.field], rule, rowIndex)
          if (!fieldResult.isValid) {
            if (rule.severity === 'warning') {
              rowWarnings.push(...fieldResult.errors.map(e => ({
                type: e.type as any,
                field: e.field,
                value: e.value,
                message: e.message,
                suggestion: e.suggestion || '',
                row: rowIndex
              })))
            } else {
              rowErrors.push(...fieldResult.errors)
            }
          }
        } catch (error) {
          rowErrors.push({
            type: 'custom',
            field: rule.field,
            value: row[rule.field],
            message: `Validation error: ${(error as Error).message}`,
            severity: 'error',
            row: rowIndex
          })
        }
      }

      // Business rule validation (strict level only)
      if (level === 'strict') {
        try {
          const businessErrors = await this.validateBusinessRules(row)
          rowErrors.push(...businessErrors.map(e => ({ ...e, row: rowIndex })))
        } catch (error) {
          rowErrors.push({
            type: 'business_rule',
            field: 'general',
            value: row,
            message: `Business rule validation failed: ${(error as Error).message}`,
            severity: 'error',
            row: rowIndex
          })
        }
      }

      // Cross-field validation
      const crossFieldErrors = await this.validateCrossFields(row, activeRules, rowIndex)
      rowErrors.push(...crossFieldErrors)

      errors.push(...rowErrors)
      warnings.push(...rowWarnings)

      if (rowErrors.length === 0) {
        validRows++
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowsProcessed: data.length,
      validRows
    }
  }

  /**
   * Validate individual field
   */
  private async validateField(
    value: any,
    rule: ValidationRule,
    rowIndex: number
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          errors.push({
            type: 'missing_required',
            field: rule.field,
            value,
            message: rule.message || `${rule.field} is required`,
            severity: rule.severity,
            row: rowIndex,
            suggestion: `Please provide a value for ${rule.field}`
          })
        }
        break

      case 'format':
        if (value !== undefined && value !== null && value !== '') {
          const isValid = await this.validateFormat(value, rule)
          if (!isValid) {
            errors.push({
              type: 'invalid_format',
              field: rule.field,
              value,
              message: rule.message || `Invalid format for ${rule.field}`,
              severity: rule.severity,
              row: rowIndex,
              suggestion: this.getFormatSuggestion(rule)
            })
          }
        }
        break

      case 'range':
        if (value !== undefined && value !== null && value !== '') {
          const isValid = await this.validateRange(value, rule)
          if (!isValid) {
            errors.push({
              type: 'invalid_format',
              field: rule.field,
              value,
              message: rule.message || `Value out of range for ${rule.field}`,
              severity: rule.severity,
              row: rowIndex,
              suggestion: this.getRangeSuggestion(rule)
            })
          }
        }
        break

      case 'custom':
        const validator = this.customValidators.get(rule.field)
        if (validator) {
          const isValid = await validator(value, rule)
          if (!isValid) {
            errors.push({
              type: 'custom',
              field: rule.field,
              value,
              message: rule.message || `Custom validation failed for ${rule.field}`,
              severity: rule.severity,
              row: rowIndex
            })
          }
        }
        break

      case 'business':
        // Business rules are handled separately
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      rowsProcessed: 1,
      validRows: errors.length === 0 ? 1 : 0
    }
  }

  /**
   * Validate format constraints
   */
  private async validateFormat(value: any, rule: ValidationRule): Promise<boolean> {
    const constraint = rule.constraint

    if (constraint.pattern && constraint.pattern instanceof RegExp) {
      return constraint.pattern.test(String(value))
    }

    if (constraint.type) {
      switch (constraint.type) {
        case 'email':
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
        
        case 'url':
          try {
            new URL(String(value))
            return true
          } catch {
            return false
          }
        
        case 'number':
          return !isNaN(Number(value))
        
        case 'integer':
          return Number.isInteger(Number(value))
        
        case 'currency':
          return /^\$?\d+(\.\d{2})?$/.test(String(value).replace(/,/g, ''))
        
        case 'date':
          return !isNaN(Date.parse(String(value)))
        
        default:
          return true
      }
    }

    return true
  }

  /**
   * Validate range constraints
   */
  private async validateRange(value: any, rule: ValidationRule): Promise<boolean> {
    const constraint = rule.constraint
    const numValue = Number(value)

    if (constraint.min !== undefined && numValue < constraint.min) {
      return false
    }

    if (constraint.max !== undefined && numValue > constraint.max) {
      return false
    }

    if (constraint.minLength !== undefined && String(value).length < constraint.minLength) {
      return false
    }

    if (constraint.maxLength !== undefined && String(value).length > constraint.maxLength) {
      return false
    }

    if (constraint.allowedValues && Array.isArray(constraint.allowedValues)) {
      return constraint.allowedValues.includes(value)
    }

    return true
  }

  /**
   * Validate cross-field dependencies
   */
  private async validateCrossFields(
    row: Record<string, any>,
    rules: ValidationRule[],
    rowIndex: number
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = []
    const dependentRules = rules.filter(r => r.dependencies && r.dependencies.length > 0)

    for (const rule of dependentRules) {
      if (!rule.dependencies) continue

      for (const dependency of rule.dependencies) {
        const dependentValue = row[dependency]
        const currentValue = row[rule.field]

        if (rule.constraint.dependsOn === dependency) {
          if (dependentValue && !currentValue) {
            errors.push({
              type: 'missing_required',
              field: rule.field,
              value: currentValue,
              message: `${rule.field} is required when ${dependency} is provided`,
              severity: 'error',
              row: rowIndex,
              suggestion: `Provide a value for ${rule.field} or remove ${dependency}`
            })
          }
        }
      }
    }

    return errors
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(row: Record<string, any>): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    for (const [ruleName, validator] of this.businessRules.entries()) {
      try {
        const ruleErrors = await validator(row)
        errors.push(...ruleErrors)
      } catch (error) {
        errors.push({
          type: 'business_rule',
          field: 'general',
          value: row,
          message: `Business rule '${ruleName}' failed: ${(error as Error).message}`,
          severity: 'error'
        })
      }
    }

    return errors
  }

  /**
   * Initialize default validators
   */
  private initializeDefaultValidators(): void {
    // Product name validator
    this.customValidators.set('name', async (value: any) => {
      return value && String(value).trim().length >= 3
    })

    // Price validator
    this.customValidators.set('price', async (value: any) => {
      const num = Number(value)
      return !isNaN(num) && num > 0 && num < 1000000
    })

    // SKU validator
    this.customValidators.set('sku', async (value: any) => {
      if (!value) return true // Optional field
      return /^[A-Z0-9-_]{3,20}$/i.test(String(value))
    })

    // Category validator
    this.customValidators.set('category', async (value: any) => {
      return value && String(value).trim().length >= 2
    })

    // Commission rate validator
    this.customValidators.set('commissionRate', async (value: any) => {
      if (!value) return true // Optional field
      const num = Number(value)
      return !isNaN(num) && num >= 0 && num <= 100
    })
  }

  /**
   * Initialize business rules
   */
  private initializeBusinessRules(): void {
    // Price consistency rule
    this.businessRules.set('price_consistency', async (row: Record<string, any>) => {
      const errors: ValidationError[] = []
      const price = Number(row.price)
      const category = String(row.category || '').toLowerCase()

      // Category-based price validation
      if (category.includes('luxury') && price < 100) {
        errors.push({
          type: 'business_rule',
          field: 'price',
          value: price,
          message: 'Luxury items typically have higher prices',
          severity: 'warning',
          suggestion: 'Consider reviewing the price for luxury category items'
        })
      }

      if (category.includes('electronic') && price > 50000) {
        errors.push({
          type: 'business_rule',
          field: 'price',
          value: price,
          message: 'Electronics price seems unusually high',
          severity: 'warning',
          suggestion: 'Please verify the price for this electronic item'
        })
      }

      return errors
    })

    // Image URL accessibility rule
    this.businessRules.set('image_accessibility', async (row: Record<string, any>) => {
      const errors: ValidationError[] = []
      const imageUrl = row.imageUrl

      if (imageUrl) {
        try {
          // Basic URL validation
          new URL(imageUrl)
          
          // Check for common image formats
          if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl)) {
            errors.push({
              type: 'business_rule',
              field: 'imageUrl',
              value: imageUrl,
              message: 'Image URL should point to a valid image format',
              severity: 'warning',
              suggestion: 'Use common image formats like JPG, PNG, or WebP'
            })
          }
        } catch {
          errors.push({
            type: 'business_rule',
            field: 'imageUrl',
            value: imageUrl,
            message: 'Invalid image URL format',
            severity: 'error',
            suggestion: 'Provide a valid URL format starting with http:// or https://'
          })
        }
      }

      return errors
    })

    // Commission rate reasonableness rule
    this.businessRules.set('commission_reasonableness', async (row: Record<string, any>) => {
      const errors: ValidationError[] = []
      const commissionRate = Number(row.commissionRate)
      const price = Number(row.price)

      if (commissionRate && price) {
        const commissionAmount = (price * commissionRate) / 100

        if (commissionAmount > price * 0.5) {
          errors.push({
            type: 'business_rule',
            field: 'commissionRate',
            value: commissionRate,
            message: 'Commission rate seems unusually high',
            severity: 'warning',
            suggestion: 'Commission rates above 50% of product price are uncommon'
          })
        }

        if (commissionAmount < 0.01) {
          errors.push({
            type: 'business_rule',
            field: 'commissionRate',
            value: commissionRate,
            message: 'Commission rate might be too low to be profitable',
            severity: 'info',
            suggestion: 'Consider if the commission amount meets your minimum requirements'
          })
        }
      }

      return errors
    })
  }

  /**
   * Add custom validator
   */
  public addCustomValidator(
    field: string,
    validator: (value: any, rule: ValidationRule) => Promise<boolean>
  ): void {
    this.customValidators.set(field, validator)
  }

  /**
   * Add business rule
   */
  public addBusinessRule(
    name: string,
    rule: (data: Record<string, any>) => Promise<ValidationError[]>
  ): void {
    this.businessRules.set(name, rule)
  }

  /**
   * Get validation rules for product data
   */
  public getProductValidationRules(): ValidationRule[] {
    return [
      {
        field: 'name',
        type: 'required',
        constraint: { minLength: 3, maxLength: 200 },
        message: 'Product name is required and must be 3-200 characters',
        severity: 'error'
      },
      {
        field: 'price',
        type: 'required',
        constraint: { type: 'number', min: 0.01, max: 999999.99 },
        message: 'Price is required and must be a positive number',
        severity: 'error'
      },
      {
        field: 'category',
        type: 'required',
        constraint: { minLength: 2, maxLength: 100 },
        message: 'Category is required',
        severity: 'error'
      },
      {
        field: 'description',
        type: 'format',
        constraint: { maxLength: 2000 },
        message: 'Description must be less than 2000 characters',
        severity: 'warning'
      },
      {
        field: 'sku',
        type: 'format',
        constraint: { pattern: /^[A-Z0-9-_]{3,20}$/i },
        message: 'SKU must be 3-20 characters using letters, numbers, hyphens, and underscores',
        severity: 'warning'
      },
      {
        field: 'imageUrl',
        type: 'format',
        constraint: { type: 'url' },
        message: 'Image URL must be a valid URL',
        severity: 'warning'
      },
      {
        field: 'commissionRate',
        type: 'range',
        constraint: { min: 0, max: 100 },
        message: 'Commission rate must be between 0 and 100',
        severity: 'warning'
      }
    ]
  }

  /**
   * Get format suggestion for validation errors
   */
  private getFormatSuggestion(rule: ValidationRule): string {
    const constraint = rule.constraint

    if (constraint.type) {
      switch (constraint.type) {
        case 'email':
          return 'Use format: user@example.com'
        case 'url':
          return 'Use format: https://example.com'
        case 'currency':
          return 'Use format: $123.45 or 123.45'
        case 'date':
          return 'Use format: YYYY-MM-DD or MM/DD/YYYY'
        default:
          return 'Please check the format requirements'
      }
    }

    return 'Please provide a valid value'
  }

  /**
   * Get range suggestion for validation errors
   */
  private getRangeSuggestion(rule: ValidationRule): string {
    const constraint = rule.constraint
    const suggestions: string[] = []

    if (constraint.min !== undefined) {
      suggestions.push(`minimum: ${constraint.min}`)
    }
    if (constraint.max !== undefined) {
      suggestions.push(`maximum: ${constraint.max}`)
    }
    if (constraint.minLength !== undefined) {
      suggestions.push(`minimum length: ${constraint.minLength}`)
    }
    if (constraint.maxLength !== undefined) {
      suggestions.push(`maximum length: ${constraint.maxLength}`)
    }

    return suggestions.length > 0 ? `Valid range - ${suggestions.join(', ')}` : 'Please check the value range'
  }
}