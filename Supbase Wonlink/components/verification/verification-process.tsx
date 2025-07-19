"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Building2,
  User,
  CreditCard,
  MessageCircle,
  Star,
  Award,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react"

interface VerificationStep {
  id: string
  title: string
  description: string
  status: "pending" | "in_review" | "approved" | "rejected"
  required: boolean
}

export function VerificationProcess() {
  const { language } = useApp()
  const t = useTranslation(language)

  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})

  const verificationSteps: VerificationStep[] = [
    {
      id: "identity",
      title: "Identity Verification",
      description: "Upload government-issued ID",
      status: "approved",
      required: true,
    },
    {
      id: "business",
      title: "Business Verification",
      description: "Business license and registration",
      status: "in_review",
      required: true,
    },
    {
      id: "financial",
      title: "Financial Information",
      description: "Bank account and tax details",
      status: "pending",
      required: true,
    },
    {
      id: "social",
      title: "Social Media Verification",
      description: "Verify your social media accounts",
      status: "approved",
      required: false,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "in_review":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "in_review":
        return <Clock className="w-4 h-4" />
      case "rejected":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const completedSteps = verificationSteps.filter((step) => step.status === "approved").length
  const progressPercentage = (completedSteps / verificationSteps.length) * 100

  return (
    <EnhancedDashboardLayout title="Account Verification">
      <div className="space-y-6">
        {/* Verification Overview */}
        <Card className="korean-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-blue-600" />
                  Verification Status
                </CardTitle>
                <CardDescription>Complete verification to unlock all features</CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {completedSteps}/{verificationSteps.length} Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {verificationSteps.map((step) => (
                  <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${getStatusColor(step.status)}`}>
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{step.title}</p>
                      <p className="text-xs text-gray-600 capitalize">{step.status.replace("_", " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits of Verification */}
        <Card className="korean-card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Why Get Verified?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Trust Badge</p>
                  <p className="text-sm text-blue-700">Verified badge on profile</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Higher Visibility</p>
                  <p className="text-sm text-blue-700">Better search ranking</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Premium Features</p>
                  <p className="text-sm text-blue-700">Access to advanced tools</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">More Opportunities</p>
                  <p className="text-sm text-blue-700">Priority in campaigns</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Steps */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Identity Verification */}
          <Card className="korean-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Identity Verification</CardTitle>
                    <CardDescription>Upload government-issued ID</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor("approved")}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Verification Complete</span>
                </div>
                <p className="text-sm text-green-700">
                  Your identity has been successfully verified on January 15, 2024.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">passport_scan.pdf</span>
                  </div>
                  <Button variant="outline" size="sm" className="korean-button bg-transparent">
                    <Download className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Verification */}
          <Card className="korean-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-yellow-600" />
                  <div>
                    <CardTitle className="text-lg">Business Verification</CardTitle>
                    <CardDescription>Business license and registration</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor("in_review")}>
                  <Clock className="w-3 h-3 mr-1" />
                  In Review
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Under Review</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Your documents are being reviewed. This typically takes 1-2 business days.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">business_license.pdf</span>
                  </div>
                  <Button variant="outline" size="sm" className="korean-button bg-transparent">
                    <Download className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">registration_certificate.pdf</span>
                  </div>
                  <Button variant="outline" size="sm" className="korean-button bg-transparent">
                    <Download className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Verification */}
          <Card className="korean-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-lg">Financial Information</CardTitle>
                    <CardDescription>Bank account and tax details</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor("pending")}>
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Upload your bank statement and tax registration documents to complete financial verification.
                </p>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="bankStatement">Bank Statement (Last 3 months)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="taxDocument">Tax Registration Document</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4 korean-button korean-gradient text-white">Submit Documents</Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Verification */}
          <Card className="korean-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Social Media Verification</CardTitle>
                    <CardDescription>Verify your social media accounts</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor("approved")}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Social Accounts Verified</span>
                </div>
                <p className="text-sm text-green-700">
                  Your Instagram and TikTok accounts have been successfully verified.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">IG</span>
                    </div>
                    <span className="text-sm">@username</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">TT</span>
                    </div>
                    <span className="text-sm">@username</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communication Timeline */}
        <Card className="korean-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Communication Timeline
            </CardTitle>
            <CardDescription>Track your verification progress and communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border-l-4 border-green-500 bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-green-900">Identity Verification Approved</h4>
                    <span className="text-sm text-green-700">Jan 15, 2024</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your identity documents have been successfully verified. You now have access to basic features.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border-l-4 border-yellow-500 bg-yellow-50">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-yellow-900">Business Documents Under Review</h4>
                    <span className="text-sm text-yellow-700">Jan 14, 2024</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    We've received your business documents and they are currently being reviewed by our team.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border-l-4 border-blue-500 bg-blue-50">
                <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-900">Documents Uploaded</h4>
                    <span className="text-sm text-blue-700">Jan 13, 2024</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Business license and registration documents have been uploaded successfully.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appeals Process */}
        <Card className="korean-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Need Help?
            </CardTitle>
            <CardDescription>If you have questions or need to appeal a decision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Contact Support</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Have questions about the verification process? Our support team is here to help.
                </p>
                <Button variant="outline" className="korean-button bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Appeal a Decision</h4>
                <p className="text-sm text-gray-600 mb-3">
                  If your verification was rejected, you can submit an appeal with additional information.
                </p>
                <Button variant="outline" className="korean-button bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Submit Appeal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedDashboardLayout>
  )
}
