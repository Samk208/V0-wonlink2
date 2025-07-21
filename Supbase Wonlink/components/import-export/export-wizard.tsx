'use client'

import React, { useState, useCallback } from 'react'
import { 
  Calendar, 
  Download, 
  FileText, 
  BarChart3, 
  Settings, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  Filter,
  CalendarDays
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClientTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'

interface ExportWizardProps {
  exportType: 'products' | 'campaigns' | 'analytics'
  onExportComplete?: (downloadUrl: string) => void
  onExportError?: (error: string) => void
  className?: string
}

interface ExportStep {
  id: string
  title: string
  description: string
  completed: boolean
}

interface ExportConfig {
  dateRange: {
    start: string
    end: string
  }
  columns: string[]
  format: 'csv' | 'xlsx' | 'pdf'
  filename: string
  filters: Record<string, any>
}

const EXPORT_TYPES = {
  products: {
    title: 'exportWizardProductsTitle',
    description: 'exportWizardProductsDescription',
    icon: FileText,
    defaultColumns: ['name', 'price', 'category', 'brand', 'description', 'sku'],
    availableColumns: ['name', 'price', 'category', 'brand', 'description', 'sku', 'imageUrl', 'tags', 'availability', 'commission']
  },
  campaigns: {
    title: 'exportWizardCampaignsTitle',
    description: 'exportWizardCampaignsDescription',
    icon: BarChart3,
    defaultColumns: ['title', 'budget', 'status', 'startDate', 'endDate', 'applications'],
    availableColumns: ['title', 'budget', 'status', 'startDate', 'endDate', 'applications', 'deliverables', 'platforms', 'audienceSize', 'roi']
  },
  analytics: {
    title: 'exportWizardAnalyticsTitle',
    description: 'exportWizardAnalyticsDescription',
    icon: BarChart3,
    defaultColumns: ['date', 'impressions', 'clicks', 'conversions', 'revenue'],
    availableColumns: ['date', 'impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'cpc', 'roas', 'campaign', 'platform']
  }
}

export function ExportWizard({
  exportType,
  onExportComplete,
  onExportError,
  className
}: ExportWizardProps) {
  const { t } = useClientTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [config, setConfig] = useState<ExportConfig>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    columns: EXPORT_TYPES[exportType].defaultColumns,
    format: 'xlsx',
    filename: `${exportType}_export_${new Date().toISOString().split('T')[0]}`,
    filters: {}
  })

  const steps: ExportStep[] = [
    {
      id: 'type',
      title: t('exportWizardStepType'),
      description: t('exportWizardStepTypeDescription'),
      completed: true
    },
    {
      id: 'dateRange',
      title: t('exportWizardStepDateRange'),
      description: t('exportWizardStepDateRangeDescription'),
      completed: config.dateRange.start && config.dateRange.end
    },
    {
      id: 'columns',
      title: t('exportWizardStepColumns'),
      description: t('exportWizardStepColumnsDescription'),
      completed: config.columns.length > 0
    },
    {
      id: 'format',
      title: t('exportWizardStepFormat'),
      description: t('exportWizardStepFormatDescription'),
      completed: !!config.format
    },
    {
      id: 'review',
      title: t('exportWizardStepReview'),
      description: t('exportWizardStepReviewDescription'),
      completed: false
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleColumnToggle = (column: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(column)
        ? prev.columns.filter(c => c !== column)
        : [...prev.columns, column]
    }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Call export API
      const response = await fetch('/api/import-export/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportType,
          format: config.format,
          dateRange: config.dateRange,
          columns: config.columns,
          filename: config.filename,
          filters: config.filters
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.downloadUrl) {
          onExportComplete?.(result.downloadUrl)
        }
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      onExportError?.(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ExportTypeStep exportType={exportType} />
      case 1:
        return <DateRangeStep config={config} setConfig={setConfig} />
      case 2:
        return <ColumnsStep config={config} setConfig={setConfig} exportType={exportType} />
      case 3:
        return <FormatStep config={config} setConfig={setConfig} />
      case 4:
        return <ReviewStep config={config} exportType={exportType} />
      default:
        return null
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {t(EXPORT_TYPES[exportType].title)}
          </h2>
          <Badge variant="outline" className="text-sm">
            {t('exportWizardStep')} {currentStep + 1} {t('exportWizardOf')} {steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('exportWizardProgress')}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2',
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('exportWizardPrevious')}
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('exportWizardExporting')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t('exportWizardExport')}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!steps[currentStep + 1]?.completed}
            >
              {t('exportWizardNext')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Export Progress */}
      {isExporting && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('exportWizardPreparing')}</span>
                <span className="text-sm text-gray-600">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExportTypeStep({ exportType }: { exportType: string }) {
  const { t } = useClientTranslation()
  const Icon = EXPORT_TYPES[exportType].icon

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold">{t(EXPORT_TYPES[exportType].title)}</h3>
      <p className="text-gray-600">{t(EXPORT_TYPES[exportType].description)}</p>
    </div>
  )
}

function DateRangeStep({ 
  config, 
  setConfig 
}: { 
  config: ExportConfig
  setConfig: (config: ExportConfig) => void
}) {
  const { t } = useClientTranslation()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('exportWizardDateRangeTitle')}</h3>
        <p className="text-gray-600">{t('exportWizardDateRangeSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">{t('exportWizardStartDate')}</Label>
          <Input
            id="startDate"
            type="date"
            value={config.dateRange.start}
            onChange={(e) => setConfig({
              ...config,
              dateRange: { ...config.dateRange, start: e.target.value }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t('exportWizardEndDate')}</Label>
          <Input
            id="endDate"
            type="date"
            value={config.dateRange.end}
            onChange={(e) => setConfig({
              ...config,
              dateRange: { ...config.dateRange, end: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t('exportWizardLast7Days'), days: 7 },
          { label: t('exportWizardLast30Days'), days: 30 },
          { label: t('exportWizardLast90Days'), days: 90 }
        ].map(({ label, days }) => (
          <Button
            key={days}
            variant="outline"
            size="sm"
            onClick={() => {
              const end = new Date()
              const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
              setConfig({
                ...config,
                dateRange: {
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0]
                }
              })
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function ColumnsStep({ 
  config, 
  setConfig, 
  exportType 
}: { 
  config: ExportConfig
  setConfig: (config: ExportConfig) => void
  exportType: string
}) {
  const { t } = useClientTranslation()
  const availableColumns = EXPORT_TYPES[exportType].availableColumns

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('exportWizardColumnsTitle')}</h3>
        <p className="text-gray-600">{t('exportWizardColumnsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableColumns.map(column => (
          <div key={column} className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id={column}
              checked={config.columns.includes(column)}
              onCheckedChange={() => handleColumnToggle(column)}
            />
            <Label htmlFor={column} className="flex-1 cursor-pointer">
              {t(`productField${column.charAt(0).toUpperCase() + column.slice(1)}`)}
            </Label>
            {EXPORT_TYPES[exportType].defaultColumns.includes(column) && (
              <Badge variant="secondary" className="text-xs">
                {t('exportWizardDefault')}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfig({
            ...config,
            columns: EXPORT_TYPES[exportType].defaultColumns
          })}
        >
          {t('exportWizardSelectDefault')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfig({
            ...config,
            columns: availableColumns
          })}
        >
          {t('exportWizardSelectAll')}
        </Button>
      </div>
    </div>
  )
}

function FormatStep({ 
  config, 
  setConfig 
}: { 
  config: ExportConfig
  setConfig: (config: ExportConfig) => void
}) {
  const { t } = useClientTranslation()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('exportWizardFormatTitle')}</h3>
        <p className="text-gray-600">{t('exportWizardFormatSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { value: 'csv', label: 'CSV', description: t('exportWizardFormatCSV') },
          { value: 'xlsx', label: 'Excel', description: t('exportWizardFormatExcel') },
          { value: 'pdf', label: 'PDF', description: t('exportWizardFormatPDF') }
        ].map(format => (
          <Card
            key={format.value}
            className={cn(
              'cursor-pointer transition-all',
              config.format === format.value
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md'
            )}
            onClick={() => setConfig({ ...config, format: format.value as any })}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold mb-2">{format.label}</div>
              <p className="text-sm text-gray-600">{format.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="filename">{t('exportWizardFilename')}</Label>
        <Input
          id="filename"
          value={config.filename}
          onChange={(e) => setConfig({ ...config, filename: e.target.value })}
          placeholder={t('exportWizardFilenamePlaceholder')}
        />
      </div>
    </div>
  )
}

function ReviewStep({ 
  config, 
  exportType 
}: { 
  config: ExportConfig
  exportType: string
}) {
  const { t } = useClientTranslation()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('exportWizardReviewTitle')}</h3>
        <p className="text-gray-600">{t('exportWizardReviewSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('exportWizardReviewDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('exportWizardReviewType')}</span>
              <span className="font-medium">{t(EXPORT_TYPES[exportType].title)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('exportWizardReviewFormat')}</span>
              <span className="font-medium">{config.format.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('exportWizardReviewColumns')}</span>
              <span className="font-medium">{config.columns.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('exportWizardReviewFilename')}</span>
              <span className="font-medium">{config.filename}.{config.format}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('exportWizardReviewDateRange')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('exportWizardReviewFrom')}</span>
                <span className="font-medium">{config.dateRange.start}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('exportWizardReviewTo')}</span>
                <span className="font-medium">{config.dateRange.end}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          {t('exportWizardReviewReady')}
        </AlertDescription>
      </Alert>
    </div>
  )
} 