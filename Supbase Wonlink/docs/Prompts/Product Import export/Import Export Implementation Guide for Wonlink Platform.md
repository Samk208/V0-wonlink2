# Import/Export Implementation Guide for Wonlink Platform

**Project**: Wonlink - Influencer Marketing Platform  
**Feature**: Product Import/Export System  
**Date**: January 2025  
**Status**: MVP Ready - AI Coder Optimized  
**i18n Compliance**: ✅ Fully Internationalized

---

## 🎯 Overview

This implementation guide provides AI coders (Windsurf, Claude Code, Cursor) with comprehensive instructions for implementing the Import/Export functionality in the Wonlink platform, following established i18n patterns and architectural standards.

## 🏗️ Architecture Alignment

### Integration with Existing Wonlink Stack
```typescript
// Leverages existing infrastructure:
├── Supabase (Database + Storage + Auth)
├── Next.js 15.2.4 (App Router + SSR)
├── React Context (Language Management)
├── Custom i18n System (Translation Hook)
├── Radix UI + Tailwind (Component System)
└── TypeScript (Type Safety)
```

### File Structure
```
src/
├── components/import-export/
│   ├── file-upload-zone.tsx         # Drag & drop component
│   ├── data-mapper.tsx             # Column mapping interface
│   ├── progress-tracker.tsx        # Real-time progress
│   ├── export-wizard.tsx           # Export configuration
│   └── template-generator.tsx      # Download templates
├── lib/file-processing/
│   ├── csv-parser.ts               # Papa Parse integration
│   ├── excel-handler.ts            # SheetJS for XLSX
│   ├── data-validator.ts           # Zod schemas
│   ├── batch-processor.ts          # Chunked processing
│   └── export-generator.ts         # File generation
└── api/import-export/
    ├── upload.ts                   # File upload endpoint
    ├── process.ts                  # Background processing
    ├── export.ts                   # Data export
    └── templates.ts                # Template downloads
```

---

## 🌍 Internationalization Implementation

### Translation Hook Usage (Following Wonlink Pattern)
```typescript
// components/import-export/file-upload-zone.tsx
import { useTranslation } from '@/lib/translations'

export const FileUploadZone = () => {
  const { t } = useTranslation()
  
  return (
    <div className="upload-zone">
      <h2>{t('import.title')}</h2>
      <p>{t('import.dropZone.idle')}</p>
      <button>{t('import.chooseFile')}</button>
    </div>
  )
}
```

### Required Translation Keys
```typescript
// Add to lib/translations.ts (see translation artifact above)
export const translations = {
  en: {
    // Import/Export translations
    "importExport.title": "Product Import/Export",
    "import.title": "Import Products",
    "export.title": "Export Data",
    // ... (see complete list in translation artifact)
  },
  ko: {
    "importExport.title": "제품 가져오기/내보내기",
    // ... (Korean translations)
  },
  zh: {
    "importExport.title": "产品导入/导出", 
    // ... (Chinese translations)
  }
}
```

### Dynamic Content Translation
```typescript
// Handle dynamic error messages with interpolation
const handleValidationError = (error: string, row: number) => {
  const message = t('file.validation.invalidData', { 
    row: row.toString(), 
    error 
  })
  showError(message)
}
```

---

## 🤖 AI Coder Implementation Prompts

### Phase 1: Core Upload System (Claude Code/Windsurf)

#### Prompt 1: File Upload Infrastructure
```
Create a file upload system for Wonlink influencer platform with these requirements:

CONTEXT: Wonlink uses Next.js 15, Supabase, custom i18n system with useTranslation() hook
TASK: Implement drag & drop file upload with progress tracking
FILES: CSV/XLSX/JSON support for product catalogs
VALIDATION: Zod schemas for data validation
STORAGE: Supabase storage bucket 'imports'
i18n: Use t('import.dropZone.*') translation keys
PROGRESS: Real-time progress using Supabase real-time subscriptions

Key files to create:
- components/import-export/file-upload-zone.tsx
- lib/file-processing/upload-handler.ts
- api/import-export/upload.ts

Follow Wonlink's existing patterns for error handling and UI components.
```

#### Prompt 2: Data Processing Engine
```
Build data processing engine for Wonlink import system:

CONTEXT: Product imports for influencer marketing platform
FORMATS: CSV (Papa Parse), Excel (SheetJS), JSON (native)
VALIDATION: Product schema - name, price, category, description, brand, SKU
BATCH: Process in chunks of 100 records to prevent memory issues
ERRORS: Collect validation errors with row numbers for user feedback
PROGRESS: Update processing progress in real-time via Supabase
DATABASE: Insert validated records to 'products' table

Use translation keys: t('file.processing.*') and t('file.validation.*')
Implement proper TypeScript types and error boundaries.
```

### Phase 2: Export System (Cursor)

#### Prompt 3: Export Wizard Interface
```
Create export wizard component for Wonlink using Radix UI:

FEATURES:
- Product catalog export (CSV/Excel)
- Campaign performance export (Excel with charts)
- Analytics reports (PDF generation)
- Date range selection
- Column selection interface
- Format selection (CSV/XLSX/PDF)

STYLING: Tailwind CSS matching Wonlink design system
i18n: Use t('export.*') translation keys
STATE: React useState for wizard steps
DOWNLOAD: Generate and trigger file downloads

Follow existing Wonlink component patterns and accessibility standards.
```

### Phase 3: Advanced Features (All AI Coders)

#### Prompt 4: Data Mapping Interface
```
Implement intelligent column mapping for Wonlink imports:

FEATURES:
- Auto-detect column mappings using pattern matching
- Manual column mapping interface with dropdowns  
- Preview of mapped data before processing
- Save mapping templates for reuse
- Transform data (currency, dates, categories)

PATTERNS: 
- Product Name: /name|title|product/i
- Price: /price|cost|amount/i  
- Category: /category|type|genre/i

UI: Drag & drop interface with visual feedback
VALIDATION: Real-time validation of mappings
STORAGE: Save mapping templates to user preferences
```

---

## 📊 Database Schema Requirements

### File Upload Tracking
```sql
-- Add to Supabase schema
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  total_records INTEGER,
  processed_records INTEGER,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE import_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES file_uploads(id) ON DELETE CASCADE,
  row_number INTEGER,
  column_name TEXT,
  error_type TEXT,
  error_message TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads" ON file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON file_uploads  
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Product Schema Updates
```sql
-- Enhance products table for import/export
ALTER TABLE products ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES file_uploads(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_imported_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX idx_products_import_batch ON products(import_batch_id);
CREATE INDEX idx_products_external_id ON products(external_id);
```

---

## 🔧 Technical Implementation Details

### File Processing Flow
```typescript
// lib/file-processing/processor.ts
export class FileProcessor {
  async processFile(fileId: string, userId: string) {
    try {
      // 1. Download file from Supabase storage
      const fileData = await this.downloadFile(fileId)
      
      // 2. Parse based on file type
      const records = await this.parseFile(fileData)
      
      // 3. Validate data using Zod schemas
      const { valid, errors } = await this.validateRecords(records)
      
      // 4. Process in batches with progress updates
      await this.processBatches(valid, fileId)
      
      // 5. Store errors for user review
      await this.storeErrors(errors, fileId)
      
    } catch (error) {
      await this.handleProcessingError(error, fileId)
    }
  }
}
```

### Real-time Progress Updates
```typescript
// lib/real-time/progress-tracker.ts
export const useImportProgress = (uploadId: string) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  
  useEffect(() => {
    const subscription = supabase
      .channel(`import-${uploadId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'file_uploads',
        filter: `id=eq.${uploadId}`
      }, (payload) => {
        setProgress(payload.new.progress)
        setStatus(payload.new.status)
      })
      .subscribe()
      
    return () => subscription.unsubscribe()
  }, [uploadId])
  
  return { progress, status }
}
```

### Export Generation
```typescript
// lib/export/generators.ts
export const generateCSVExport = async (data: Product[], columns: string[]) => {
  const csv = Papa.unparse(data.map(item => 
    columns.reduce((row, col) => ({ ...row, [col]: item[col] }), {})
  ))
  
  const blob = new Blob([csv], { type: 'text/csv' })
  return blob
}

export const generateExcelExport = async (data: Product[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
  
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  })
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
}
```

---

## 🎨 UI Component Implementation

### Following Wonlink Design Patterns
```typescript
// components/import-export/upload-zone.tsx
export const UploadZone = () => {
  const { t } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  
  return (
    <div className={cn(
      "border-2 border-dashed rounded-lg p-12 transition-colors",
      dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
    )}>
      <div className="flex flex-col items-center space-y-4">
        <Upload className="w-8 h-8 text-gray-400" />
        <p className="text-lg font-medium text-gray-700">
          {t('import.dropZone.idle')}
        </p>
        <p className="text-sm text-gray-500">
          {t('import.dropZone.formats')}
        </p>
      </div>
    </div>
  )
}
```

### Progress Indicator Component
```typescript
// components/import-export/progress-indicator.tsx
export const ProgressIndicator = ({ uploadId }: { uploadId: string }) => {
  const { t } = useTranslation()
  const { progress, status } = useImportProgress(uploadId)
  
  const statusMessage = useMemo(() => {
    switch (status) {
      case 'processing':
        return t('file.processing.progress', { 
          current: Math.floor(progress * 0.01 * 100), 
          total: 100 
        })
      case 'completed':
        return t('file.processing.completed')
      case 'failed':
        return t('file.processing.failed')
      default:
        return t('file.processing.started')
    }
  }, [status, progress, t])
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{statusMessage}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// __tests__/file-processing.test.ts
describe('File Processing', () => {
  test('should validate product CSV correctly', async () => {
    const csvData = `name,price,category\nTest Product,29.99,Fashion`
    const result = await validateCSVData(csvData)
    
    expect(result.valid).toHaveLength(1)
    expect(result.errors).toHaveLength(0)
  })
  
  test('should handle translation keys correctly', () => {
    const { t } = useTranslation()
    expect(t('import.title')).toBeDefined()
    expect(t('export.title')).toBeDefined()
  })
})
```

### E2E Tests (Playwright/Cypress)
```typescript
// e2e/import-export.spec.ts
test('should complete full import flow', async ({ page }) => {
  await page.goto('/import-export')
  
  // Test file upload
  await page.setInputFiles('input[type="file"]', 'test-products.csv')
  
  // Wait for processing
  await page.waitForSelector('[data-testid="progress-complete"]')
  
  // Verify success message
  await expect(page.locator('[data-testid="success-message"]'))
    .toContainText('Import completed successfully')
})
```

---

## 🚀 Deployment Checklist

### Pre-deployment Requirements
- [ ] All translation keys added to `lib/translations.ts`
- [ ] Database schema migrations applied
- [ ] Supabase storage bucket 'imports' created
- [ ] RLS policies configured
- [ ] File size limits configured (10MB max)
- [ ] Error logging implemented
- [ ] Performance testing completed

### Production Configuration
```typescript
// lib/config/import-export.ts
export const IMPORT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['.csv', '.xlsx', '.json'],
  batchSize: 100,
  maxRecords: 10000,
  retryAttempts: 3,
  timeoutMs: 300000 // 5 minutes
}
```

---

## 📋 AI Coder Handover Summary

### What AI Coders Should Know
1. **Follow Wonlink's i18n Pattern**: Always use `useTranslation()` hook
2. **Use Existing Components**: Leverage Radix UI + Tailwind design system
3. **Supabase Integration**: Use existing authentication and database patterns
4. **Type Safety**: Implement proper TypeScript types throughout
5. **Error Handling**: Provide user-friendly error messages with translations
6. **Real-time Updates**: Use Supabase real-time for progress tracking

### Priority Implementation Order
1. **Week 1**: File upload + basic CSV processing
2. **Week 2**: Excel support + data validation  
3. **Week 3**: Export functionality + PDF generation
4. **Week 4**: Advanced features (column mapping, templates)

### Key Success Metrics
- ✅ 100% i18n compliance (all text translated)
- ✅ Support for 10,000+ product imports
- ✅ Sub-5 second response time for exports
- ✅ Zero data loss during processing
- ✅ Mobile-responsive interface
- ✅ Accessibility compliant (WCAG 2.1)

This implementation guide ensures AI coders can build a robust, scalable, and fully internationalized import/export system that seamlessly integrates with the existing Wonlink platform architecture.