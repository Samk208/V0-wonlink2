import { ColumnMapping, ColumnPattern, MappingTemplate } from '../types'

export class IntelligentColumnMapper {
  private patterns: ColumnPattern[] = [
    // Product Name patterns
    {
      field: 'name',
      patterns: [
        /^(product\s*)?(name|title|item|product)$/i,
        /^(product\s*)?title$/i,
        /^item\s*name$/i,
        /^product\s*description$/i
      ],
      priority: 10,
      isRequired: true,
      aliases: ['product_name', 'item_name', 'title', 'product_title']
    },
    
    // Price patterns
    {
      field: 'price',
      patterns: [
        /^(unit\s*)?(price|cost|amount|value|rate)$/i,
        /^(selling\s*)?(price|cost)$/i,
        /^retail\s*price$/i,
        /^\$?price\$?$/i
      ],
      priority: 10,
      isRequired: true,
      aliases: ['unit_price', 'selling_price', 'cost', 'amount', 'value']
    },
    
    // Category patterns
    {
      field: 'category',
      patterns: [
        /^(product\s*)?(category|type|genre|class|classification)$/i,
        /^category\s*name$/i,
        /^product\s*type$/i
      ],
      priority: 9,
      isRequired: true,
      aliases: ['product_category', 'type', 'classification', 'genre']
    },
    
    // Description patterns
    {
      field: 'description',
      patterns: [
        /^(product\s*)?(description|desc|detail|info|summary)$/i,
        /^long\s*description$/i,
        /^product\s*details$/i
      ],
      priority: 8,
      isRequired: false,
      aliases: ['desc', 'details', 'product_description', 'summary']
    },
    
    // Brand patterns
    {
      field: 'brand',
      patterns: [
        /^(brand|manufacturer|make|company)$/i,
        /^brand\s*name$/i,
        /^manufacturer\s*name$/i
      ],
      priority: 7,
      isRequired: false,
      aliases: ['manufacturer', 'make', 'company', 'brand_name']
    },
    
    // SKU patterns
    {
      field: 'sku',
      patterns: [
        /^(sku|product\s*id|item\s*id|code|barcode)$/i,
        /^product\s*code$/i,
        /^item\s*code$/i
      ],
      priority: 6,
      isRequired: false,
      aliases: ['product_id', 'item_id', 'product_code', 'barcode', 'upc']
    },
    
    // Image URL patterns
    {
      field: 'imageUrl',
      patterns: [
        /^(image|photo|picture|img)\s*(url|link|src)?$/i,
        /^product\s*(image|photo)$/i,
        /^thumbnail$/i
      ],
      priority: 5,
      isRequired: false,
      aliases: ['image_url', 'photo_url', 'picture_url', 'thumbnail', 'img_src']
    },
    
    // Tags patterns
    {
      field: 'tags',
      patterns: [
        /^(tags|keywords|labels)$/i,
        /^product\s*tags$/i
      ],
      priority: 4,
      isRequired: false,
      aliases: ['keywords', 'labels', 'product_tags']
    },
    
    // Availability patterns
    {
      field: 'availability',
      patterns: [
        /^(availability|status|stock\s*status|in\s*stock)$/i,
        /^inventory\s*status$/i
      ],
      priority: 3,
      isRequired: false,
      aliases: ['stock_status', 'inventory_status', 'status']
    },
    
    // Commission rate patterns
    {
      field: 'commissionRate',
      patterns: [
        /^(commission|commission\s*rate|referral\s*rate)$/i,
        /^affiliate\s*commission$/i
      ],
      priority: 2,
      isRequired: false,
      aliases: ['commission_rate', 'referral_rate', 'affiliate_commission']
    }
  ]

  /**
   * Auto-detect column mappings using pattern matching
   */
  public autoMapColumns(headers: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = []
    const usedTargets = new Set<string>()
    
    // Sort patterns by priority (highest first)
    const sortedPatterns = [...this.patterns].sort((a, b) => b.priority - a.priority)
    
    for (const header of headers) {
      const cleanHeader = this.cleanHeader(header)
      let bestMatch: { pattern: ColumnPattern; confidence: number } | null = null
      
      for (const pattern of sortedPatterns) {
        if (usedTargets.has(pattern.field)) continue
        
        const confidence = this.calculateConfidence(cleanHeader, pattern)
        
        if (confidence > 0.3 && (!bestMatch || confidence > bestMatch.confidence)) {
          bestMatch = { pattern, confidence }
        }
      }
      
      if (bestMatch) {
        mappings.push({
          sourceColumn: header,
          targetField: bestMatch.pattern.field,
          confidence: bestMatch.confidence,
          isRequired: bestMatch.pattern.isRequired
        })
        usedTargets.add(bestMatch.pattern.field)
      } else {
        // Map to custom field if no pattern matches
        mappings.push({
          sourceColumn: header,
          targetField: `custom_${this.slugify(cleanHeader)}`,
          confidence: 0,
          isRequired: false
        })
      }
    }
    
    return mappings
  }

  /**
   * Calculate confidence score for a header against a pattern
   */
  private calculateConfidence(header: string, pattern: ColumnPattern): number {
    let maxConfidence = 0
    
    // Check regex patterns
    for (const regex of pattern.patterns) {
      if (regex.test(header)) {
        maxConfidence = Math.max(maxConfidence, 0.9)
      }
    }
    
    // Check aliases with fuzzy matching
    for (const alias of pattern.aliases) {
      const similarity = this.calculateStringSimilarity(header.toLowerCase(), alias.toLowerCase())
      if (similarity > 0.8) {
        maxConfidence = Math.max(maxConfidence, similarity * 0.8)
      }
    }
    
    // Partial matches
    const headerLower = header.toLowerCase()
    for (const alias of pattern.aliases) {
      if (headerLower.includes(alias.toLowerCase()) || alias.toLowerCase().includes(headerLower)) {
        maxConfidence = Math.max(maxConfidence, 0.6)
      }
    }
    
    return maxConfidence
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    const distance = matrix[str2.length][str1.length]
    const maxLength = Math.max(str1.length, str2.length)
    return 1 - (distance / maxLength)
  }

  /**
   * Clean and normalize header strings
   */
  private cleanHeader(header: string): string {
    return header
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
  }

  /**
   * Convert string to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  /**
   * Validate mapping completeness
   */
  public validateMappings(mappings: ColumnMapping[]): {
    isValid: boolean
    missingRequired: string[]
    duplicateTargets: string[]
    lowConfidence: ColumnMapping[]
  } {
    const requiredFields = this.patterns.filter(p => p.isRequired).map(p => p.field)
    const mappedFields = mappings.map(m => m.targetField)
    
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field))
    
    const targetCounts = mappedFields.reduce((acc, field) => {
      acc[field] = (acc[field] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const duplicateTargets = Object.keys(targetCounts).filter(field => targetCounts[field] > 1)
    
    const lowConfidence = mappings.filter(m => m.confidence < 0.5 && m.isRequired)
    
    return {
      isValid: missingRequired.length === 0 && duplicateTargets.length === 0,
      missingRequired,
      duplicateTargets,
      lowConfidence
    }
  }

  /**
   * Save mapping as template
   */
  public async saveMappingTemplate(
    mappings: ColumnMapping[], 
    name: string, 
    userId: string,
    description?: string
  ): Promise<MappingTemplate> {
    const template: MappingTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      userId,
      mappings,
      createdAt: new Date(),
      useCount: 0
    }
    
    // TODO: Implement database storage for mapping templates
    // This would typically save to Supabase or your chosen database
    
    return template
  }

  /**
   * Load mapping templates for user
   */
  public async loadMappingTemplates(userId: string): Promise<MappingTemplate[]> {
    // TODO: Implement database retrieval for mapping templates
    // This would typically load from Supabase or your chosen database
    return []
  }

  /**
   * Apply mapping template to new data
   */
  public applyMappingTemplate(template: MappingTemplate, newHeaders: string[]): ColumnMapping[] {
    const templateMappings = new Map(template.mappings.map(m => [m.sourceColumn.toLowerCase(), m]))
    const appliedMappings: ColumnMapping[] = []
    
    for (const header of newHeaders) {
      const templateMapping = templateMappings.get(header.toLowerCase())
      
      if (templateMapping) {
        appliedMappings.push({
          ...templateMapping,
          sourceColumn: header,
          confidence: Math.min(templateMapping.confidence, 0.95)
        })
      } else {
        const autoMapping = this.autoMapColumns([header])[0]
        appliedMappings.push(autoMapping)
      }
    }
    
    return appliedMappings
  }

  /**
   * Generate preview of mapped data
   */
  public generateMappingPreview(
    mappings: ColumnMapping[], 
    sampleData: Record<string, any>[],
    maxRows: number = 5
  ): {
    headers: string[]
    preview: Record<string, any>[]
    warnings: string[]
  } {
    const headers = mappings.map(m => m.targetField)
    const preview: Record<string, any>[] = []
    const warnings: string[] = []
    
    const previewData = sampleData.slice(0, maxRows)
    
    for (const row of previewData) {
      const mappedRow: Record<string, any> = {}
      
      for (const mapping of mappings) {
        const sourceValue = row[mapping.sourceColumn]
        
        if (sourceValue !== undefined && sourceValue !== null && sourceValue !== '') {
          mappedRow[mapping.targetField] = sourceValue
        } else if (mapping.isRequired) {
          warnings.push(`Missing required value for '${mapping.targetField}' in row`)
          mappedRow[mapping.targetField] = null
        }
      }
      
      preview.push(mappedRow)
    }
    
    return { headers, preview, warnings }
  }

  /**
   * Suggest improvements for existing mappings
   */
  public suggestMappingImprovements(
    mappings: ColumnMapping[], 
    sampleData: Record<string, any>[]
  ): {
    suggestions: Array<{
      type: 'confidence' | 'data_type' | 'completeness'
      message: string
      mapping: ColumnMapping
      suggestedField?: string
    }>
  } {
    const suggestions: any[] = []
    
    for (const mapping of mappings) {
      // Check confidence
      if (mapping.confidence < 0.7) {
        suggestions.push({
          type: 'confidence',
          message: `Low confidence mapping for '${mapping.sourceColumn}' -> '${mapping.targetField}'`,
          mapping
        })
      }
      
      // Check data type consistency
      if (sampleData.length > 0) {
        const values = sampleData.map(row => row[mapping.sourceColumn]).filter(v => v != null)
        if (values.length > 0) {
          const dataType = this.inferDataType(values)
          const expectedType = this.getExpectedDataType(mapping.targetField)
          
          if (dataType !== expectedType) {
            suggestions.push({
              type: 'data_type',
              message: `Data type mismatch: '${mapping.sourceColumn}' contains ${dataType} but ${mapping.targetField} expects ${expectedType}`,
              mapping
            })
          }
        }
      }
    }
    
    return { suggestions }
  }

  private inferDataType(values: any[]): string {
    if (values.length === 0) return 'unknown'
    
    const sample = values.slice(0, 10)
    
    if (sample.every(v => typeof v === 'number' || !isNaN(Number(v)))) {
      return 'number'
    }
    
    if (sample.every(v => /^\d{4}-\d{2}-\d{2}/.test(String(v)))) {
      return 'date'
    }
    
    if (sample.every(v => /^https?:\/\//.test(String(v)))) {
      return 'url'
    }
    
    return 'string'
  }

  private getExpectedDataType(field: string): string {
    const typeMap: Record<string, string> = {
      'price': 'number',
      'commissionRate': 'number',
      'imageUrl': 'url',
      'name': 'string',
      'description': 'string',
      'category': 'string',
      'brand': 'string',
      'sku': 'string'
    }
    
    return typeMap[field] || 'string'
  }
}