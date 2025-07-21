# Import/Export UI Components for Wonlink Platform

Modern, responsive UI components for handling file imports and exports in the Wonlink influencer marketing platform. Built with TypeScript, React, and full i18n support.

## 🚀 Features

- **Drag & Drop File Upload** with queue management
- **Intelligent Column Mapping** with auto-detection
- **Multi-step Export Wizard** with format selection
- **Real-time Progress Dashboard** with job tracking
- **Mobile-first Responsive Design**
- **Full i18n Support** (English, Korean, Chinese)
- **TypeScript** with complete type safety
- **Accessibility** compliant (WCAG 2.1)

## 📦 Components

### 1. Enhanced File Upload Zone

Advanced file upload component with multiple file support, queue management, and real-time progress tracking.

```tsx
import { EnhancedFileUploadZone } from '@/components/import-export'

<EnhancedFileUploadZone
  onFileSelect={(files) => console.log('Files selected:', files)}
  onUploadComplete={(uploadId, file) => console.log('Upload completed:', uploadId)}
  onUploadError={(error, file) => console.error('Upload error:', error)}
  maxFiles={5}
  showQueue={true}
  autoUpload={true}
/>
```

**Features:**
- Drag & drop multiple files
- Queue management with pause/resume
- Real-time progress tracking
- File validation and error handling
- Mobile-responsive design
- Support for CSV, Excel, JSON formats

### 2. Column Mapping Interface

Intelligent column mapping with auto-detection, drag & drop reordering, and data preview.

```tsx
import { ColumnMappingInterface } from '@/components/import-export'

<ColumnMappingInterface
  columns={['product_name', 'price', 'category']}
  sampleData={sampleData}
  onMappingComplete={(mapping) => console.log('Mapping:', mapping)}
  onSaveTemplate={(template) => console.log('Template saved:', template)}
  onLoadTemplate={(templateId) => console.log('Template loaded:', templateId)}
/>
```

**Features:**
- Auto-detection with confidence scores
- Drag & drop column reordering
- Data preview with mapped results
- Save/load mapping templates
- Validation and error handling
- Pattern matching for common field names

### 3. Export Wizard

Multi-step wizard for configuring data exports with date ranges, column selection, and format options.

```tsx
import { ExportWizard } from '@/components/import-export'

<ExportWizard
  exportType="products"
  onExportComplete={(downloadUrl) => window.open(downloadUrl, '_blank')}
  onExportError={(error) => console.error('Export error:', error)}
/>
```

**Features:**
- Multi-step wizard interface
- Date range selection
- Column selection with preview
- Multiple export formats (CSV/Excel/PDF)
- Custom filename input
- Progress tracking

### 4. Progress Dashboard

Real-time progress tracking with detailed job status, error summaries, and quick actions.

```tsx
import { ProgressDashboard } from '@/components/import-export'

<ProgressDashboard
  jobs={processingJobs}
  onJobAction={(jobId, action) => console.log('Job action:', jobId, action)}
  onRefresh={() => console.log('Refreshing...')}
/>
```

**Features:**
- Real-time progress updates
- Detailed job status tracking
- Error summary with download
- Search and filter capabilities
- Quick action buttons
- Auto-refresh functionality

## 🎨 Design System Integration

All components follow the Wonlink design system:

- **Radix UI** components for accessibility
- **Tailwind CSS** for styling
- **Lucide React** icons for consistency
- **Custom color scheme** matching brand guidelines
- **Responsive breakpoints** (sm, md, lg, xl)

## 🌍 Internationalization

Full i18n support with translation keys for all user-facing text:

```tsx
import { useClientTranslation } from '@/lib/translations'

const { t } = useClientTranslation()

// Translation keys are automatically used
t('fileUploadDragDrop') // "Drag and drop files here, or click to browse"
t('columnMappingTitle') // "Column Mapping"
t('exportWizardTitle') // "Export Wizard"
t('progressDashboardTitle') // "Import/Export Progress"
```

## 📱 Mobile Responsiveness

All components are mobile-first and include:

- Touch-friendly interactions
- Responsive layouts
- Mobile-optimized file upload
- Swipe gestures for mobile
- Adaptive typography

## 🔧 Configuration

### File Upload Settings

```tsx
const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  acceptedFileTypes: ['.csv', '.xlsx', '.xls', '.json'],
  autoUpload: true,
  showQueue: true
}
```

### Column Mapping Patterns

```tsx
const FIELD_PATTERNS = {
  name: /name|title|product|item/i,
  price: /price|cost|amount|value/i,
  category: /category|type|genre|group/i,
  description: /description|desc|details|summary/i,
  brand: /brand|company|manufacturer/i,
  sku: /sku|code|id|reference/i,
  imageUrl: /image|photo|picture|url/i,
  tags: /tags|keywords|labels/i
}
```

### Export Types

```tsx
const EXPORT_TYPES = {
  products: {
    title: 'exportWizardProductsTitle',
    defaultColumns: ['name', 'price', 'category', 'brand', 'description', 'sku'],
    availableColumns: ['name', 'price', 'category', 'brand', 'description', 'sku', 'imageUrl', 'tags', 'availability', 'commission']
  },
  campaigns: {
    title: 'exportWizardCampaignsTitle',
    defaultColumns: ['title', 'budget', 'status', 'startDate', 'endDate', 'applications'],
    availableColumns: ['title', 'budget', 'status', 'startDate', 'endDate', 'applications', 'deliverables', 'platforms', 'audienceSize', 'roi']
  },
  analytics: {
    title: 'exportWizardAnalyticsTitle',
    defaultColumns: ['date', 'impressions', 'clicks', 'conversions', 'revenue'],
    availableColumns: ['date', 'impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'cpc', 'roas', 'campaign', 'platform']
  }
}
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { EnhancedFileUploadZone } from '@/components/import-export'

test('should handle file upload', () => {
  render(<EnhancedFileUploadZone onFileSelect={jest.fn()} />)
  
  const uploadZone = screen.getByText(/drag and drop/i)
  expect(uploadZone).toBeInTheDocument()
})
```

### Integration Tests

```tsx
test('should complete full import flow', async () => {
  // Test file upload
  // Test column mapping
  // Test data processing
  // Test completion
})
```

## 📊 Performance

- **Lazy loading** for large file previews
- **Virtual scrolling** for large datasets
- **Debounced search** for performance
- **Optimistic updates** for better UX
- **Memory management** for file processing

## 🔒 Security

- **File type validation** on client and server
- **File size limits** to prevent abuse
- **CSRF protection** for uploads
- **Input sanitization** for user data
- **Secure download URLs** with expiration

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install react-dropzone react-beautiful-dnd
   ```

2. **Import components:**
   ```tsx
   import { 
     EnhancedFileUploadZone,
     ColumnMappingInterface,
     ExportWizard,
     ProgressDashboard 
   } from '@/components/import-export'
   ```

3. **Add translation keys** to `lib/translations.ts`

4. **Configure API endpoints** for file upload/processing

5. **Test with sample data** using the demo page

## 📝 API Integration

### File Upload Endpoint

```tsx
// POST /api/import-export/upload
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/import-export/upload', {
    method: 'POST',
    body: formData
  })
  
  return response.json()
}
```

### Processing Endpoint

```tsx
// POST /api/import-export/process
const processFile = async (uploadId: string) => {
  const response = await fetch('/api/import-export/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId })
  })
  
  return response.json()
}
```

### Export Endpoint

```tsx
// POST /api/import-export/export
const exportData = async (config: ExportConfig) => {
  const response = await fetch('/api/import-export/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
  
  return response.json()
}
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new features
3. Include translation keys for all user-facing text
4. Write tests for new components
5. Update documentation for new features

## 📄 License

This project is part of the Wonlink platform and follows the same licensing terms.

---

**Built with ❤️ for the Wonlink platform** 