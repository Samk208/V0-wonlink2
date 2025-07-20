import { DuplicateInfo, ValidationError } from '../types'

export interface DuplicateDetectionConfig {
  matchFields: string[]
  similarity: {
    threshold: number // 0-1, how similar values need to be
    algorithm: 'exact' | 'fuzzy' | 'phonetic' | 'custom'
    caseSensitive: boolean
    ignoreWhitespace: boolean
  }
  actions: {
    onDuplicate: 'skip' | 'update' | 'create_new' | 'prompt'
    mergeStrategy?: 'first_wins' | 'last_wins' | 'merge_fields' | 'custom'
  }
  performance: {
    batchSize: number
    maxComparisons: number
    useIndexing: boolean
  }
}

export interface DuplicateGroup {
  id: string
  originalRow: number
  duplicateRows: number[]
  matchFields: string[]
  confidence: number
  records: Record<string, any>[]
  suggestedAction: 'skip' | 'update' | 'create_new'
  differences: Array<{
    field: string
    values: any[]
    recommendation: string
  }>
}

export class DuplicateDetector {
  private config: DuplicateDetectionConfig
  private phonetic?: any // For phonetic matching
  private customMatcher?: (a: any, b: any, field: string) => number

  constructor(config: Partial<DuplicateDetectionConfig> = {}) {
    this.config = {
      matchFields: ['name', 'sku', 'id'],
      similarity: {
        threshold: 0.85,
        algorithm: 'fuzzy',
        caseSensitive: false,
        ignoreWhitespace: true
      },
      actions: {
        onDuplicate: 'prompt',
        mergeStrategy: 'last_wins'
      },
      performance: {
        batchSize: 1000,
        maxComparisons: 10000,
        useIndexing: true
      },
      ...config
    }
  }

  /**
   * Detect duplicates in dataset
   */
  public async detectDuplicates(
    data: Record<string, any>[],
    onProgress?: (progress: { processed: number; total: number; duplicatesFound: number }) => void
  ): Promise<{
    duplicateGroups: DuplicateGroup[]
    cleanData: Record<string, any>[]
    summary: {
      totalRecords: number
      duplicateRecords: number
      uniqueRecords: number
      duplicateGroups: number
      confidence: {
        high: number // > 0.9
        medium: number // 0.7-0.9
        low: number // < 0.7
      }
    }
    errors: ValidationError[]
  }> {
    const errors: ValidationError[] = []
    const duplicateGroups: DuplicateGroup[] = []
    const processedIndices = new Set<number>()
    
    let duplicateRecords = 0
    let processed = 0
    
    try {
      // Create search index if enabled
      const searchIndex = this.config.performance.useIndexing ? 
        this.createSearchIndex(data) : null
      
      // Process in batches for memory efficiency
      for (let i = 0; i < data.length; i += this.config.performance.batchSize) {
        const batchEnd = Math.min(i + this.config.performance.batchSize, data.length)
        
        for (let j = i; j < batchEnd; j++) {
          if (processedIndices.has(j)) continue
          
          const record = data[j]
          const duplicates = await this.findDuplicates(
            record,
            data,
            j,
            searchIndex,
            processedIndices
          )
          
          if (duplicates.length > 0) {
            const group = this.createDuplicateGroup(
              j,
              duplicates,
              data,
              duplicateGroups.length
            )
            
            duplicateGroups.push(group)
            duplicateRecords += duplicates.length + 1
            
            // Mark all duplicates as processed
            processedIndices.add(j)
            duplicates.forEach(idx => processedIndices.add(idx))
          }
          
          processed++
          
          if (onProgress && processed % 100 === 0) {
            onProgress({
              processed,
              total: data.length,
              duplicatesFound: duplicateRecords
            })
          }
        }
      }
      
      // Generate clean data (removing duplicates based on action)
      const cleanData = this.generateCleanData(data, duplicateGroups)
      
      // Generate summary
      const summary = this.generateSummary(data.length, duplicateGroups)
      
      return {
        duplicateGroups,
        cleanData,
        summary,
        errors
      }
    } catch (error) {
      errors.push({
        type: 'custom',
        field: 'duplicate_detection',
        value: data,
        message: `Duplicate detection failed: ${(error as Error).message}`,
        severity: 'error'
      })
      
      return {
        duplicateGroups: [],
        cleanData: data,
        summary: {
          totalRecords: data.length,
          duplicateRecords: 0,
          uniqueRecords: data.length,
          duplicateGroups: 0,
          confidence: { high: 0, medium: 0, low: 0 }
        },
        errors
      }
    }
  }

  /**
   * Find potential duplicates for a record
   */
  private async findDuplicates(
    record: Record<string, any>,
    data: Record<string, any>[],
    currentIndex: number,
    searchIndex: Map<string, number[]> | null,
    processedIndices: Set<number>
  ): Promise<number[]> {
    const duplicates: Array<{ index: number; confidence: number }> = []
    let comparisons = 0
    
    // Get candidate indices from search index or scan all
    const candidateIndices = searchIndex ? 
      this.getCandidatesFromIndex(record, searchIndex) :
      Array.from({ length: data.length }, (_, i) => i)
    
    for (const candidateIndex of candidateIndices) {
      if (candidateIndex === currentIndex || 
          processedIndices.has(candidateIndex) ||
          comparisons >= this.config.performance.maxComparisons) {
        continue
      }
      
      const candidate = data[candidateIndex]
      const similarity = await this.calculateSimilarity(record, candidate)
      
      if (similarity.confidence >= this.config.similarity.threshold) {
        duplicates.push({
          index: candidateIndex,
          confidence: similarity.confidence
        })
      }
      
      comparisons++
    }
    
    // Sort by confidence and return indices
    return duplicates
      .sort((a, b) => b.confidence - a.confidence)
      .map(d => d.index)
  }

  /**
   * Calculate similarity between two records
   */
  private async calculateSimilarity(
    record1: Record<string, any>,
    record2: Record<string, any>
  ): Promise<{
    confidence: number
    matchedFields: string[]
    details: Record<string, number>
  }> {
    const details: Record<string, number> = {}
    const matchedFields: string[] = []
    let totalWeight = 0
    let weightedScore = 0
    
    for (const field of this.config.matchFields) {
      const value1 = record1[field]
      const value2 = record2[field]
      
      if (value1 == null || value2 == null) {
        // Skip null/undefined values but don't penalize
        continue
      }
      
      const fieldSimilarity = await this.calculateFieldSimilarity(value1, value2, field)
      const weight = this.getFieldWeight(field)
      
      details[field] = fieldSimilarity
      totalWeight += weight
      weightedScore += fieldSimilarity * weight
      
      if (fieldSimilarity >= this.config.similarity.threshold) {
        matchedFields.push(field)
      }
    }
    
    const confidence = totalWeight > 0 ? weightedScore / totalWeight : 0
    
    return {
      confidence,
      matchedFields,
      details
    }
  }

  /**
   * Calculate similarity for a specific field
   */
  private async calculateFieldSimilarity(value1: any, value2: any, field: string): Promise<number> {
    if (this.customMatcher) {
      return this.customMatcher(value1, value2, field)
    }
    
    const str1 = this.normalizeValue(String(value1))
    const str2 = this.normalizeValue(String(value2))
    
    if (str1 === str2) return 1.0
    
    switch (this.config.similarity.algorithm) {
      case 'exact':
        return str1 === str2 ? 1.0 : 0.0
      
      case 'fuzzy':
        return this.calculateLevenshteinSimilarity(str1, str2)
      
      case 'phonetic':
        return this.calculatePhoneticSimilarity(str1, str2)
      
      default:
        return this.calculateLevenshteinSimilarity(str1, str2)
    }
  }

  /**
   * Normalize value for comparison
   */
  private normalizeValue(value: string): string {
    let normalized = value
    
    if (!this.config.similarity.caseSensitive) {
      normalized = normalized.toLowerCase()
    }
    
    if (this.config.similarity.ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ').trim()
    }
    
    return normalized
  }

  /**
   * Calculate Levenshtein similarity
   */
  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    if (str1.length === 0 && str2.length === 0) return 1.0
    if (str1.length === 0 || str2.length === 0) return 0.0
    
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    const distance = matrix[str2.length][str1.length]
    const maxLength = Math.max(str1.length, str2.length)
    
    return 1 - (distance / maxLength)
  }

  /**
   * Calculate phonetic similarity (basic implementation)
   */
  private calculatePhoneticSimilarity(str1: string, str2: string): number {
    // Simple soundex-like algorithm
    const soundex1 = this.soundex(str1)
    const soundex2 = this.soundex(str2)
    
    return soundex1 === soundex2 ? 0.9 : this.calculateLevenshteinSimilarity(str1, str2)
  }

  /**
   * Simple Soundex implementation
   */
  private soundex(str: string): string {
    const code = str.toUpperCase().replace(/[^A-Z]/g, '')
    if (code.length === 0) return '0000'
    
    let result = code[0]
    const mapping: Record<string, string> = {
      'BFPV': '1', 'CGJKQSXZ': '2', 'DT': '3',
      'L': '4', 'MN': '5', 'R': '6'
    }
    
    for (let i = 1; i < code.length && result.length < 4; i++) {
      const char = code[i]
      for (const [chars, digit] of Object.entries(mapping)) {
        if (chars.includes(char) && result[result.length - 1] !== digit) {
          result += digit
          break
        }
      }
    }
    
    return result.padEnd(4, '0').substring(0, 4)
  }

  /**
   * Get field weight for similarity calculation
   */
  private getFieldWeight(field: string): number {
    const weights: Record<string, number> = {
      'id': 3.0,
      'sku': 2.5,
      'name': 2.0,
      'email': 2.0,
      'phone': 1.5,
      'description': 1.0
    }
    
    return weights[field] || 1.0
  }

  /**
   * Create search index for faster lookups
   */
  private createSearchIndex(data: Record<string, any>[]): Map<string, number[]> {
    const index = new Map<string, number[]>()
    
    for (let i = 0; i < data.length; i++) {
      const record = data[i]
      
      for (const field of this.config.matchFields) {
        const value = record[field]
        if (value == null) continue
        
        const normalized = this.normalizeValue(String(value))
        const keys = this.generateIndexKeys(normalized, field)
        
        for (const key of keys) {
          if (!index.has(key)) {
            index.set(key, [])
          }
          index.get(key)!.push(i)
        }
      }
    }
    
    return index
  }

  /**
   * Generate index keys for a value
   */
  private generateIndexKeys(value: string, field: string): string[] {
    const keys: string[] = []
    
    // Full value
    keys.push(`${field}:${value}`)
    
    // Prefixes for fuzzy matching
    if (value.length >= 3) {
      for (let i = 3; i <= Math.min(value.length, 8); i++) {
        keys.push(`${field}:${value.substring(0, i)}`)
      }
    }
    
    // Words for name fields
    if (field === 'name' && value.includes(' ')) {
      const words = value.split(' ').filter(w => w.length >= 3)
      words.forEach(word => keys.push(`${field}:${word}`))
    }
    
    return keys
  }

  /**
   * Get candidate indices from search index
   */
  private getCandidatesFromIndex(record: Record<string, any>, index: Map<string, number[]>): number[] {
    const candidates = new Set<number>()
    
    for (const field of this.config.matchFields) {
      const value = record[field]
      if (value == null) continue
      
      const normalized = this.normalizeValue(String(value))
      const keys = this.generateIndexKeys(normalized, field)
      
      for (const key of keys) {
        const indices = index.get(key) || []
        indices.forEach(idx => candidates.add(idx))
      }
    }
    
    return Array.from(candidates)
  }

  /**
   * Create duplicate group
   */
  private createDuplicateGroup(
    originalIndex: number,
    duplicateIndices: number[],
    data: Record<string, any>[],
    groupId: number
  ): DuplicateGroup {
    const originalRecord = data[originalIndex]
    const duplicateRecords = duplicateIndices.map(idx => data[idx])
    const allRecords = [originalRecord, ...duplicateRecords]
    
    // Calculate overall confidence
    const similarities = duplicateRecords.map(record => 
      this.calculateSimilarity(originalRecord, record)
    )
    
    const avgConfidence = similarities.length > 0 ?
      similarities.reduce((sum, s) => sum + s.confidence, 0) / similarities.length : 1.0
    
    // Find matched fields
    const matchedFields = new Set<string>()
    similarities.forEach(s => s.matchedFields.forEach(f => matchedFields.add(f)))
    
    // Analyze differences
    const differences = this.analyzeDifferences(allRecords)
    
    // Suggest action
    const suggestedAction = this.suggestAction(originalRecord, duplicateRecords, avgConfidence)
    
    return {
      id: `group_${groupId}`,
      originalRow: originalIndex,
      duplicateRows: duplicateIndices,
      matchFields: Array.from(matchedFields),
      confidence: avgConfidence,
      records: allRecords,
      suggestedAction,
      differences
    }
  }

  /**
   * Analyze differences between records
   */
  private analyzeDifferences(records: Record<string, any>[]): Array<{
    field: string
    values: any[]
    recommendation: string
  }> {
    const differences: Array<{
      field: string
      values: any[]
      recommendation: string
    }> = []
    
    const allFields = new Set<string>()
    records.forEach(record => Object.keys(record).forEach(key => allFields.add(key)))
    
    for (const field of allFields) {
      const values = records.map(record => record[field])
      const uniqueValues = [...new Set(values.filter(v => v != null))]
      
      if (uniqueValues.length > 1) {
        let recommendation = 'Manual review required'
        
        if (field === 'name' || field === 'title') {
          recommendation = 'Use longest/most complete version'
        } else if (field === 'price' || field === 'cost') {
          recommendation = 'Use most recent value'
        } else if (field === 'description') {
          recommendation = 'Merge descriptions if different'
        } else if (field === 'date' || field.includes('date')) {
          recommendation = 'Use most recent date'
        }
        
        differences.push({
          field,
          values: uniqueValues,
          recommendation
        })
      }
    }
    
    return differences
  }

  /**
   * Suggest action for duplicate group
   */
  private suggestAction(
    original: Record<string, any>,
    duplicates: Record<string, any>[],
    confidence: number
  ): 'skip' | 'update' | 'create_new' {
    if (confidence > 0.95) {
      return 'skip' // Very high confidence, likely exact duplicate
    } else if (confidence > 0.8) {
      return 'update' // High confidence, merge data
    } else {
      return 'create_new' // Lower confidence, might be different items
    }
  }

  /**
   * Generate clean data based on duplicate groups
   */
  private generateCleanData(
    data: Record<string, any>[],
    duplicateGroups: DuplicateGroup[]
  ): Record<string, any>[] {
    const skipIndices = new Set<number>()
    const cleanData: Record<string, any>[] = []
    
    // Mark indices to skip based on actions
    for (const group of duplicateGroups) {
      if (group.suggestedAction === 'skip') {
        group.duplicateRows.forEach(idx => skipIndices.add(idx))
      } else if (group.suggestedAction === 'update') {
        // Keep original, skip duplicates
        group.duplicateRows.forEach(idx => skipIndices.add(idx))
        // TODO: Implement merging logic
      }
    }
    
    // Create clean dataset
    for (let i = 0; i < data.length; i++) {
      if (!skipIndices.has(i)) {
        cleanData.push(data[i])
      }
    }
    
    return cleanData
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(
    totalRecords: number,
    duplicateGroups: DuplicateGroup[]
  ): {
    totalRecords: number
    duplicateRecords: number
    uniqueRecords: number
    duplicateGroups: number
    confidence: { high: number; medium: number; low: number }
  } {
    const duplicateRecords = duplicateGroups.reduce(
      (sum, group) => sum + group.duplicateRows.length + 1,
      0
    )
    
    const confidence = { high: 0, medium: 0, low: 0 }
    duplicateGroups.forEach(group => {
      if (group.confidence > 0.9) {
        confidence.high++
      } else if (group.confidence > 0.7) {
        confidence.medium++
      } else {
        confidence.low++
      }
    })
    
    return {
      totalRecords,
      duplicateRecords,
      uniqueRecords: totalRecords - duplicateRecords,
      duplicateGroups: duplicateGroups.length,
      confidence
    }
  }

  /**
   * Set custom similarity matcher
   */
  public setCustomMatcher(matcher: (a: any, b: any, field: string) => number): void {
    this.customMatcher = matcher
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<DuplicateDetectionConfig>): void {
    this.config = { ...this.config, ...config }
  }
}