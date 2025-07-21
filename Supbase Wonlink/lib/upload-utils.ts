import { supabase } from './supabase'
import { ImportExportEngine } from './import-export'

export interface UploadResult {
  success: boolean
  uploadId?: string
  filePath?: string
  error?: string
  metadata?: {
    fileSize: number
    fileName: string
    fileType: string
    totalRecords?: number
    processedRecords?: number
    successCount?: number
    errorCount?: number
  }
}

export interface UploadOptions {
  bucket?: 'imports' | 'exports' | 'avatars' | 'campaigns'
  folder?: string
  maxFileSize?: number
  allowedTypes?: string[]
  processImmediately?: boolean
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}

export class FileUploadUtils {
  private importExportEngine: ImportExportEngine

  constructor() {
    this.importExportEngine = new ImportExportEngine({
      maxConcurrency: 4,
      batchSize: 1000,
      enableProgress: true,
      enableRollback: true
    })
  }

  /**
   * Upload file to Supabase Storage with optional processing
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      bucket = 'imports',
      folder = 'uploads',
      maxFileSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['.csv', '.xlsx', '.xls', '.json', '.pdf', '.jpg', '.png'],
      processImmediately = false,
      onProgress,
      onError
    } = options

    try {
      // Validate file
      const validation = this.validateFile(file, { maxFileSize, allowedTypes })
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Generate unique file path
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}_${randomId}.${fileExtension}`
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      // Create database record
      const { data: dbRecord, error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          file_name: fileName,
          original_name: file.name,
          file_size: file.size,
          file_type: file.type,
          mime_type: file.type,
          storage_path: filePath,
          status: 'uploaded',
          progress: 0
        })
        .select()
        .single()

      if (dbError) {
        // Clean up storage if database insert fails
        await supabase.storage.from(bucket).remove([filePath])
        throw new Error(`Database record creation failed: ${dbError.message}`)
      }

      // Process file if requested and it's a supported import type
      if (processImmediately && this.isImportableFile(file)) {
        const processResult = await this.processUploadedFile(dbRecord.id, file, onProgress)
        return {
          success: true,
          uploadId: dbRecord.id,
          filePath: urlData.publicUrl,
          metadata: {
            fileSize: file.size,
            fileName: file.name,
            fileType: file.type,
            totalRecords: processResult.metadata?.totalRecords,
            processedRecords: processResult.metadata?.processedRecords,
            successCount: processResult.metadata?.successCount,
            errorCount: processResult.metadata?.errorCount
          }
        }
      }

      return {
        success: true,
        uploadId: dbRecord.id,
        filePath: urlData.publicUrl,
        metadata: {
          fileSize: file.size,
          fileName: file.name,
          fileType: file.type
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      onError?.(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Process an uploaded file for import
   */
  async processUploadedFile(
    uploadId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) {
    try {
      // Update status to processing
      await supabase
        .from('file_uploads')
        .update({ status: 'processing', progress: 0 })
        .eq('id', uploadId)

      // Process with import/export engine
      const processResult = await this.importExportEngine.processFile(file, {
        onProgress: (progress) => {
          const progressPercent = Math.round(progress.progress || 0)
          onProgress?.(progressPercent)
          
          // Update database progress
          supabase
            .from('file_uploads')
            .update({ 
              progress: progressPercent,
              processed_records: progress.processedRecords || 0,
              success_count: progress.successCount || 0,
              error_count: progress.errorCount || 0
            })
            .eq('id', uploadId)
        }
      })

      // Update final status
      const finalStatus = processResult.success ? 'completed' : 'failed'
      await supabase
        .from('file_uploads')
        .update({ 
          status: finalStatus,
          progress: 100,
          total_records: processResult.metadata?.totalRecords,
          processed_records: processResult.metadata?.processedRecords,
          success_count: processResult.metadata?.successCount,
          error_count: processResult.metadata?.errorCount,
          error_details: processResult.errors.length > 0 ? processResult.errors : null
        })
        .eq('id', uploadId)

      return processResult

    } catch (error) {
      // Update status to failed
      await supabase
        .from('file_uploads')
        .update({ 
          status: 'failed',
          error_details: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
        })
        .eq('id', uploadId)

      throw error
    }
  }

  /**
   * Get upload status and details
   */
  async getUploadStatus(uploadId: string) {
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (error) {
      throw new Error(`Failed to get upload status: ${error.message}`)
    }

    return data
  }

  /**
   * Get all uploads for current user
   */
  async getUserUploads(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to get user uploads: ${error.message}`)
    }

    return data
  }

  /**
   * Delete upload and associated files
   */
  async deleteUpload(uploadId: string) {
    // Get upload details
    const { data: upload } = await supabase
      .from('file_uploads')
      .select('storage_path')
      .eq('id', uploadId)
      .single()

    if (upload?.storage_path) {
      // Delete from storage
      await supabase.storage
        .from('imports')
        .remove([upload.storage_path])
    }

    // Delete from database
    const { error } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', uploadId)

    if (error) {
      throw new Error(`Failed to delete upload: ${error.message}`)
    }

    return { success: true }
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: File,
    options: { maxFileSize: number; allowedTypes: string[] }
  ): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > options.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(options.maxFileSize)}`
      }
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!options.allowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
      }
    }

    return { valid: true }
  }

  /**
   * Check if file is importable (CSV, Excel, JSON)
   */
  private isImportableFile(file: File): boolean {
    const importableExtensions = ['.csv', '.xlsx', '.xls', '.json']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    return importableExtensions.includes(fileExtension)
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Export singleton instance
export const fileUploadUtils = new FileUploadUtils()

// Export convenience functions
export const uploadFile = (file: File, options?: UploadOptions) => 
  fileUploadUtils.uploadFile(file, options)

export const processUploadedFile = (uploadId: string, file: File, onProgress?: (progress: number) => void) =>
  fileUploadUtils.processUploadedFile(uploadId, file, onProgress)

export const getUploadStatus = (uploadId: string) =>
  fileUploadUtils.getUploadStatus(uploadId)

export const getUserUploads = (limit?: number, offset?: number) =>
  fileUploadUtils.getUserUploads(limit, offset)

export const deleteUpload = (uploadId: string) =>
  fileUploadUtils.deleteUpload(uploadId) 