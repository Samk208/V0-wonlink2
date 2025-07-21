'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Save, 
  Loader2,
  Settings,
  RefreshCw,
  Download,
  Upload,
  GripVertical
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useClientTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'

interface ColumnMapping {
  sourceColumn: string
  targetField: string
  confidence: number
  isRequired: boolean
  sampleValue?: string
}

interface ColumnMappingInterfaceProps {
  columns: string[]
  sampleData: Record<string, any>[]
  onMappingComplete: (mapping: Record<string, string>) => void
  onSaveTemplate?: (template: ColumnMappingTemplate) => void
  onLoadTemplate?: (templateId: string) => void
  className?: string
}

interface ColumnMappingTemplate {
  id: string
  name: string
  mappings: ColumnMapping[]
  createdAt: Date
}

const REQUIRED_FIELDS = ['name', 'price', 'category']
const OPTIONAL_FIELDS = ['description', 'brand', 'sku', 'imageUrl', 'tags']

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

export function ColumnMappingInterface({
  columns,
  sampleData,
  onMappingComplete,
  onSaveTemplate,
  onLoadTemplate,
  className
}: ColumnMappingInterfaceProps) {
  const { t } = useClientTranslation()
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [isAutoMapping, setIsAutoMapping] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)

  // Auto-detect column mappings
  const autoDetectMappings = useCallback(() => {
    setIsAutoMapping(true)
    
    setTimeout(() => {
      const detectedMappings: ColumnMapping[] = columns.map(column => {
        let bestMatch = { field: '', confidence: 0 }
        
        // Check against field patterns
        Object.entries(FIELD_PATTERNS).forEach(([field, pattern]) => {
          if (pattern.test(column)) {
            const confidence = pattern.test(column) ? 0.9 : 0.7
            if (confidence > bestMatch.confidence) {
              bestMatch = { field, confidence }
            }
          }
        })
        
        // Check for exact matches
        const exactMatch = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].find(field => 
          field.toLowerCase() === column.toLowerCase()
        )
        if (exactMatch) {
          bestMatch = { field: exactMatch, confidence: 1.0 }
        }
        
        return {
          sourceColumn: column,
          targetField: bestMatch.field || '',
          confidence: bestMatch.confidence,
          isRequired: REQUIRED_FIELDS.includes(bestMatch.field),
          sampleValue: sampleData[0]?.[column] || ''
        }
      })
      
      setMappings(detectedMappings)
      setIsAutoMapping(false)
    }, 1000)
  }, [columns, sampleData])

  const handleMappingChange = (sourceColumn: string, targetField: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.sourceColumn === sourceColumn 
        ? { ...mapping, targetField }
        : mapping
    ))
  }

  const getFieldOptions = () => {
    return [
      { value: '', label: t('mapping.selectField') },
      ...REQUIRED_FIELDS.map(field => ({ 
        value: field, 
        label: `${field} (${t('mapping.required')})` 
      })),
      ...OPTIONAL_FIELDS.map(field => ({ 
        value: field, 
        label: field 
      }))
    ]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800'
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="w-4 h-4" />
    if (confidence >= 0.7) return <AlertCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  const validateMappings = () => {
    const requiredMappings = mappings.filter(m => m.isRequired)
    return requiredMappings.every(m => m.targetField)
  }

  const handleComplete = () => {
    const mappingObject = mappings.reduce((acc, mapping) => {
      if (mapping.targetField) {
        acc[mapping.sourceColumn] = mapping.targetField
      }
      return acc
    }, {} as Record<string, string>)
    
    onMappingComplete(mappingObject)
  }

  const highConfidenceMappings = mappings.filter(m => m.confidence >= confidenceThreshold)
  const lowConfidenceMappings = mappings.filter(m => m.confidence < confidenceThreshold)

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>{t('mapping.title')}</span>
          </CardTitle>
          <CardDescription>
            {t('mapping.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-mapping Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={autoDetectMappings}
                disabled={isAutoMapping}
                variant="outline"
                size="sm"
              >
                {isAutoMapping ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {t('mapping.autoDetect')}
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t('mapping.confidenceThreshold')}:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">{Math.round(confidenceThreshold * 100)}%</span>
              </div>
            </div>
            
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? t('mapping.hidePreview') : t('mapping.showPreview')}
            </Button>
          </div>

          {/* High Confidence Mappings */}
          {highConfidenceMappings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-green-700">
                {t('mapping.highConfidence')} ({highConfidenceMappings.length})
              </h3>
              <div className="space-y-2">
                {highConfidenceMappings.map((mapping, index) => (
                  <div key={mapping.sourceColumn} className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{mapping.sourceColumn}</span>
                        <Badge className={getConfidenceColor(mapping.confidence)}>
                          {Math.round(mapping.confidence * 100)}%
                        </Badge>
                        {mapping.isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            {t('mapping.required')}
                          </Badge>
                        )}
                      </div>
                      {mapping.sampleValue && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t('mapping.sample')}: {mapping.sampleValue}
                        </p>
                      )}
                    </div>
                    <Select
                      value={mapping.targetField}
                      onValueChange={(value) => handleMappingChange(mapping.sourceColumn, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t('mapping.selectField')} />
                      </SelectTrigger>
                      <SelectContent>
                        {getFieldOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Confidence Mappings */}
          {lowConfidenceMappings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-yellow-700">
                {t('mapping.lowConfidence')} ({lowConfidenceMappings.length})
              </h3>
              <div className="space-y-2">
                {lowConfidenceMappings.map((mapping) => (
                  <div key={mapping.sourceColumn} className="flex items-center space-x-3 p-3 border rounded-lg bg-yellow-50">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{mapping.sourceColumn}</span>
                        <Badge className={getConfidenceColor(mapping.confidence)}>
                          {Math.round(mapping.confidence * 100)}%
                        </Badge>
                      </div>
                      {mapping.sampleValue && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t('mapping.sample')}: {mapping.sampleValue}
                        </p>
                      )}
                    </div>
                    <Select
                      value={mapping.targetField}
                      onValueChange={(value) => handleMappingChange(mapping.sourceColumn, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t('mapping.selectField')} />
                      </SelectTrigger>
                      <SelectContent>
                        {getFieldOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation */}
          {mappings.length > 0 && (
            <Alert className={validateMappings() ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              {validateMappings() ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                {validateMappings() 
                  ? t('mapping.validation.passed')
                  : t('mapping.validation.failed')
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleComplete}
              disabled={!validateMappings()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {t('mapping.complete')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 