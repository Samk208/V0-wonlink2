'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  RefreshCw, 
  Eye,
  Trash2,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClientTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'

interface ProcessingJob {
  id: string
  type: 'import' | 'export'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  fileName: string
  fileSize: number
  progress: number
  totalRecords: number
  processedRecords: number
  successCount: number
  errorCount: number
  startedAt: Date
  completedAt?: Date
  errorDetails?: string[]
  downloadUrl?: string
}

interface ProgressDashboardProps {
  jobs: ProcessingJob[]
  onJobAction?: (jobId: string, action: 'retry' | 'cancel' | 'download' | 'view') => void
  onRefresh?: () => void
  className?: string
}

export function ProgressDashboard({
  jobs,
  onJobAction,
  onRefresh,
  className
}: ProgressDashboardProps) {
  const { t } = useClientTranslation()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh active jobs
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      const hasActiveJobs = jobs.some(job => 
        job.status === 'pending' || job.status === 'processing'
      )
      if (hasActiveJobs) {
        onRefresh?.()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [autoRefresh, jobs, onRefresh])

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus
    const matchesType = filterType === 'all' || job.type === filterType
    const matchesSearch = job.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const activeJobs = jobs.filter(job => 
    job.status === 'pending' || job.status === 'processing'
  )

  const completedJobs = jobs.filter(job => job.status === 'completed')
  const failedJobs = jobs.filter(job => job.status === 'failed')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (start: Date, end?: Date): string => {
    const duration = end ? end.getTime() - start.getTime() : Date.now() - start.getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('progressDashboardTitle')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('progressDashboardSubtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh?.()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('progressDashboardRefresh')}
          </Button>
          
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="w-4 h-4 mr-2" />
            {autoRefresh ? t('progressDashboardAutoRefreshOn') : t('progressDashboardAutoRefreshOff')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title={t('progressDashboardActiveJobs')}
          value={activeJobs.length}
          icon={Clock}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title={t('progressDashboardCompletedJobs')}
          value={completedJobs.length}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title={t('progressDashboardFailedJobs')}
          value={failedJobs.length}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <MetricCard
          title={t('progressDashboardTotalJobs')}
          value={jobs.length}
          icon={FileText}
          color="text-gray-600"
          bgColor="bg-gray-50"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('progressDashboardSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('progressDashboardFilterStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('progressDashboardFilterAll')}</SelectItem>
                  <SelectItem value="pending">{t('progressDashboardFilterPending')}</SelectItem>
                  <SelectItem value="processing">{t('progressDashboardFilterProcessing')}</SelectItem>
                  <SelectItem value="completed">{t('progressDashboardFilterCompleted')}</SelectItem>
                  <SelectItem value="failed">{t('progressDashboardFilterFailed')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('progressDashboardFilterType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('progressDashboardFilterAll')}</SelectItem>
                  <SelectItem value="import">{t('progressDashboardFilterImport')}</SelectItem>
                  <SelectItem value="export">{t('progressDashboardFilterExport')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>{t('progressDashboardActiveJobs')}</span>
              <Badge variant="secondary">{activeJobs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeJobs.map(job => (
              <ActiveJobCard
                key={job.id}
                job={job}
                onAction={onJobAction}
                formatFileSize={formatFileSize}
                formatDuration={formatDuration}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('progressDashboardAllJobs')}</span>
            <Badge variant="secondary">{filteredJobs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('progressDashboardNoJobs')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map(job => (
                <JobListItem
                  key={job.id}
                  job={job}
                  onAction={onJobAction}
                  formatFileSize={formatFileSize}
                  formatDuration={formatDuration}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Summary */}
      {failedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>{t('progressDashboardErrorSummary')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedJobs.slice(0, 3).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">{job.fileName}</p>
                      <p className="text-xs text-red-600">
                        {job.errorDetails?.[0] || t('progressDashboardUnknownError')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onJobAction?.(job.id, 'retry')}
                  >
                    {t('progressDashboardRetry')}
                  </Button>
                </div>
              ))}
              {failedJobs.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setFilterStatus('failed')}
                >
                  {t('progressDashboardViewAllErrors')} ({failedJobs.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor 
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bgColor)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActiveJobCard({
  job,
  onAction,
  formatFileSize,
  formatDuration,
  getStatusIcon
}: {
  job: ProcessingJob
  onAction?: (jobId: string, action: string) => void
  formatFileSize: (bytes: number) => string
  formatDuration: (start: Date, end?: Date) => string
  getStatusIcon: (status: string) => React.ReactNode
}) {
  const { t } = useClientTranslation()

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(job.status)}
          <div>
            <p className="font-medium text-sm">{job.fileName}</p>
            <p className="text-xs text-gray-500">
              {formatFileSize(job.fileSize)} • {job.type} • {formatDuration(job.startedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {job.processedRecords} / {job.totalRecords}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction?.(job.id, 'cancel')}
          >
            {t('progressDashboardCancel')}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{t('progressDashboardProgress')}</span>
          <span>{job.progress}%</span>
        </div>
        <Progress value={job.progress} className="h-2" />
      </div>
      
      {job.errorCount > 0 && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {t('progressDashboardErrorsFound', { count: job.errorCount })}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function JobListItem({
  job,
  onAction,
  formatFileSize,
  formatDuration,
  getStatusColor,
  getStatusIcon
}: {
  job: ProcessingJob
  onAction?: (jobId: string, action: string) => void
  formatFileSize: (bytes: number) => string
  formatDuration: (start: Date, end?: Date) => string
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}) {
  const { t } = useClientTranslation()

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(job.status)}
          <Badge className={cn('text-xs', getStatusColor(job.status))}>
            {t(`progressDashboardStatus${job.status.charAt(0).toUpperCase() + job.status.slice(1)}`)}
          </Badge>
        </div>
        
        <div>
          <p className="font-medium text-sm">{job.fileName}</p>
          <p className="text-xs text-gray-500">
            {formatFileSize(job.fileSize)} • {job.type} • {formatDuration(job.startedAt, job.completedAt)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {job.status === 'completed' && job.downloadUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction?.(job.id, 'download')}
          >
            <Download className="w-4 h-4 mr-1" />
            {t('progressDashboardDownload')}
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction?.(job.id, 'view')}
        >
          <Eye className="w-4 h-4 mr-1" />
          {t('progressDashboardView')}
        </Button>
        
        {job.status === 'failed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction?.(job.id, 'retry')}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {t('progressDashboardRetry')}
          </Button>
        )}
      </div>
    </div>
  )
} 