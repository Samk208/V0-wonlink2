"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { UniversalCard } from "./cards/universal-card"
import { cn } from "@/lib/utils"
import { Check, AlertCircle, Info } from "lucide-react"

interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
  validation?: (data: any) => string[]
}

interface FormField {
  id: string
  type: "text" | "email" | "password" | "textarea" | "select" | "checkbox" | "radio" | "file"
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: (value: any) => string | null
  helpText?: string
  disabled?: boolean
}

interface UniversalFormProps {
  steps?: FormStep[]
  fields?: FormField[]
  title?: string
  description?: string
  submitText?: string
  onSubmit: (data: any) => Promise<void> | void
  loading?: boolean
  multiStep?: boolean
  showProgress?: boolean
  className?: string
}

export function UniversalForm({
  steps = [],
  fields = [],
  title,
  description,
  submitText = "Submit",
  onSubmit,
  loading = false,
  multiStep = false,
  showProgress = true,
  className,
}: UniversalFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const currentFields = multiStep ? steps[currentStep]?.fields || [] : fields
  const totalSteps = multiStep ? steps.length : 1
  const progress = multiStep ? ((currentStep + 1) / totalSteps) * 100 : 100

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === "")) {
      return `${field.label} is required`
    }

    if (field.validation) {
      return field.validation(value)
    }

    // Built-in validations
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address"
      }
    }

    return null
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }))
    }
  }

  const handleFieldBlur = (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field.id]: true }))

    const error = validateField(field, formData[field.id])
    if (error) {
      setErrors((prev) => ({ ...prev, [field.id]: error }))
    }
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    currentFields.forEach((field) => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCurrentStep()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const renderField = (field: FormField) => {
    const hasError = errors[field.id] && touched[field.id]
    const fieldValue = formData[field.id] || ""

    const fieldClasses = cn(
      "transition-all duration-200",
      hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
    )

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {field.type === "text" || field.type === "email" || field.type === "password" ? (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            disabled={field.disabled || loading}
            className={fieldClasses}
          />
        ) : field.type === "textarea" ? (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            disabled={field.disabled || loading}
            className={fieldClasses}
            rows={4}
          />
        ) : field.type === "select" ? (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.id, value)}
            disabled={field.disabled || loading}
          >
            <SelectTrigger className={fieldClasses}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "checkbox" ? (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={fieldValue}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={field.disabled || loading}
            />
            <Label htmlFor={field.id} className="text-sm text-gray-700 dark:text-gray-300">
              {field.placeholder}
            </Label>
          </div>
        ) : field.type === "radio" ? (
          <RadioGroup
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.id, value)}
            disabled={field.disabled || loading}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`} className="text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : null}

        {/* Help Text */}
        {field.helpText && !hasError && (
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>{field.helpText}</span>
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{errors[field.id]}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <UniversalCard className={cn("max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        {(title || description) && (
          <div className="text-center space-y-2">
            {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
            {description && <p className="text-gray-600 dark:text-gray-400">{description}</p>}
          </div>
        )}

        {/* Progress Bar */}
        {multiStep && showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Title */}
        {multiStep && steps[currentStep] && (
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{steps[currentStep].title}</h3>
            {steps[currentStep].description && (
              <p className="text-gray-600 dark:text-gray-400">{steps[currentStep].description}</p>
            )}
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">{currentFields.map(renderField)}</div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          {multiStep && currentStep > 0 ? (
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={loading}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          {multiStep && currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>{submitText}</span>
                </div>
              )}
            </Button>
          )}
        </div>
      </form>
    </UniversalCard>
  )
}
