import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Import translation hook following Wonlink i18n pattern
const useTranslation = () => {
  // This would connect to your existing translation system
  // For now, using placeholder - replace with your actual hook
  const t = (key: string) => {
    const translations = {
      // Import/Export Page Headers
      'importExport.title': 'Product Import/Export',
      'importExport.subtitle': 'Manage your product catalogs and campaign data efficiently',
      
      // Import Section
      'import.title': 'Import Products',
      'import.dropZone.idle': 'Drop your CSV, Excel, or JSON file here',
      'import.dropZone.uploading': 'Uploading...',
      'import.dropZone.processing': 'Processing data and validating...',
      'import.dropZone.complete': 'Import completed successfully!',
      'import.dropZone.error': 'Error: Please check file format and try again',
      'import.dropZone.formats': 'Supports CSV, Excel (.xlsx), and JSON formats',
      'import.chooseFile': 'Choose File',
      'import.requiredColumns': 'Required Columns:',
      'import.column.productName': 'Product Name',
      'import.column.price': 'Price',
      'import.column.category': 'Category',
      'import.column.description': 'Description',
      'import.column.required': 'Required',
      'import.column.optional': 'Optional',
      
      // Export Section
      'export.title': 'Export Data',
      'export.productCatalog.title': 'Product Catalog',
      'export.productCatalog.description': 'Export all products with pricing, categories, and metadata',
      'export.campaignData.title': 'Campaign Data',
      'export.campaignData.description': 'Export campaign performance metrics and ROI data',
      'export.analytics.title': 'Analytics Report',
      'export.analytics.description': 'Export detailed analytics and performance insights',
      'export.button.csv': 'Export CSV',
      'export.button.excel': 'Export Excel',
      'export.button.pdf': 'Export PDF',
      
      // Recent Imports
      'recent.title': 'Recent Imports',
      'recent.records': 'records',
      'recent.status.completed': 'completed',
      'recent.status.processing': 'processing',
      'recent.status.error': 'error',
      'recent.viewDetails': 'View Details',
      
      // Time expressions
      'time.hoursAgo': 'hours ago',
      'time.dayAgo': 'day ago',
      'time.daysAgo': 'days ago'
    };
    
    return translations[key] || key;
  };
  
  return { t };
};

const ImportExportInterface = () => {
  const { t } = useTranslation();
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, complete, error
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.json'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setUploadStatus('processing');
    
    // Simulate processing
    setTimeout(() => {
      setUploadStatus('complete');
    }, 2000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const StatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Upload className="w-8 h-8 text-gray-400" />;
    }
  };

  const StatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return `${t('import.dropZone.uploading')} ${progress}%`;
      case 'processing':
        return t('import.dropZone.processing');
      case 'complete':
        return t('import.dropZone.complete');
      case 'error':
        return t('import.dropZone.error');
      default:
        return t('import.dropZone.idle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('importExport.title')}</h1>
        <p className="text-gray-600">{t('importExport.subtitle')}</p>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">{t('import.title')}</h2>
          
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center space-y-4">
              <StatusIcon />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  <StatusMessage />
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('import.dropZone.formats')}
                </p>
              </div>
              
              {uploadStatus === 'idle' && (
                <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {t('import.chooseFile')}
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.json"
                    onChange={(e) => handleFiles(Array.from(e.target.files))}
                  />
                </label>
              )}
              
              {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                <div className="w-full max-w-xs">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadStatus === 'processing' ? 100 : progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Format Help */}
          <div className="mt-6 text-left">
            <h3 className="font-medium text-gray-900 mb-3">{t('import.requiredColumns')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{t('import.column.productName')}</div>
                <div className="text-gray-600">{t('import.column.required')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{t('import.column.price')}</div>
                <div className="text-gray-600">{t('import.column.required')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{t('import.column.category')}</div>
                <div className="text-gray-600">{t('import.column.required')}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{t('import.column.description')}</div>
                <div className="text-gray-600">{t('import.column.optional')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-xl font-semibold mb-6">{t('export.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Catalog Export */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium">{t('export.productCatalog.title')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('export.productCatalog.description')}
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>{t('export.button.csv')}</span>
            </button>
          </div>

          {/* Campaign Performance Export */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h3 className="font-medium">{t('export.campaignData.title')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('export.campaignData.description')}
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>{t('export.button.excel')}</span>
            </button>
          </div>

          {/* Analytics Export */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h3 className="font-medium">{t('export.analytics.title')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('export.analytics.description')}
            </p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>{t('export.button.pdf')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Imports */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-xl font-semibold mb-6">{t('recent.title')}</h2>
        
        <div className="space-y-4">
          {[
            { name: 'product_catalog_2025.csv', date: `2 ${t('time.hoursAgo')}`, status: 'completed', records: 1250 },
            { name: 'campaign_data.xlsx', date: `1 ${t('time.dayAgo')}`, status: 'completed', records: 89 },
            { name: 'influencer_products.json', date: `3 ${t('time.daysAgo')}`, status: 'processing', records: 456 }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.date} • {item.records} {t('recent.records')}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'completed' ? 'bg-green-100 text-green-800' :
                  item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {t(`recent.status.${item.status}`)}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">{t('recent.viewDetails')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImportExportInterface;