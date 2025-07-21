import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email format').max(254)
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128)
const uuidSchema = z.string().uuid('Invalid UUID format')
const urlSchema = z.string().url('Invalid URL format').max(2048)
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional()

// Sanitization helpers
const sanitizeString = (str: string) => str.trim().replace(/[<>'"&]/g, '')
const sanitizeHtml = (str: string) => str.replace(/<[^>]*>/g, '')

// File upload validation
export const FileUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'File is required'),
  uploadType: z.enum(['products', 'campaigns', 'users']).optional().default('products')
})

// File processing validation
export const FileProcessingSchema = z.object({
  uploadId: z.string().uuid('Invalid upload ID'),
  options: z.object({
    batchSize: z.number().min(1).max(1000).optional().default(100),
    skipErrors: z.boolean().optional().default(false),
    validateOnly: z.boolean().optional().default(false)
  }).optional().default({})
})

// Product validation (for import/export)
export const ProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name too long')
    .transform(sanitizeString),
  description: z.string()
    .max(2000, 'Description too long')
    .transform(sanitizeHtml)
    .optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high'),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category name too long')
    .transform(sanitizeString),
  brand: z.string()
    .max(100, 'Brand name too long')
    .transform(sanitizeString)
    .optional(),
  sku: z.string()
    .max(50, 'SKU too long')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU contains invalid characters')
    .optional(),
  image_url: z.string()
    .url('Invalid image URL')
    .max(2048, 'Image URL too long')
    .optional()
    .or(z.literal('')),
  tags: z.array(z.string().max(50).transform(sanitizeString))
    .max(20, 'Too many tags')
    .optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'discontinued'])
    .optional()
    .default('in_stock'),
  commission_rate: z.number()
    .min(0, 'Commission rate cannot be negative')
    .max(100, 'Commission rate cannot exceed 100%')
    .optional()
    .default(0)
})

// Campaign validation
export const CampaignSchema = z.object({
  title: z.string()
    .min(1, 'Campaign title is required')
    .max(200, 'Campaign title too long')
    .transform(sanitizeString),
  description: z.string()
    .max(5000, 'Description too long')
    .transform(sanitizeHtml)
    .optional(),
  budget: z.number()
    .positive('Budget must be positive')
    .max(1000000, 'Budget too high'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  target_audience: z.string()
    .max(1000, 'Target audience description too long')
    .transform(sanitizeHtml)
    .optional(),
  requirements: z.string()
    .max(2000, 'Requirements too long')
    .transform(sanitizeHtml)
    .optional(),
  deliverables: z.array(z.string().max(200).transform(sanitizeString))
    .max(10, 'Too many deliverables')
    .optional(),
  commission_type: z.enum(['fixed', 'percentage', 'hybrid'])
    .optional()
    .default('percentage'),
  commission_value: z.number()
    .min(0, 'Commission value cannot be negative')
    .max(100000, 'Commission value too high')
})

// User profile validation
export const ProfileSchema = z.object({
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name too long')
    .transform(sanitizeString),
  email: emailSchema,
  phone: phoneSchema,
  bio: z.string()
    .max(1000, 'Bio too long')
    .transform(sanitizeHtml)
    .optional(),
  website: urlSchema.optional(),
  social_links: z.object({
    instagram: z.string().max(100).optional(),
    youtube: z.string().max(100).optional(),
    tiktok: z.string().max(100).optional(),
    twitter: z.string().max(100).optional()
  }).optional(),
  location: z.string()
    .max(100, 'Location too long')
    .transform(sanitizeString)
    .optional(),
  languages: z.array(z.string().max(50))
    .max(10, 'Too many languages')
    .optional(),
  categories: z.array(z.string().max(50))
    .max(20, 'Too many categories')
    .optional()
})

// Authentication validation
export const SignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name too long')
    .transform(sanitizeString),
  user_type: z.enum(['brand', 'influencer']),
  terms_accepted: z.boolean().refine(val => val === true, 'Terms must be accepted')
})

export const SignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const PasswordResetSchema = z.object({
  email: emailSchema
})

// Export template validation
export const ExportTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name too long')
    .transform(sanitizeString),
  description: z.string()
    .max(500, 'Description too long')
    .transform(sanitizeHtml)
    .optional(),
  fields: z.array(z.object({
    name: z.string().min(1).max(50).transform(sanitizeString),
    type: z.enum(['string', 'number', 'boolean', 'date', 'url']),
    required: z.boolean().default(false),
    default_value: z.any().optional()
  })).min(1, 'At least one field is required').max(50, 'Too many fields'),
  format: z.enum(['csv', 'xlsx', 'json']).default('csv')
})

// Query parameter validation
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1).optional().default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100).optional().default('20').transform(Number),
  sort: z.string().max(50).optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export const SearchSchema = z.object({
  q: z.string().max(200).transform(sanitizeString).optional(),
  category: z.string().max(50).transform(sanitizeString).optional(),
  status: z.string().max(20).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional()
})

// Campaign application validation
export const CampaignApplicationSchema = z.object({
  campaign_id: uuidSchema,
  message: z.string()
    .max(2000, 'Message too long')
    .transform(sanitizeHtml)
    .optional(),
  proposed_deliverables: z.array(z.string().max(200).transform(sanitizeString))
    .max(10, 'Too many proposed deliverables')
    .optional(),
  proposed_timeline: z.string()
    .max(1000, 'Timeline description too long')
    .transform(sanitizeHtml)
    .optional(),
  portfolio_links: z.array(urlSchema)
    .max(5, 'Too many portfolio links')
    .optional()
})

// File status validation
export const FileStatusSchema = z.object({
  upload_id: uuidSchema
})

// Bulk operations validation
export const BulkOperationSchema = z.object({
  operation: z.enum(['delete', 'update', 'export']),
  ids: z.array(uuidSchema).min(1, 'At least one ID is required').max(1000, 'Too many IDs'),
  data: z.record(z.any()).optional() // For update operations
})

// Status request validation
export const statusRequestSchema = z.object({
  uploadId: uuidSchema.optional(),
  exportId: uuidSchema.optional()
}).refine(data => data.uploadId || data.exportId || (!data.uploadId && !data.exportId), {
  message: 'Either uploadId, exportId, or neither should be provided'
})

// Refresh analytics validation
export const refreshAnalyticsSchema = z.object({
  action: z.literal('refresh_analytics')
})

// API key validation (for future API access)
export const ApiKeySchema = z.object({
  name: z.string()
    .min(1, 'API key name is required')
    .max(100, 'API key name too long')
    .transform(sanitizeString),
  permissions: z.array(z.enum(['read', 'write', 'delete', 'admin']))
    .min(1, 'At least one permission is required'),
  expires_at: z.string().datetime().optional()
})

// Webhook validation
export const WebhookSchema = z.object({
  url: urlSchema,
  events: z.array(z.string().max(50))
    .min(1, 'At least one event is required')
    .max(20, 'Too many events'),
  secret: z.string().min(16, 'Webhook secret must be at least 16 characters').max(128).optional()
})

// Settings validation
export const SettingsSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false)
  }).optional(),
  privacy: z.object({
    profile_visibility: z.enum(['public', 'private', 'contacts']).default('public'),
    show_email: z.boolean().default(false),
    show_phone: z.boolean().default(false)
  }).optional(),
  preferences: z.object({
    language: z.string().max(10).default('en'),
    timezone: z.string().max(50).default('UTC'),
    currency: z.string().length(3).default('USD')
  }).optional()
})

// Export all schemas
export const ValidationSchemas = {
  FileUpload: FileUploadSchema,
  FileProcessing: FileProcessingSchema,
  Product: ProductSchema,
  Campaign: CampaignSchema,
  Profile: ProfileSchema,
  SignUp: SignUpSchema,
  SignIn: SignInSchema,
  PasswordReset: PasswordResetSchema,
  ExportTemplate: ExportTemplateSchema,
  Pagination: PaginationSchema,
  Search: SearchSchema,
  CampaignApplication: CampaignApplicationSchema,
  FileStatus: FileStatusSchema,
  BulkOperation: BulkOperationSchema,
  ApiKey: ApiKeySchema,
  Webhook: WebhookSchema,
  Settings: SettingsSchema
}

// Helper function to validate request data
export function validateRequestData<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}
