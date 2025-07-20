'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useClientTranslation } from '@/lib/translations'
import FileUploadZone from '@/components/import-export/file-upload-zone'

export default function ImportExportPage() {
  const { t } = useClientTranslation()
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'recent'>('import')

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('importExportTitle')}
        </h1>
        <p className="text-gray-600">
          {t('importExportSubtitle')}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            {t('importTitle')}
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            {t('exportTitle')}
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            {t('recentTitle')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'import' && (
        <ImportSection />
      )}

      {activeTab === 'export' && (
        <ExportSection />
      )}

      {activeTab === 'recent' && (
        <RecentSection />
      )}
    </div>
  )
}

function ImportSection() {
  const { t } = useClientTranslation()
  
  const handleFileSelect = (file: File) => {
    console.log('File selected:', file)
  }

  const handleUploadComplete = async (uploadId: string) => {
    console.log('Upload completed:', uploadId)
    // Process the file
    try {
      const response = await fetch('/api/import-export/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadId })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Processing result:', result)
      }
    } catch (error) {
      console.error('Processing error:', error)
    }
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">{t('importTitle')}</h2>
          <FileUploadZone
            onFileSelect={handleFileSelect}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>
      </div>

      {/* File Format Help */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">{t('importRequiredColumns')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">{t('importColumnProductName')}</div>
            <div className="text-gray-600">{t('importColumnRequired')}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">{t('importColumnPrice')}</div>
            <div className="text-gray-600">{t('importColumnRequired')}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">{t('importColumnCategory')}</div>
            <div className="text-gray-600">{t('importColumnRequired')}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">{t('importColumnDescription')}</div>
            <div className="text-gray-600">{t('importColumnOptional')}</div>
          </div>
        </div>

        {/* Template Download */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">{t('fileTemplateDownload')}</h4>
          <div className="flex space-x-3">
            <TemplateDownloadButton format="csv" />
            <TemplateDownloadButton format="xlsx" />
            <TemplateDownloadButton format="json" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportSection() {
  const { t } = useClientTranslation()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Catalog Export */}
        <ExportCard
          icon={FileText}
          iconColor="text-blue-600"
          title={t('exportProductCatalogTitle')}
          description={t('exportProductCatalogDescription')}
          exportType="products"
          buttonColor="bg-blue-600 hover:bg-blue-700"
        />

        {/* Campaign Performance Export */}
        <ExportCard
          icon={FileText}
          iconColor="text-green-600"
          title={t('exportCampaignDataTitle')}
          description={t('exportCampaignDataDescription')}
          exportType="campaigns"
          buttonColor="bg-green-600 hover:bg-green-700"
        />

        {/* Analytics Export */}
        <ExportCard
          icon={FileText}
          iconColor="text-purple-600"
          title={t('exportAnalyticsTitle')}
          description={t('exportAnalyticsDescription')}
          exportType="analytics"
          buttonColor="bg-purple-600 hover:bg-purple-700"
        />
      </div>
    </div>
  )
}

function RecentSection() {
  const { t } = useClientTranslation()

  // Mock data - in real app, fetch from API
  const recentItems = [
    { 
      name: 'product_catalog_2025.csv', 
      date: `2 ${t('timeHoursAgo')}`, 
      status: 'completed', 
      records: 1250,
      type: 'import'
    },
    { 
      name: 'campaign_data.xlsx', 
      date: `1 ${t('timeDayAgo')}`, 
      status: 'completed', 
      records: 89,
      type: 'export'
    },
    { 
      name: 'influencer_products.json', 
      date: `3 ${t('timeDaysAgo')}`, 
      status: 'processing', 
      records: 456,
      type: 'import'
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">{t('recentTitle')}</h2>
      
      <div className="space-y-4">
        {recentItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-600">
                  {item.date} • {item.records} {t('recentRecords')} • {item.type}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.status === 'completed' ? 'bg-green-100 text-green-800' :
                item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {t(`recentStatus${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`)}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                {t('recentViewDetails')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ExportCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  title: string
  description: string
  exportType: string
  buttonColor: string
}

function ExportCard({ 
  icon: Icon, 
  iconColor, 
  title, 
  description, 
  exportType, 
  buttonColor 
}: ExportCardProps) {
  const { t } = useClientTranslation()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    setIsExporting(true)
    try {
      // Call export API
      const response = await fetch('/api/import-export/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportType,
          format,
          filters: {},
          columns: []
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.export?.downloadUrl) {
          // Trigger download
          window.open(result.export.downloadUrl, '_blank')
        }
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      <div className="space-y-2">
        <button 
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className={`w-full ${buttonColor} text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50`}
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>{t('exportButtonCSV')}</span>
        </button>
        
        <button 
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
          className={`w-full ${buttonColor} text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50`}
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>{t('exportButtonExcel')}</span>
        </button>
      </div>
    </div>
  )
}

function TemplateDownloadButton({ format }: { format: 'csv' | 'xlsx' | 'json' }) {
  const { t } = useClientTranslation()
  
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/import-export/templates?format=${format}&type=products`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `product_import_template.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Template download error:', error)
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <Download className="w-4 h-4 mr-2" />
      {format.toUpperCase()}
    </button>
  )
}