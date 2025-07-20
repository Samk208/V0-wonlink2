# AI Coder Prompts for Wonlink Platform Issues

**Platform**: Wonlink Influencer Marketing Platform  
**Tech Stack**: Next.js 15.2.4, React 19, Supabase, TypeScript, Tailwind CSS  
**Priority**: Critical SSR Hydration Fix → Import/Export Features → Security & Polish

---

## 🚨 **CRITICAL PRIORITY: SSR Hydration Mismatch Fix**

### **Claude Code / Windsurf Prompt**

```
CONTEXT: Wonlink influencer marketing platform using Next.js 15.2.4, React 19, TypeScript, Supabase
CRITICAL ISSUE: SSR hydration mismatch causing "Text content did not match" warnings in React 19

PROBLEM DETAILS:
- Server renders with default language "en" 
- Client immediately switches to localStorage language (ko/zh)
- Causes DOM mismatch between server and client renders
- Custom i18n system in lib/translations.ts with useTranslation() hook
- Language state managed in app/providers.tsx with React Context
- Affects onboarding flows and language switching

REQUIREMENTS:
1. Fix hydration mismatch using cookie-based language detection
2. Maintain existing useTranslation() hook API
3. Keep current translation keys and structure intact
4. Ensure SSR-safe language persistence
5. Support 3 languages: English (en), Korean (ko), Chinese (zh)

IMPLEMENTATION STRATEGY:
- Replace localStorage with cookies for server-side access
- Use Next.js cookies() API for server-side language detection  
- Implement useEffect pattern for client-side language sync
- Add hydration boundary components where needed
- Maintain backward compatibility with existing components

FILES TO MODIFY:
- app/providers.tsx (language context provider)
- lib/translations.ts (translation hook)
- middleware.ts (create new - language detection)
- components/language-selector.tsx (update cookie handling)

TECHNICAL REQUIREMENTS:
- Use Next.js 15 App Router patterns
- Implement proper TypeScript types
- Follow existing code style and conventions
- Add error handling and fallback mechanisms
- Ensure mobile compatibility (Capacitor app ready)

SUCCESS CRITERIA:
- Zero hydration mismatch warnings in console
- Language switching works without page refresh
- Server-rendered HTML matches client-rendered HTML
- All existing translation functionality preserved
- Performance impact minimal (<50ms)

REFERENCE IMPLEMENTATIONS:
- Use cookie pattern from carlogino.com tutorial
- Follow useEffect hydration patterns from LogRocket blog
- Implement NextResponse cookie setting for middleware

ADDITIONAL CONTEXT:
- Platform has 100+ translation keys across EN/KO/ZH
- Used by Korean market primarily
- Mobile-first responsive design
- Integration with Supabase authentication required
```

### **Cursor Prompt (for UI components)**

```
Fix hydration mismatch in Wonlink language selector and provider components.

CURRENT ISSUE: Server renders "en" default but client switches to localStorage language causing hydration errors.

TASK: Update these React components to use cookie-based language detection:
- components/language-selector.tsx 
- Any components using useTranslation() hook that cause hydration issues

REQUIREMENTS:
- Replace localStorage access with cookie reading/writing
- Add useEffect hook to prevent hydration mismatch
- Maintain existing UI/UX (dropdown with flags: 🇺🇸 English, 🇰🇷 한국어, 🇨🇳 中文)
- Keep Radix UI components and Tailwind styling
- Ensure mobile-responsive design

PATTERN TO FOLLOW:
```javascript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <LoadingState />;
```

TEST: Language switching should work without page refresh and no console warnings.
```

---

## 📊 **FEATURE: Import/Export System Implementation**

### **Claude Code Prompt (Backend & Processing)**

```
CONTEXT: Wonlink influencer marketing platform needs bulk product import/export functionality
TECH STACK: Next.js 15, Supabase, TypeScript, react-papaparse, SheetJS

PROJECT SCOPE: Build complete import/export system for product catalogs and campaign data

FEATURE REQUIREMENTS:

IMPORT FUNCTIONALITY:
- Support CSV, Excel (.xlsx), JSON file formats
- Drag & drop file upload interface
- Real-time progress tracking with Supabase subscriptions
- Data validation using Zod schemas
- Column mapping with auto-detection
- Batch processing for large datasets (10,000+ records)
- Error reporting with row-level details
- Template download for proper formatting

EXPORT FUNCTIONALITY:
- Product catalog export (CSV/Excel)
- Campaign performance data export
- Analytics reports (PDF generation)
- Custom date range selection
- Column selection interface
- Multiple format support

TECHNICAL IMPLEMENTATION:

1. FILE UPLOAD SYSTEM:
- Supabase Storage integration (bucket: 'imports')
- File metadata tracking in database
- Progress tracking with real-time updates
- Error handling and validation

2. DATA PROCESSING:
- Use react-papaparse for CSV parsing
- SheetJS for Excel file processing  
- Zod schemas for data validation
- Batch processing in chunks of 500 records
- PostgreSQL function for bulk inserts using jsonb_populate_recordset

3. DATABASE SCHEMA:
```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT,
  status TEXT DEFAULT 'uploaded',
  progress INTEGER DEFAULT 0,
  total_records INTEGER,
  processed_records INTEGER,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE import_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES file_uploads(id),
  row_number INTEGER,
  column_name TEXT,
  error_message TEXT,
  raw_data JSONB
);
```

4. API ENDPOINTS:
- POST /api/import-export/upload
- POST /api/import-export/process  
- GET /api/import-export/status
- POST /api/import-export/export
- GET /api/import-export/download

5. PRODUCT SCHEMA VALIDATION:
```typescript
const ProductImportSchema = z.object({
  name: z.string().min(1, "Product name required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category required"),
  description: z.string().optional(),
  brand: z.string().min(1, "Brand required"),
  sku: z.string().optional(),
  imageUrl: z.string().url().optional()
});
```

PERFORMANCE REQUIREMENTS:
- Handle files up to 10MB
- Process 10,000+ records efficiently
- Sub-5 second response for exports
- Real-time progress updates
- Minimize memory usage

SECURITY REQUIREMENTS:
- File type validation
- Size limits enforcement
- User authentication required
- RLS policies for data access
- Input sanitization

INTEGRATION REQUIREMENTS:
- Full i18n support using existing translation system
- Mobile-responsive design
- Supabase real-time subscriptions
- Error boundary components
- TypeScript strict mode compliance

SUCCESS METRICS:
- Upload and process 10,000 products in under 2 minutes
- Zero data loss during processing
- Comprehensive error reporting
- Mobile-friendly interface
- 100% i18n coverage

REFERENCE IMPLEMENTATIONS:
- Use react-papaparse examples from GitHub
- Follow Supabase bulk insert patterns
- Implement SheetJS Excel processing
- Reference react-spreadsheet-import for advanced UI
```

### **Windsurf Prompt (Advanced Processing Logic)**

```
Create advanced data processing engine for Wonlink import/export system.

FOCUS: Intelligent column mapping, data transformation, and batch processing

REQUIREMENTS:

1. INTELLIGENT COLUMN MAPPING:
- Auto-detect column mappings using pattern matching:
  * Product Name: /name|title|product|item/i
  * Price: /price|cost|amount|value/i  
  * Category: /category|type|genre|class/i
  * Description: /desc|detail|info|summary/i
- Manual override interface with dropdowns
- Save mapping templates for reuse
- Preview mapped data before processing

2. DATA TRANSFORMATION:
- Currency conversion and formatting
- Date parsing and standardization  
- Category standardization and mapping
- Text cleaning and normalization
- Duplicate detection and handling

3. VALIDATION ENGINE:
- Multi-level validation (file → structure → data → business rules)
- Custom validation rules per field type
- Async validation for external dependencies
- Bulk validation with detailed error reporting

4. BATCH PROCESSING:
- Chunked processing to prevent timeouts
- Parallel processing where possible
- Progress tracking with ETA calculation
- Rollback capability for failed batches
- Memory-efficient streaming for large files

5. ERROR HANDLING:
- Granular error categorization
- Row-level error details with suggestions
- Error recovery and retry mechanisms
- Export error reports for user review

TECHNICAL IMPLEMENTATION:
- Use Web Workers for heavy processing
- Implement streaming data processing
- Add circuit breaker pattern for resilience
- Use PostgreSQL transactions for data integrity
- Implement distributed locking for concurrent uploads

CODE STRUCTURE:
```
lib/import-export/
├── processors/
│   ├── csv-processor.ts
│   ├── excel-processor.ts
│   └── json-processor.ts
├── validators/
│   ├── schema-validator.ts
│   ├── business-validator.ts
│   └── duplicate-detector.ts
├── transformers/
│   ├── column-mapper.ts
│   ├── data-transformer.ts
│   └── format-converter.ts
└── batch/
    ├── batch-processor.ts
    ├── progress-tracker.ts
    └── error-handler.ts
```

PERFORMANCE TARGETS:
- Process 1000 records per second
- Memory usage under 100MB for large files
- Real-time progress updates (every 100 records)
- Sub-second validation response
```

### **Cursor Prompt (UI Components)**

```
Build modern import/export UI components for Wonlink platform.

DESIGN REQUIREMENTS:
- Follow existing Wonlink design system (Radix UI + Tailwind CSS)
- Mobile-first responsive design
- Drag & drop file upload with progress
- Real-time status updates
- Error handling with user-friendly messages
- Full i18n support using useTranslation() hook

COMPONENTS TO CREATE:

1. FILE UPLOAD INTERFACE:
- Drag & drop zone with file type indicators
- Progress bar with percentage and ETA
- File validation feedback
- Multiple file support with queue management

2. COLUMN MAPPING INTERFACE:
- Visual column mapping with drag & drop
- Auto-detected mappings with confidence scores
- Manual override dropdowns
- Preview table with mapped data
- Save/load mapping templates

3. EXPORT WIZARD:
- Multi-step wizard with progress indicator
- Date range picker
- Column selection with preview
- Format selection (CSV/Excel/PDF)
- Custom filename input

4. PROGRESS DASHBOARD:
- Real-time processing status
- Detailed progress breakdown
- Error summary with download option
- Recent imports/exports history
- Quick action buttons

UI PATTERNS:
- Use Lucide React icons for consistency
- Implement skeleton loading states  
- Add micro-animations for engagement
- Ensure accessibility (ARIA labels, keyboard navigation)
- Mobile touch-friendly interactions

STYLING GUIDELINES:
- Follow existing Tailwind utility classes
- Use consistent spacing and typography
- Implement dark/light theme support
- Maintain brand colors and gradients
- Responsive breakpoints: sm, md, lg, xl

INTEGRATION:
- Connect to backend APIs with proper error handling
- Use Supabase real-time for progress updates
- Implement optimistic UI updates
- Add loading states and error boundaries
```

---

## 🔒 **SECURITY & POLISH PHASE**

### **Claude Code Prompt (Security Implementation)**

```
CONTEXT: Secure the Wonlink import/export system for production deployment

SECURITY REQUIREMENTS:

1. FILE UPLOAD SECURITY:
- Validate file types using magic numbers, not just extensions
- Scan files for malicious content
- Implement file size limits (10MB max)
- Virus scanning integration
- Secure file storage with expiration

2. DATA VALIDATION:
- Server-side validation for all imports
- SQL injection prevention
- XSS protection for file contents
- CSV injection (formula injection) protection
- Input sanitization and escaping

3. ACCESS CONTROL:
- Row-level security (RLS) policies
- User-based file access restrictions
- API rate limiting (100 requests/hour per user)
- Authentication required for all endpoints
- Audit logging for sensitive operations

4. API SECURITY:
- Request validation middleware
- CORS configuration
- CSRF protection
- Request signing/verification
- Error message sanitization

IMPLEMENTATION:
```typescript
// Rate limiting middleware
export function createRateLimiter(limit: number, window: number) {
  const requests = new Map();
  
  return (req: NextRequest) => {
    const key = req.ip || 'anonymous';
    const now = Date.now();
    const userRequests = requests.get(key) || [];
    
    // Clean old requests
    const validRequests = userRequests.filter(
      (time: number) => now - time < window
    );
    
    if (validRequests.length >= limit) {
      throw new Error('Rate limit exceeded');
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
  };
}

// File type validation
export function validateFileType(file: File): boolean {
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  return allowedTypes.includes(file.type);
}

// SQL injection prevention
export function sanitizeInput(input: string): string {
  return input.replace(/['"\\;]/g, '');
}
```

SUPABASE RLS POLICIES:
```sql
-- File upload policies
CREATE POLICY "Users can only access own uploads" ON file_uploads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

MONITORING & LOGGING:
- Error tracking with detailed context
- Performance monitoring for API endpoints
- File upload/processing metrics
- Security event logging
- User activity tracking

SUCCESS CRITERIA:
- Pass security audit
- Zero vulnerabilities in dependencies
- Production-ready error handling
- Comprehensive logging coverage
- Performance under load testing
```

### **Final Integration Prompt**

```
CONTEXT: Final integration and testing of Wonlink import/export system

INTEGRATION TASKS:

1. END-TO-END TESTING:
- Test complete import flow: upload → validate → process → store
- Test export functionality across all formats
- Verify i18n works in all languages
- Test mobile responsiveness and Capacitor compatibility
- Load testing with large datasets

2. PERFORMANCE OPTIMIZATION:
- Bundle size optimization
- Image and asset optimization
- Database query optimization
- Caching strategy implementation
- CDN configuration for file downloads

3. ERROR HANDLING:
- Comprehensive error boundaries
- User-friendly error messages
- Graceful degradation for failures
- Offline capability planning
- Recovery mechanisms

4. DOCUMENTATION:
- API documentation with examples
- User guide for import/export features
- Developer handover documentation
- Deployment instructions
- Troubleshooting guide

TESTING SCENARIOS:
- Upload 10,000+ product CSV file
- Import Excel file with multiple sheets
- Export large dataset to PDF
- Test concurrent user uploads
- Mobile app import/export functionality
- Edge cases and error conditions

DEPLOYMENT CHECKLIST:
- Environment variables configured
- Database migrations applied
- Supabase policies active
- CDN and caching configured
- Monitoring and alerts setup
- Backup and recovery tested

SUCCESS METRICS:
- 99.9% uptime during testing
- Sub-5 second response times
- Zero data loss scenarios
- 100% feature coverage
- Mobile app store ready
- Production security compliance
```

---

## 🎯 **PROMPT USAGE GUIDE**

### **For Claude Code / Windsurf:**
1. Use the **critical SSR fix prompt** first - this is blocking all other development
2. Then use the **backend import/export prompt** for core functionality
3. Follow with the **advanced processing prompt** for robust data handling
4. Finish with the **security prompt** before production

### **For Cursor:**
1. Use the **hydration UI fix prompt** alongside Claude Code work
2. Use the **UI components prompt** to build the interface
3. Focus on visual polish and mobile responsiveness

### **Execution Order:**
1. **Week 1**: SSR hydration fix (critical blocker)
2. **Week 2**: Basic import/export functionality  
3. **Week 3**: Advanced features and UI polish
4. **Week 4**: Security, testing, and production readiness

Each prompt includes specific technical requirements, success criteria, and references to the proven examples documentation you've saved. The prompts are designed to work together as a cohesive system while allowing AI coders to focus on their strengths.