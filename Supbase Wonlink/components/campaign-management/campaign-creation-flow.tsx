"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { UniversalCard } from "@/components/design-system/cards/universal-card"
import { UniversalHeader } from "@/components/design-system/navigation/universal-header"
import { PageLayout } from "@/components/design-system/layout/page-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Save,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  DollarSign,
  Users,
  Target,
  Instagram,
  Youtube,
  MessageCircle,
  Eye,
  Heart,
} from "lucide-react"

interface CampaignData {
  // Step 1: Basics
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  campaignImage?: File

  // Step 2: Requirements
  budget: string
  deliverables: string[]
  platforms: string[]
  audienceSize: string
  audienceAge: string[]
  audienceGender: string
  audienceLocation: string[]
  contentGuidelines: string
  hashtags: string[]

  // Step 3: Review
  isDraft: boolean
}

const CAMPAIGN_CATEGORIES = [
  { value: "product-launch", label: "Product Launch" },
  { value: "brand-awareness", label: "Brand Awareness" },
  { value: "content-creation", label: "Content Creation" },
  { value: "event-promotion", label: "Event Promotion" },
  { value: "seasonal", label: "Seasonal Campaign" },
]

const DELIVERABLE_OPTIONS = [
  { id: "instagram-post", label: "Instagram Post", icon: Instagram },
  { id: "instagram-story", label: "Instagram Story", icon: Instagram },
  { id: "youtube-video", label: "YouTube Video", icon: Youtube },
  { id: "tiktok-video", label: "TikTok Video", icon: MessageCircle },
  { id: "blog-post", label: "Blog Post", icon: Eye },
  { id: "product-review", label: "Product Review", icon: Heart },
]

const PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "tiktok", label: "TikTok", icon: MessageCircle },
]

export default function CampaignCreationFlow() {
  const { language } = useApp()
  const t = useTranslation(language)
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(0)
  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    budget: "",
    deliverables: [],
    platforms: [],
    audienceSize: "",
    audienceAge: [],
    audienceGender: "",
    audienceLocation: [],
    contentGuidelines: "",
    hashtags: [],
    isDraft: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps = [
    {
      id: "basics",
      title: "Campaign Basics",
      description: "Set up your campaign foundation",
      icon: Target,
    },
    {
      id: "requirements",
      title: "Requirements & Budget",
      description: "Define deliverables and audience",
      icon: Users,
    },
    {
      id: "review",
      title: "Review & Publish",
      description: "Review and launch your campaign",
      icon: Check,
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateCampaignData = (field: string, value: any) => {
    setCampaignData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user updates field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!campaignData.title) newErrors.title = "Campaign title is required"
      if (!campaignData.description) newErrors.description = "Campaign description is required"
      if (!campaignData.category) newErrors.category = "Campaign category is required"
      if (!campaignData.startDate) newErrors.startDate = "Start date is required"
      if (!campaignData.endDate) newErrors.endDate = "End date is required"
    } else if (step === 1) {
      if (!campaignData.budget) newErrors.budget = "Budget is required"
      if (campaignData.deliverables.length === 0) newErrors.deliverables = "At least one deliverable is required"
      if (campaignData.platforms.length === 0) newErrors.platforms = "At least one platform is required"
      if (!campaignData.audienceSize) newErrors.audienceSize = "Audience size requirement is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCampaignData((prev) => ({ ...prev, isDraft: true }))
      // Show success message
      console.log("Draft saved successfully")
    } catch (error) {
      console.error("Error saving draft:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push("/brand/campaigns")
    } catch (error) {
      console.error("Error publishing campaign:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Campaign Image Upload */}
            <div className="space-y-2">
              <Label>Campaign Image</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Upload campaign image</p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                placeholder="Enter campaign title"
                value={campaignData.title}
                onChange={(e) => updateCampaignData("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Campaign Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your campaign goals and what you're looking for"
                value={campaignData.description}
                onChange={(e) => updateCampaignData("description", e.target.value)}
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Campaign Category *</Label>
              <Select value={campaignData.category} onValueChange={(value) => updateCampaignData("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select campaign category" />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Timeline */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={campaignData.startDate}
                  onChange={(e) => updateCampaignData("startDate", e.target.value)}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={campaignData.endDate}
                  onChange={(e) => updateCampaignData("endDate", e.target.value)}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Campaign Budget *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="budget"
                  placeholder="Enter total budget"
                  value={campaignData.budget}
                  onChange={(e) => updateCampaignData("budget", e.target.value)}
                  className={cn("pl-10", errors.budget ? "border-red-500" : "")}
                />
              </div>
              {errors.budget && <p className="text-sm text-red-600">{errors.budget}</p>}
            </div>

            {/* Deliverables */}
            <div className="space-y-3">
              <Label>Required Deliverables *</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {DELIVERABLE_OPTIONS.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Checkbox
                      id={deliverable.id}
                      checked={campaignData.deliverables.includes(deliverable.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateCampaignData("deliverables", [...campaignData.deliverables, deliverable.id])
                        } else {
                          updateCampaignData(
                            "deliverables",
                            campaignData.deliverables.filter((d) => d !== deliverable.id),
                          )
                        }
                      }}
                    />
                    <deliverable.icon className="w-5 h-5 text-primary-600" />
                    <Label htmlFor={deliverable.id} className="flex-1 cursor-pointer">
                      {deliverable.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.deliverables && <p className="text-sm text-red-600">{errors.deliverables}</p>}
            </div>

            {/* Platforms */}
            <div className="space-y-3">
              <Label>Target Platforms *</Label>
              <div className="flex flex-wrap gap-3">
                {PLATFORM_OPTIONS.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Checkbox
                      id={platform.id}
                      checked={campaignData.platforms.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateCampaignData("platforms", [...campaignData.platforms, platform.id])
                        } else {
                          updateCampaignData(
                            "platforms",
                            campaignData.platforms.filter((p) => p !== platform.id),
                          )
                        }
                      }}
                    />
                    <platform.icon className="w-5 h-5 text-primary-600" />
                    <Label htmlFor={platform.id} className="cursor-pointer">
                      {platform.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.platforms && <p className="text-sm text-red-600">{errors.platforms}</p>}
            </div>

            {/* Audience Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audience Requirements</h3>

              <div className="space-y-2">
                <Label>Minimum Follower Count *</Label>
                <Select
                  value={campaignData.audienceSize}
                  onValueChange={(value) => updateCampaignData("audienceSize", value)}
                >
                  <SelectTrigger className={errors.audienceSize ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select minimum follower count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1k-10k">1K - 10K followers</SelectItem>
                    <SelectItem value="10k-50k">10K - 50K followers</SelectItem>
                    <SelectItem value="50k-100k">50K - 100K followers</SelectItem>
                    <SelectItem value="100k+">100K+ followers</SelectItem>
                  </SelectContent>
                </Select>
                {errors.audienceSize && <p className="text-sm text-red-600">{errors.audienceSize}</p>}
              </div>

              <div className="space-y-2">
                <Label>Target Age Groups</Label>
                <div className="flex flex-wrap gap-2">
                  {["18-24", "25-34", "35-44", "45-54", "55+"].map((age) => (
                    <Badge
                      key={age}
                      variant={campaignData.audienceAge.includes(age) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (campaignData.audienceAge.includes(age)) {
                          updateCampaignData(
                            "audienceAge",
                            campaignData.audienceAge.filter((a) => a !== age),
                          )
                        } else {
                          updateCampaignData("audienceAge", [...campaignData.audienceAge, age])
                        }
                      }}
                    >
                      {age}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Guidelines */}
            <div className="space-y-2">
              <Label htmlFor="contentGuidelines">Content Guidelines</Label>
              <Textarea
                id="contentGuidelines"
                placeholder="Provide specific guidelines for content creation"
                value={campaignData.contentGuidelines}
                onChange={(e) => updateCampaignData("contentGuidelines", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {/* Campaign Summary */}
            <UniversalCard variant="outlined" padding="lg">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Summary</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                      <p className="font-medium text-gray-900 dark:text-white">{campaignData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {CAMPAIGN_CATEGORIES.find((c) => c.value === campaignData.category)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {campaignData.startDate} - {campaignData.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                      <p className="font-medium text-gray-900 dark:text-white">${campaignData.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Deliverables</p>
                      <div className="flex flex-wrap gap-1">
                        {campaignData.deliverables.map((deliverable) => (
                          <Badge key={deliverable} variant="secondary" className="text-xs">
                            {DELIVERABLE_OPTIONS.find((d) => d.id === deliverable)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Platforms</p>
                      <div className="flex flex-wrap gap-1">
                        {campaignData.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {PLATFORM_OPTIONS.find((p) => p.id === platform)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{campaignData.description}</p>
                </div>
              </div>
            </UniversalCard>

            {/* Publishing Options */}
            <UniversalCard variant="outlined" padding="lg">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Publishing Options</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Publish Immediately</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Campaign will be visible to influencers right away
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg opacity-50">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Schedule for Later</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set a specific date and time to publish
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
            </UniversalCard>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <PageLayout variant="default" background="gradient" className="min-h-screen">
      <UniversalHeader
        variant="dashboard"
        showBack
        title="Create Campaign"
        subtitle="Set up your influencer marketing campaign"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h1>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
              className="flex items-center space-x-2 bg-transparent"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                      isActive && "bg-primary-50 dark:bg-primary-900/20",
                      isCompleted && "bg-green-50 dark:bg-green-900/20",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                        isActive && "bg-primary-600 text-white",
                        isCompleted && "bg-green-600 text-white",
                        !isActive && !isCompleted && "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
                      )}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div className="hidden md:block">
                      <p
                        className={cn(
                          "font-medium",
                          isActive && "text-primary-900 dark:text-primary-100",
                          isCompleted && "text-green-900 dark:text-green-100",
                          !isActive && !isCompleted && "text-gray-600 dark:text-gray-400",
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "hidden md:block w-16 h-0.5 mx-4 transition-all duration-200",
                        index < currentStep ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700",
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <UniversalCard padding="lg" className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{steps[currentStep].title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
        </UniversalCard>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || loading}
            className="flex items-center space-x-2 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Campaign</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
