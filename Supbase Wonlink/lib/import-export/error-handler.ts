import { ValidationError, ProcessingResult, CircuitBreakerState } from './types'

export interface ErrorRecoveryStrategy {
  name: string
  canHandle: (error: Error) => boolean
  recover: (error: Error, context: any) => Promise<any>
  maxRetries: number
  backoffMs: number
}

export interface RollbackOperation {
  id: string
  jobId: string
  timestamp: Date
  operations: Array<{
    type: 'insert' | 'update' | 'delete'
    table: string
    data: any
    condition?: any
  }>
  status: 'pending' | 'completed' | 'failed'
}

export class ErrorHandler {
  private recoveryStrategies = new Map<string, ErrorRecoveryStrategy>()
  private rollbackOperations = new Map<string, RollbackOperation>()
  private circuitBreakers = new Map<string, CircuitBreakerState>()
  private retryAttempts = new Map<string, number>()
  private errorCategorization = new Map<string, string>()

  constructor() {
    this.initializeDefaultStrategies()
    this.initializeErrorCategorization()
  }

  /**
   * Handle error with automatic recovery attempts
   */
  public async handleError(
    error: Error,
    context: {
      jobId: string
      operation: string
      data?: any
      retryable?: boolean
    }
  ): Promise<{
    recovered: boolean
    result?: any
    rollbackId?: string
    suggestion?: string
  }> {
    const errorKey = `${context.jobId}_${context.operation}`
    const category = this.categorizeError(error)
    
    // Check circuit breaker
    if (this.isCircuitOpen(context.operation)) {
      return {
        recovered: false,
        suggestion: 'Service temporarily unavailable due to multiple failures. Please try again later.'
      }
    }

    // Find appropriate recovery strategy
    const strategy = this.findRecoveryStrategy(error)
    
    if (!strategy || !context.retryable) {
      this.recordFailure(context.operation)
      return {
        recovered: false,
        suggestion: this.getErrorSuggestion(error, category)
      }
    }

    const currentAttempts = this.retryAttempts.get(errorKey) || 0
    
    if (currentAttempts >= strategy.maxRetries) {
      this.recordFailure(context.operation)
      return {
        recovered: false,
        suggestion: `Maximum retry attempts (${strategy.maxRetries}) exceeded. ${this.getErrorSuggestion(error, category)}`
      }
    }

    try {
      // Apply backoff delay
      if (currentAttempts > 0) {
        const delay = strategy.backoffMs * Math.pow(2, currentAttempts - 1)
        await this.sleep(delay)
      }

      this.retryAttempts.set(errorKey, currentAttempts + 1)
      
      const result = await strategy.recover(error, context)
      
      // Success - reset retry counter
      this.retryAttempts.delete(errorKey)
      this.recordSuccess(context.operation)
      
      return {
        recovered: true,
        result
      }
    } catch (recoveryError) {
      this.recordFailure(context.operation)
      
      return {
        recovered: false,
        suggestion: `Recovery failed: ${(recoveryError as Error).message}. ${this.getErrorSuggestion(error, category)}`
      }
    }
  }

  /**
   * Create rollback point for batch operation
   */
  public async createRollbackPoint(
    jobId: string,
    operations: RollbackOperation['operations']
  ): Promise<string> {
    const rollbackId = `rollback_${jobId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const rollback: RollbackOperation = {
      id: rollbackId,
      jobId,
      timestamp: new Date(),
      operations,
      status: 'pending'
    }
    
    this.rollbackOperations.set(rollbackId, rollback)
    
    return rollbackId
  }

  /**
   * Execute rollback operation
   */
  public async executeRollback(rollbackId: string): Promise<{
    success: boolean
    rolledBackOperations: number
    errors: ValidationError[]
  }> {
    const rollback = this.rollbackOperations.get(rollbackId)
    
    if (!rollback) {
      throw new Error(`Rollback operation ${rollbackId} not found`)
    }
    
    if (rollback.status !== 'pending') {
      throw new Error(`Rollback operation ${rollbackId} is not in pending state`)
    }
    
    const errors: ValidationError[] = []
    let rolledBackOperations = 0
    
    try {
      // Reverse the operations in reverse order
      const reversedOperations = rollback.operations.slice().reverse()
      
      for (const operation of reversedOperations) {
        try {
          await this.executeReverseOperation(operation)
          rolledBackOperations++
        } catch (error) {
          errors.push({
            type: 'custom',
            field: 'rollback',
            value: operation,
            message: `Failed to rollback operation: ${(error as Error).message}`,
            severity: 'error'
          })
        }
      }
      
      rollback.status = errors.length === 0 ? 'completed' : 'failed'
      
      return {
        success: errors.length === 0,
        rolledBackOperations,
        errors
      }
    } catch (error) {
      rollback.status = 'failed'
      throw error
    }
  }

  /**
   * Get available rollback operations for a job
   */
  public getAvailableRollbacks(jobId: string): RollbackOperation[] {
    return Array.from(this.rollbackOperations.values())
      .filter(rollback => rollback.jobId === jobId && rollback.status === 'pending')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Categorize errors for better handling
   */
  public categorizeError(error: Error): string {
    const message = error.message.toLowerCase()
    
    for (const [pattern, category] of this.errorCategorization.entries()) {
      if (message.includes(pattern)) {
        return category
      }
    }
    
    // Check error types
    if (error.name === 'ValidationError') return 'validation'
    if (error.name === 'TypeError') return 'data_type'
    if (error.name === 'ReferenceError') return 'configuration'
    if (error.name === 'SyntaxError') return 'format'
    
    return 'unknown'
  }

  /**
   * Generate error report for analysis
   */
  public generateErrorReport(errors: ValidationError[]): {
    summary: {
      total: number
      byCategory: Record<string, number>
      bySeverity: Record<string, number>
      byField: Record<string, number>
    }
    recommendations: string[]
    patterns: Array<{
      pattern: string
      count: number
      suggestion: string
    }>
  } {
    const summary = {
      total: errors.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byField: {} as Record<string, number>
    }
    
    const recommendations: string[] = []
    const patternCounts = new Map<string, number>()
    
    for (const error of errors) {
      // Category analysis
      summary.byCategory[error.type] = (summary.byCategory[error.type] || 0) + 1
      
      // Severity analysis
      summary.bySeverity[error.severity] = (summary.bySeverity[error.severity] || 0) + 1
      
      // Field analysis
      summary.byField[error.field] = (summary.byField[error.field] || 0) + 1
      
      // Pattern analysis
      const pattern = this.extractErrorPattern(error)
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1)
    }
    
    // Generate recommendations
    if (summary.byCategory.missing_required > errors.length * 0.3) {
      recommendations.push('Consider reviewing required field mappings - many required fields are missing')
    }
    
    if (summary.byCategory.invalid_format > errors.length * 0.2) {
      recommendations.push('Data format issues detected - review transformation rules')
    }
    
    if (summary.byCategory.business_rule > 0) {
      recommendations.push('Business rule violations found - review data quality and business constraints')
    }
    
    // Extract top patterns
    const patterns = Array.from(patternCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => ({
        pattern,
        count,
        suggestion: this.getPatternSuggestion(pattern)
      }))
    
    return {
      summary,
      recommendations,
      patterns
    }
  }

  /**
   * Add custom recovery strategy
   */
  public addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.name, strategy)
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Network error recovery
    this.recoveryStrategies.set('network', {
      name: 'network',
      canHandle: (error) => 
        error.message.includes('network') || 
        error.message.includes('timeout') ||
        error.message.includes('connection'),
      recover: async (error, context) => {
        // Implement network retry logic
        return context.data
      },
      maxRetries: 3,
      backoffMs: 1000
    })
    
    // Database error recovery
    this.recoveryStrategies.set('database', {
      name: 'database',
      canHandle: (error) =>
        error.message.includes('database') ||
        error.message.includes('connection pool') ||
        error.message.includes('deadlock'),
      recover: async (error, context) => {
        // Implement database retry logic
        return context.data
      },
      maxRetries: 2,
      backoffMs: 2000
    })
    
    // Memory error recovery
    this.recoveryStrategies.set('memory', {
      name: 'memory',
      canHandle: (error) =>
        error.message.includes('memory') ||
        error.message.includes('heap'),
      recover: async (error, context) => {
        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
        
        // Reduce batch size
        if (context.data && Array.isArray(context.data)) {
          return context.data.slice(0, Math.floor(context.data.length / 2))
        }
        
        return context.data
      },
      maxRetries: 1,
      backoffMs: 5000
    })
    
    // Validation error recovery
    this.recoveryStrategies.set('validation', {
      name: 'validation',
      canHandle: (error) =>
        error.message.includes('validation') ||
        error.message.includes('invalid'),
      recover: async (error, context) => {
        // Attempt to clean and retry data
        if (context.data && typeof context.data === 'object') {
          const cleaned = this.cleanDataForRetry(context.data)
          return cleaned
        }
        return context.data
      },
      maxRetries: 1,
      backoffMs: 0
    })
  }

  /**
   * Initialize error categorization patterns
   */
  private initializeErrorCategorization(): void {
    this.errorCategorization.set('required', 'validation')
    this.errorCategorization.set('missing', 'validation')
    this.errorCategorization.set('invalid format', 'format')
    this.errorCategorization.set('out of range', 'validation')
    this.errorCategorization.set('network', 'infrastructure')
    this.errorCategorization.set('timeout', 'infrastructure')
    this.errorCategorization.set('connection', 'infrastructure')
    this.errorCategorization.set('database', 'infrastructure')
    this.errorCategorization.set('memory', 'resource')
    this.errorCategorization.set('heap', 'resource')
    this.errorCategorization.set('permission', 'security')
    this.errorCategorization.set('unauthorized', 'security')
    this.errorCategorization.set('forbidden', 'security')
  }

  private findRecoveryStrategy(error: Error): ErrorRecoveryStrategy | undefined {
    for (const strategy of this.recoveryStrategies.values()) {
      if (strategy.canHandle(error)) {
        return strategy
      }
    }
    return undefined
  }

  private isCircuitOpen(operation: string): boolean {
    const breaker = this.circuitBreakers.get(operation)
    if (!breaker) return false
    
    if (breaker.state === 'open') {
      const timeSinceLastFailure = breaker.lastFailureTime ? 
        Date.now() - breaker.lastFailureTime.getTime() : 0
      
      if (timeSinceLastFailure > breaker.timeout) {
        breaker.state = 'half_open'
        return false
      }
      return true
    }
    
    return false
  }

  private recordFailure(operation: string): void {
    const breaker = this.circuitBreakers.get(operation) || {
      failures: 0,
      state: 'closed' as const,
      timeout: 30000
    }
    
    breaker.failures++
    breaker.lastFailureTime = new Date()
    
    if (breaker.failures >= 5) {
      breaker.state = 'open'
    }
    
    this.circuitBreakers.set(operation, breaker)
  }

  private recordSuccess(operation: string): void {
    const breaker = this.circuitBreakers.get(operation)
    if (breaker) {
      breaker.failures = 0
      breaker.state = 'closed'
      delete breaker.lastFailureTime
    }
  }

  private async executeReverseOperation(operation: RollbackOperation['operations'][0]): Promise<void> {
    // This would integrate with your database/storage layer
    // Implementation depends on your specific storage solution
    
    switch (operation.type) {
      case 'insert':
        // Delete the inserted record
        break
      case 'update':
        // Restore the previous values
        break
      case 'delete':
        // Re-insert the deleted record
        break
    }
  }

  private cleanDataForRetry(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.cleanDataForRetry(item))
    }
    
    if (typeof data === 'object' && data !== null) {
      const cleaned: any = {}
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined && value !== '') {
          cleaned[key] = typeof value === 'string' ? value.trim() : value
        }
      }
      return cleaned
    }
    
    return data
  }

  private extractErrorPattern(error: ValidationError): string {
    return `${error.type}_${error.field}`
  }

  private getPatternSuggestion(pattern: string): string {
    const suggestions: Record<string, string> = {
      'missing_required_name': 'Ensure product names are provided in the source data',
      'missing_required_price': 'Verify price column mapping and data completeness',
      'missing_required_category': 'Check category field mapping and provide default values',
      'invalid_format_price': 'Review price format - ensure numeric values without special characters',
      'invalid_format_imageUrl': 'Verify image URLs are properly formatted',
      'business_rule_price': 'Review price ranges for different product categories'
    }
    
    return suggestions[pattern] || 'Review data format and mapping for this field'
  }

  private getErrorSuggestion(error: Error, category: string): string {
    const suggestions: Record<string, string> = {
      'validation': 'Review data format and validation rules',
      'format': 'Check data format and transformation rules',
      'infrastructure': 'Check network connection and system resources',
      'resource': 'Reduce batch size or increase available memory',
      'security': 'Verify permissions and authentication',
      'configuration': 'Check system configuration and settings'
    }
    
    return suggestions[category] || 'Review error details and contact support if needed'
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}