import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
}

// Default rate limit: 100 requests per hour
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100,
  message: 'Too many requests, please try again later'
}

// File upload rate limit: 10 uploads per hour
export const UPLOAD_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Upload limit exceeded, please try again later'
}

// API rate limit: 200 requests per hour
export const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 200,
  message: 'API rate limit exceeded'
}

/**
 * Rate limiting middleware
 */
export function createRateLimiter(config: RateLimitConfig = DEFAULT_RATE_LIMIT) {
  return (req: NextRequest, identifier?: string) => {
    const key = identifier || req.ip || req.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k)
      }
    }
    
    const userLimit = rateLimitStore.get(key)
    
    if (!userLimit) {
      // First request
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { allowed: true, remaining: config.maxRequests - 1 }
    }
    
    if (now > userLimit.resetTime) {
      // Window expired, reset
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { allowed: true, remaining: config.maxRequests - 1 }
    }
    
    if (userLimit.count >= config.maxRequests) {
      // Rate limit exceeded
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: userLimit.resetTime,
        message: config.message
      }
    }
    
    // Increment count
    userLimit.count++
    rateLimitStore.set(key, userLimit)
    
    return { 
      allowed: true, 
      remaining: config.maxRequests - userLimit.count 
    }
  }
}

/**
 * Authentication middleware
 */
export async function requireAuth(req: NextRequest) {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return {
        success: false,
        error: 'Unauthorized',
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }
    
    return { success: true, user }
  } catch (error) {
    return {
      success: false,
      error: 'Authentication failed',
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * Input validation middleware
 */
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    try {
      let data: any
      
      const contentType = req.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await req.json()
      } else if (contentType?.includes('multipart/form-data')) {
        const formData = await req.formData()
        data = Object.fromEntries(formData.entries())
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData()
        data = Object.fromEntries(formData.entries())
      } else {
        // Try to parse as JSON for other content types
        const text = await req.text()
        if (text) {
          data = JSON.parse(text)
        } else {
          data = {}
        }
      }
      
      const validatedData = schema.parse(data)
      
      return {
        success: true,
        data: validatedData
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          })),
          response: NextResponse.json(
            { 
              error: 'Validation failed',
              details: error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
              }))
            },
            { status: 400 }
          )
        }
      }
      
      return {
        success: false,
        error: 'Invalid request data',
        response: NextResponse.json(
          { error: 'Invalid request data' },
          { status: 400 }
        )
      }
    }
  }
}

/**
 * CSRF protection middleware
 */
export function validateCSRF(req: NextRequest) {
  const token = req.headers.get('x-csrf-token')
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  
  // For development, allow localhost
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001'
  ].filter(Boolean)
  
  // Check origin
  if (origin && !allowedOrigins.includes(origin)) {
    return {
      success: false,
      error: 'Invalid origin',
      response: NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }
  }
  
  // Check referer for state-changing operations
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (!referer || !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      return {
        success: false,
        error: 'Invalid referer',
        response: NextResponse.json(
          { error: 'Invalid referer' },
          { status: 403 }
        )
      }
    }
  }
  
  return { success: true }
}

/**
 * File validation middleware
 */
export interface FileValidationConfig {
  maxSize: number // in bytes
  allowedTypes: string[]
  allowedExtensions: string[]
  requireMagicNumber?: boolean
}

const FILE_MAGIC_NUMBERS = {
  'text/csv': [0x2C], // CSV files often start with comma or other text
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4B], // ZIP signature (xlsx is zip)
  'application/json': [0x7B, 0x5B], // { or [ for JSON
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46]
}

export function validateFile(file: File, config: FileValidationConfig) {
  // Check file size
  if (file.size > config.maxSize) {
    return {
      success: false,
      error: `File size too large. Maximum size is ${Math.round(config.maxSize / 1024 / 1024)}MB`
    }
  }
  
  // Check MIME type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
    }
  }
  
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!config.allowedExtensions.includes(fileExtension)) {
    return {
      success: false,
      error: `Invalid file extension. Allowed extensions: ${config.allowedExtensions.join(', ')}`
    }
  }
  
  return { success: true }
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase()
}

/**
 * Generate secure filename
 */
export function generateSecureFilename(userId: string, originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const sanitizedName = sanitizeFilename(originalName)
  
  return `${userId}/${timestamp}_${randomString}_${sanitizedName}`
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
  )
  
  // HSTS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')
  
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  
  return response
}

/**
 * Comprehensive security middleware wrapper
 */
export interface SecurityMiddlewareConfig {
  requireAuth?: boolean
  rateLimit?: RateLimitConfig
  validateCSRF?: boolean
  inputValidation?: z.ZodSchema<any>
  fileValidation?: FileValidationConfig
}

export function withSecurity(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  config: SecurityMiddlewareConfig = {}
) {
  return async (req: NextRequest, context: any = {}) => {
    try {
      // Rate limiting
      if (config.rateLimit) {
        const rateLimiter = createRateLimiter(config.rateLimit)
        const rateLimitResult = rateLimiter(req)
        
        if (!rateLimitResult.allowed) {
          const response = NextResponse.json(
            { error: rateLimitResult.message || 'Rate limit exceeded' },
            { status: 429 }
          )
          response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString())
          return addSecurityHeaders(response)
        }
        
        // Add rate limit headers
        context.rateLimit = {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }
      }
      
      // CSRF validation
      if (config.validateCSRF) {
        const csrfResult = validateCSRF(req)
        if (!csrfResult.success) {
          return addSecurityHeaders(csrfResult.response!)
        }
      }
      
      // Authentication
      if (config.requireAuth) {
        const authResult = await requireAuth(req)
        if (!authResult.success) {
          return addSecurityHeaders(authResult.response!)
        }
        context.user = authResult.user
      }
      
      // Input validation
      if (config.inputValidation) {
        const validator = validateInput(config.inputValidation)
        const validationResult = await validator(req)
        if (!validationResult.success) {
          return addSecurityHeaders(validationResult.response!)
        }
        context.validatedData = validationResult.data
      }
      
      // Execute handler
      const response = await handler(req, context)
      
      // Add security headers to response
      return addSecurityHeaders(response)
      
    } catch (error) {
      console.error('Security middleware error:', error)
      const response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
      return addSecurityHeaders(response)
    }
  }
}
