'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedFileUploadZone } from '@/components/import-export/enhanced-file-upload-zone'
import { ColumnMappingInterface } from '@/components/import-export/column-mapping-interface'
import { ExportWizard } from '@/components/import-export/export-wizard'
import { ProgressDashboard } from '@/components/import-export/progress-dashboard'
import { useClientTranslation } from '@/lib/translations'
import { 
  Upload, 
  Download, 
  Settings, 
  BarChart3, 
  FileText,
  Eye,
  Play,
  Code
} from 'lucide-react'

// Mock data for demonstrations
const mockColumns = ['product_name', 'price', 'category', 'brand', 'description', 'sku']
const mockSampleData = [
  { product_name: 'Premium Headphones', price: '299.99', category: 'Electronics', brand: 'AudioTech', description: 'High-quality wireless headphones', sku: 'AUD-001' },
  { product_name: 'Organic T-Shirt', price: '29.99', category: 'Fashion', brand: 'EcoWear', description: '100% organic cotton t-shirt', sku: 'FAS-002' },
  { product_name: 'Smart Watch', price: '199.99', category: 'Electronics', brand: 'TechCorp', description: 'Fitness tracking smartwatch', sku: 'TEC-003' }
]

const mockJobs = [
  {
    id: '1',
    type: 'import' as const,
    status: 'processing' as const,
    fileName: 'products.csv',
    fileSize: 1024000,
    progress: 65,
    totalRecords: 1000,
    processedRecords: 650,
    successCount: 645,
    errorCount: 5,
    startedAt: new Date(Date.now() - 300000),
    errorDetails: ['Invalid price format in row 23', 'Missing category in row 45']
  },
  {
    id: '2',
    type: 'export' as const,
    status: 'completed' as const,
    fileName: 'campaign_report.xlsx',
    fileSize: 512000,
    progress: 100,
    totalRecords: 500,
    processedRecords: 500,
    successCount: 500,
    errorCount: 0,
    startedAt: new Date(Date.now() - 600000),
    completedAt: new Date(Date.now() - 300000),
    downloadUrl: 'https://example.com/download/campaign_report.xlsx'
  },
  {
    id: '3',
    type: 'import' as const,
    status: 'failed' as const,
    fileName: 'inventory.json',
    fileSize: 2048000,
    progress: 0,
    totalRecords: 2000,
    processedRecords: 0,
    successCount: 0,
    errorCount: 0,
    startedAt: new Date(Date.now() - 900000),
    errorDetails: ['Invalid JSON format', 'Missing required fields']
  }
]

export default function ImportExportDemoPage() {
  const { t } = useClientTranslation()
  const [activeTab, setActiveTab] = useState('upload')
  const [mappingComplete, setMappingComplete] = useState(false)
  const [exportType, setExportType] = useState<'products' | 'campaigns' | 'analytics'>('products')

  const handleFileSelect = (files: File[]) => {
    console.log('Files selected:', files)
  }

  const handleUploadComplete = (uploadId: string, file: File) => {
    console.log('Upload completed:', uploadId, file.name)
  }

  const handleUploadError = (error: string, file: File) => {
    console.error('Upload error:', error, file.name)
  }

  const handleMappingComplete = (mapping: Record<string, string>) => {
    console.log('Column mapping completed:', mapping)
    setMappingComplete(true)
  }

  const handleExportComplete = (downloadUrl: string) => {
    console.log('Export completed:', downloadUrl)
    window.open(downloadUrl, '_blank')
  }

  const handleJobAction = (jobId: string, action: string) => {
    console.log('Job action:', jobId, action)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Import/Export UI Components Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore the modern import/export interface components built for the Wonlink platform. 
          Each component features drag & drop, real-time progress, and full i18n support.
        </p>
      </div>

      {/* Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>File Upload</span>
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Column Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Wizard</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Progress Dashboard</span>
          </TabsTrigger>
        </TabsList>

        {/* File Upload Demo */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Enhanced File Upload Zone</span>
              </CardTitle>
              <CardDescription>
                Drag & drop multiple files with queue management, progress tracking, and error handling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedFileUploadZone
                onFileSelect={handleFileSelect}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                maxFiles={5}
                showQueue={true}
                autoUpload={true}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Drag & drop multiple files</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Queue management with pause/resume</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Real-time progress tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>File validation and error handling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Mobile-responsive design</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`<EnhancedFileUploadZone
  onFileSelect={handleFileSelect}
  onUploadComplete={handleUploadComplete}
  onUploadError={handleUploadError}
  maxFiles={5}
  showQueue={true}
  autoUpload={true}
/>`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Column Mapping Demo */}
        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Column Mapping Interface</span>
              </CardTitle>
              <CardDescription>
                Intelligent column mapping with auto-detection, drag & drop reordering, and data preview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColumnMappingInterface
                columns={mockColumns}
                sampleData={mockSampleData}
                onMappingComplete={handleMappingComplete}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Auto-detection with confidence scores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Drag & drop column reordering</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Data preview with mapped results</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Save/load mapping templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Validation and error handling</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pattern Matching</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-2">Auto-detection patterns:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Product Name: /name|title|product/i</li>
                    <li>• Price: /price|cost|amount/i</li>
                    <li>• Category: /category|type|genre/i</li>
                    <li>• Brand: /brand|company|manufacturer/i</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Wizard Demo */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Wizard</span>
              </CardTitle>
              <CardDescription>
                Multi-step wizard for configuring data exports with date ranges, column selection, and format options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Export Type:</span>
                  <div className="flex space-x-2">
                    {(['products', 'campaigns', 'analytics'] as const).map(type => (
                      <Button
                        key={type}
                        variant={exportType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportType(type)}
                      >
                        {t(`exportWizard${type.charAt(0).toUpperCase() + type.slice(1)}Title`)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <ExportWizard
                  exportType={exportType}
                  onExportComplete={handleExportComplete}
                  onExportError={(error) => console.error('Export error:', error)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Multi-step wizard interface</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Date range selection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Column selection with preview</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Multiple export formats (CSV/Excel/PDF)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Custom filename input</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Product Catalog</span>
                  </div>
                  <p className="text-xs text-gray-600">Export all products with pricing, categories, and metadata</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Campaign Data</span>
                  </div>
                  <p className="text-xs text-gray-600">Export campaign performance metrics and ROI data</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Analytics Report</span>
                  </div>
                  <p className="text-xs text-gray-600">Export detailed analytics and performance insights</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Dashboard Demo */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Progress Dashboard</span>
              </CardTitle>
              <CardDescription>
                Real-time progress tracking with detailed job status, error summaries, and quick actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressDashboard
                jobs={mockJobs}
                onJobAction={handleJobAction}
                onRefresh={() => console.log('Refreshing...')}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Real-time progress updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Detailed job status tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Error summary with download</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Search and filter capabilities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                  <span>Quick action buttons</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total</span>
                  <Badge variant="outline">3</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Ready to Integrate
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              All components are built with TypeScript, follow Wonlink's design system, 
              and include full i18n support. They're ready to be integrated into your 
              import/export workflows.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Code className="w-3 h-3 mr-1" />
                TypeScript
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Play className="w-3 h-3 mr-1" />
                React
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Eye className="w-3 h-3 mr-1" />
                i18n Ready
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 