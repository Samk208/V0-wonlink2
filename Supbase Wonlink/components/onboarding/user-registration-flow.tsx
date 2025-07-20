"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  MessageCircle,
  Chrome,
  PhoneIcon as Wechat,
  Building2,
  Star,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Play,
} from "lucide-react"

interface RegistrationStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export function UserRegistrationFlow() {
  const { language } = useApp()
  const { t } = useTranslation(language)
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<"brand" | "influencer" | null>(null)
  const [formData, setFormData] = useState({
    // OAuth data (simulated)
    provider: "",
    email: "",
    name: "",

    // Profile data
    companyName: "",
    website: "",
    industry: "",
    bio: "",
    socialHandles: {
      instagram: "",
      tiktok: "",
      youtube: "",
    },

    // Verification
    agreedToTerms: false,
    marketingConsent: false,
  })

  const steps: RegistrationStep[] = [
    {
      id: "oauth",
      title: t("selectLoginMethod"),
      description: "Choose your preferred login method",
      completed: currentStep > 0,
    },
    {
      id: "role",
      title: t("selectRole"),
      description: "Tell us how you'll use Wonlink",
      completed: currentStep > 1,
    },
    {
      id: "profile",
      title: "Complete Profile",
      description: "Set up your basic information",
      completed: currentStep > 2,
    },
    {
      id: "verification",
      title: "Verification",
      description: "Verify your account for full access",
      completed: currentStep > 3,
    },
    {
      id: "welcome",
      title: "Welcome",
      description: "Get started with your first steps",
      completed: false,
    },
  ]

  const handleOAuthLogin = (provider: "google" | "kakao" | "wechat") => {
    // Simulate OAuth login
    setFormData((prev) => ({
      ...prev,
      provider,
      email: `demo@${provider}.com`,
      name: "Demo User",
    }))
    setCurrentStep(1)
  }

  const handleRoleSelect = (role: "brand" | "influencer") => {
    setSelectedRole(role)
    setCurrentStep(2)
  }

  const handleProfileSubmit = () => {
    setCurrentStep(3)
  }

  const handleVerificationSubmit = () => {
    setCurrentStep(4)
  }

  const handleComplete = () => {
    // Navigate to appropriate dashboard
    if (selectedRole === "brand") {
      router.push("/brand/dashboard")
    } else {
      router.push("/influencer/dashboard")
    }
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t("welcomeToWonlink")}</h1>
                <p className="text-gray-600">{t("getSetupFewSteps")}</p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {t("stepOf").replace("{current}", String(currentStep + 1)).replace("{total}", String(steps.length))}
            </Badge>
          </div>

          <Progress value={progressPercentage} className="h-2 mb-4" />

          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${index <= currentStep ? "text-purple-600" : "text-gray-400"}`}
              >
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      index === currentStep ? "border-purple-600 bg-purple-600" : "border-gray-300"
                    }`}
                  />
                )}
                <span className="hidden md:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="korean-card shadow-xl">
          {/* Step 0: OAuth Selection */}
          {currentStep === 0 && (
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose Your Login Method</h2>
                <p className="text-gray-600">Select how you'd like to sign in to Wonlink</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <Button
                  onClick={() => handleOAuthLogin("kakao")}
                  className="w-full korean-button bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-4 rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Continue with Kakao
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>

                <Button
                  onClick={() => handleOAuthLogin("google")}
                  variant="outline"
                  className="w-full korean-button border-2 py-4 rounded-xl"
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Continue with Google
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>

                <Button
                  onClick={() => handleOAuthLogin("wechat")}
                  variant="outline"
                  className="w-full korean-button border-2 py-4 rounded-xl"
                >
                  <Wechat className="w-5 h-5 mr-3" />
                  Continue with WeChat
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </div>

              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1 text-green-500" />
                    Secure & encrypted
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-blue-500" />
                    Quick setup
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{t("howWillYouUseWonlink")}</h2>
                <p className="text-gray-600">{t("chooseBestDescribes")}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedRole === "brand"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => handleRoleSelect("brand")}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">{t("imABrand")}</CardTitle>
                    <CardDescription>{t("collaborateWithInfluencers")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Create marketing campaigns
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Find perfect influencers
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Track campaign performance
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Manage collaborations
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedRole === "influencer"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                  onClick={() => handleRoleSelect("influencer")}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-pink-600" />
                    </div>
                    <CardTitle className="text-xl">I'm an Influencer</CardTitle>
                    <CardDescription>I want to monetize my content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Find brand partnerships
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Showcase your portfolio
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Track your earnings
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Grow your audience
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}

          {/* Step 2: Profile Setup */}
          {currentStep === 2 && selectedRole && (
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedRole === "brand" ? "Tell us about your brand" : "Set up your profile"}
                </h2>
                <p className="text-gray-600">
                  {selectedRole === "brand"
                    ? "Help influencers understand your brand better"
                    : "Create an attractive profile for brands to discover you"}
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {selectedRole === "brand" ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Your company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                          <SelectItem value="fashion">Fashion & Lifestyle</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="travel">Travel & Tourism</SelectItem>
                          <SelectItem value="fitness">Health & Fitness</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bio">Company Description</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell influencers about your brand, values, and what makes you unique..."
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="bio">Bio *</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Social Media Handles</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">IG</span>
                          </div>
                          <Input
                            value={formData.socialHandles.instagram}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                socialHandles: { ...prev.socialHandles, instagram: e.target.value },
                              }))
                            }
                            placeholder="@yourusername"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">TT</span>
                          </div>
                          <Input
                            value={formData.socialHandles.tiktok}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                socialHandles: { ...prev.socialHandles, tiktok: e.target.value },
                              }))
                            }
                            placeholder="@yourusername"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">YT</span>
                          </div>
                          <Input
                            value={formData.socialHandles.youtube}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                socialHandles: { ...prev.socialHandles, youtube: e.target.value },
                              }))
                            }
                            placeholder="@yourchannel"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="korean-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleProfileSubmit}
                    className="korean-button korean-gradient text-white"
                    disabled={selectedRole === "brand" ? !formData.companyName || !formData.industry : !formData.bio}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Verify Your Account</h2>
                <p className="text-gray-600">Complete verification to unlock all features and build trust</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Why verify your account?</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Get a verified badge on your profile
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Access to premium features
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Higher visibility in search results
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Build trust with {selectedRole === "brand" ? "influencers" : "brands"}
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, agreedToTerms: checked as boolean }))
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <a href="#" className="text-purple-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-purple-600 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, marketingConsent: checked as boolean }))
                      }
                    />
                    <Label htmlFor="marketing" className="text-sm">
                      I'd like to receive marketing updates and tips (optional)
                    </Label>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Next Steps:</h4>
                  <p className="text-sm text-gray-600">
                    After completing registration, you'll receive an email with verification instructions. Document
                    verification typically takes 1-2 business days.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="korean-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleVerificationSubmit}
                    className="korean-button korean-gradient text-white"
                    disabled={!formData.agreedToTerms}
                  >
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          {/* Step 4: Welcome */}
          {currentStep === 4 && (
            <CardContent className="p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold mb-4">Welcome to Wonlink! 🎉</h2>
                <p className="text-gray-600 mb-8">
                  Your account has been created successfully. Let's get you started with your first steps.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">
                      Add more details to attract better{" "}
                      {selectedRole === "brand" ? "influencers" : "brand partnerships"}
                    </p>
                  </Card>

                  <Card className="p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Get Verified</h3>
                    <p className="text-sm text-gray-600">Upload verification documents to unlock premium features</p>
                  </Card>

                  <Card className="p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Play className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Take a Tour</h3>
                    <p className="text-sm text-gray-600">Learn how to make the most of Wonlink with our guided tour</p>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Button onClick={handleComplete} className="w-full korean-button korean-gradient text-white py-3">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button variant="outline" className="w-full korean-button bg-transparent">
                    Take the Tour First
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
