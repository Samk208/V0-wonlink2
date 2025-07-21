import { createClient } from '@/utils/supabase/server'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECURITY = 'security'
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  userId?: string
  requestId?: string
  metadata?: Record<string, any>
  stack?: string
}

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log an entry with proper sanitization
   */
  private async logEntry(entry: LogEntry) {
    // Sanitize sensitive data
    const sanitizedEntry = this.sanitizeLogEntry(entry)
    
    // In development, also log to console
    if (this.isDevelopment) {
      const consoleMethod = entry.level === LogLevel.ERROR ? 'error' : 
                           entry.level === LogLevel.WARN ? 'warn' : 'log'
      console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.message}`, entry.metadata)
    }
    
    // In production, log to database or external service
    if (!this.isDevelopment) {
      try {
        const supabase = createClient()
        await supabase
          .from('audit_logs')
          .insert({
            level: sanitizedEntry.level,
            message: sanitizedEntry.message,
            timestamp: sanitizedEntry.timestamp,
            user_id: sanitizedEntry.userId,
            request_id: sanitizedEntry.requestId,
            metadata: sanitizedEntry.metadata,
            stack_trace: sanitizedEntry.stack
          })
      } catch (error) {
        // Fallback to console if database logging fails
        console.error('Failed to log to database:', error)
        console.error('Original log entry:', sanitizedEntry)
      }
    }
  }

  /**
   * Sanitize log entry to remove sensitive information
   */
  private sanitizeLogEntry(entry: LogEntry): LogEntry {
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'jwt', 'api_key', 'access_token'
    ]
    
    const sanitizedMetadata = entry.metadata ? { ...entry.metadata } : {}
    
    // Remove or mask sensitive data
    Object.keys(sanitizedMetadata).forEach(key => {
      const lowerKey = key.toLowerCase()
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitizedMetadata[key] = '[REDACTED]'
      }
      
      // Truncate very long values
      if (typeof sanitizedMetadata[key] === 'string' && sanitizedMetadata[key].length > 1000) {
        sanitizedMetadata[key] = sanitizedMetadata[key].substring(0, 1000) + '...[TRUNCATED]'
      }
    })
    
    return {
      ...entry,
      metadata: sanitizedMetadata
    }
  }

  /**
   * Generate request ID for tracing
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Debug level logging
   */
  async debug(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    await this.logEntry({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      userId,
      requestId,
      metadata
    })
  }

  /**
   * Info level logging
   */
  async info(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    await this.logEntry({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      userId,
      requestId,
      metadata
    })
  }

  /**
   * Warning level logging
   */
  async warn(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    await this.logEntry({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      userId,
      requestId,
      metadata
    })
  }

  /**
   * Error level logging
   */
  async error(message: string, error?: Error | any, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      userId,
      requestId,
      metadata: {
        ...metadata,
        error: error?.message || String(error)
      }
    }
    
    if (error instanceof Error) {
      logEntry.stack = error.stack
    }
    
    await this.logEntry(logEntry)
  }

  /**
   * Security event logging
   */
  async security(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    await this.logEntry({
      level: LogLevel.SECURITY,
      message,
      timestamp: new Date().toISOString(),
      userId,
      requestId,
      metadata: {
        ...metadata,
        severity: 'high',
        category: 'security_event'
      }
    })
  }

  /**
   * Log authentication events
   */
  async authEvent(event: 'login' | 'logout' | 'failed_login' | 'password_reset', userId?: string, metadata?: Record<string, any>) {
    await this.security(`Authentication event: ${event}`, {
      ...metadata,
      event_type: 'authentication',
      user_id: userId
    }, userId)
  }

  /**
   * Log file upload events
   */
  async fileUpload(userId: string, filename: string, fileSize: number, fileType: string, success: boolean, metadata?: Record<string, any>) {
    await this.info(`File upload ${success ? 'successful' : 'failed'}: ${filename}`, {
      ...metadata,
      event_type: 'file_upload',
      filename,
      file_size: fileSize,
      file_type: fileType,
      success
    }, userId)
  }

  /**
   * Log data processing events
   */
  async dataProcessing(userId: string, operation: string, recordCount: number, success: boolean, metadata?: Record<string, any>) {
    await this.info(`Data processing ${success ? 'completed' : 'failed'}: ${operation}`, {
      ...metadata,
      event_type: 'data_processing',
      operation,
      record_count: recordCount,
      success
    }, userId)
  }

  /**
   * Log security violations
   */
  async securityViolation(violation: string, userId?: string, metadata?: Record<string, any>) {
    await this.security(`Security violation: ${violation}`, {
      ...metadata,
      violation_type: violation,
      requires_investigation: true
    }, userId)
  }

  /**
   * Log rate limit violations
   */
  async rateLimitViolation(userId?: string, endpoint?: string, metadata?: Record<string, any>) {
    await this.security('Rate limit exceeded', {
      ...metadata,
      event_type: 'rate_limit_violation',
      endpoint,
      requires_monitoring: true
    }, userId)
  }
}

// Export singleton instance
export const logger = new SecureLogger()

// Export helper functions for common use cases
export const logError = (message: string, error?: Error | any, metadata?: Record<string, any>, userId?: string, requestId?: string) => 
  logger.error(message, error, metadata, userId, requestId)

export const logInfo = (message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) => 
  logger.info(message, metadata, userId, requestId)

export const logWarn = (message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) => 
  logger.warn(message, metadata, userId, requestId)

export const logSecurity = (message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) => 
  logger.security(message, metadata, userId, requestId)

export const logAuthEvent = (event: 'login' | 'logout' | 'failed_login' | 'password_reset', userId?: string, metadata?: Record<string, any>) => 
  logger.authEvent(event, userId, metadata)

export const logFileUpload = (userId: string, filename: string, fileSize: number, fileType: string, success: boolean, metadata?: Record<string, any>) => 
  logger.fileUpload(userId, filename, fileSize, fileType, success, metadata)

export const logDataProcessing = (userId: string, operation: string, recordCount: number, success: boolean, metadata?: Record<string, any>) => 
  logger.dataProcessing(userId, operation, recordCount, success, metadata)

export const logSecurityViolation = (violation: string, userId?: string, metadata?: Record<string, any>) => 
  logger.securityViolation(violation, userId, metadata)

export const logRateLimitViolation = (userId?: string, endpoint?: string, metadata?: Record<string, any>) => 
  logger.rateLimitViolation(userId, endpoint, metadata)
