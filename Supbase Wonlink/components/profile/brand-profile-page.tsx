"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  Building2,
  Globe,
  Users,
  Shield,
  Edit,
  Plus,
  Upload,
  ExternalLink,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export function BrandProfilePage() {
  const { language } = useApp()
  const t = useTranslation(language)

  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    companyName: "TechFlow Solutions",
    website: "https://techflow.com",
    industry: "Technology",
    description:
      "We create innovative software solutions that help businesses streamline their operations and boost productivity. Our team of experts specializes in AI-powered tools and automation.",
    logo: "/placeholder.svg?height=100&width=100&text=TF",
    founded: "2019",
    employees: "50-100",
    location: "Seoul, South Korea",
    email: "partnerships@techflow.com",
    phone: "+82-2-1234-5678",
  })

  const [teamMembers] = useState([
    {
      id: 1,
      name: "Sarah Kim",
      role: "Marketing Director",
      email: "sarah@techflow.com",
      avatar: "/placeholder.svg?height=40&width=40&text=SK",
      permissions: ["campaigns", "analytics", "payments"],
    },
    {
      id: 2,
      name: "James Park",
      role: "Brand Manager",
      email: "james@techflow.com",
      avatar: "/placeholder.svg?height=40&width=40&text=JP",
      permissions: ["campaigns", "communications"],
    },
  ])

  const [brandGuidelines] = useState({
    primaryColors: ["#6366F1", "#8B5CF6", "#EC4899"],
    fonts: ["Inter", "Roboto"],
    tone: "Professional yet approachable",
    doNots: ["Avoid overly casual language", "No competitor mentions", "Keep content family-friendly"],
    assets: [
      { name: "Logo Pack", type: "ZIP", size: "2.4 MB" },
      { name: "Brand Guidelines", type: "PDF", size: "1.8 MB" },
      { name: "Product Images", type: "ZIP", size: "15.2 MB" },
    ],
  })

  const [pastCampaigns] = useState([
    {
      id: 1,
      title: "AI Tool Launch Campaign",
      period: "Dec 2023 - Jan 2024",
      influencers: 12,
      reach: "2.5M",
      engagement: "4.2%",
      roi: "320%",
      status: "completed",
    },
    {
      id: 2,
      title: "Holiday Season Promotion",
      period: "Nov 2023 - Dec 2023",
      influencers: 8,
      reach: "1.8M",
      engagement: "3.8%",
      roi: "280%",
      status: "completed",
    },
  ])

  const verificationStatus = {
    overall: "verified",
    business: "verified",
    financial: "verified",
    identity: "verified",
  }

  return (
    <EnhancedDashboardLayout title="Brand Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="korean-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileData.logo || "/placeholder.svg"} alt={profileData.companyName} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {profileData.companyName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {verificationStatus.overall === "verified" && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-bold">{profileData.companyName}</h1>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{profileData.industry}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profileData.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Founded {profileData.founded}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {profileData.employees} employees
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="korean-button">
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>

            <p className="text-gray-700 leading-relaxed">{profileData.description}</p>

            <div className="flex items-center space-x-4 mt-4">
              <Button variant="outline" size="sm" className="korean-button bg-transparent">
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <Button variant="outline" size="sm" className="korean-button bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="korean-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, companyName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={profileData.industry}
                          onValueChange={(value) => setProfileData((prev) => ({ ...prev, industry: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Beauty">Beauty & Cosmetics</SelectItem>
                            <SelectItem value="Fashion">Fashion & Lifestyle</SelectItem>
                            <SelectItem value="Food">Food & Beverage</SelectItem>
                            <SelectItem value="Travel">Travel & Tourism</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={profileData.description}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, description: e.target.value }))}
                          rows={4}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Website:</span>
                        <a href={profileData.website} className="text-purple-600 hover:underline">
                          {profileData.website}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span>{profileData.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Founded:</span>
                        <span>{profileData.founded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company Size:</span>
                        <span>{profileData.employees}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="korean-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Campaigns:</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Campaigns:</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Reach:</span>
                    <span className="font-semibold">12.5M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Engagement:</span>
                    <span className="font-semibold">4.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. ROI:</span>
                    <span className="font-semibold text-green-600">285%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team and their permissions</CardDescription>
                  </div>
                  <Button className="korean-button korean-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {member.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="korean-button bg-transparent">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="korean-card">
                <CardHeader>
                  <CardTitle>Brand Guidelines</CardTitle>
                  <CardDescription>Help influencers understand your brand</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Brand Colors</Label>
                    <div className="flex space-x-2 mt-2">
                      {brandGuidelines.primaryColors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Typography</Label>
                    <div className="flex space-x-2 mt-2">
                      {brandGuidelines.fonts.map((font, index) => (
                        <Badge key={index} variant="outline">
                          {font}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tone of Voice</Label>
                    <p className="text-sm text-gray-600 mt-1">{brandGuidelines.tone}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Content Guidelines</Label>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {brandGuidelines.doNots.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <AlertCircle className="w-3 h-3 mr-2 text-amber-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="korean-card">
                <CardHeader>
                  <CardTitle>Brand Assets</CardTitle>
                  <CardDescription>Download brand materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {brandGuidelines.assets.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Upload className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-gray-500">
                              {asset.type} • {asset.size}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="korean-button bg-transparent">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4 korean-button korean-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload New Asset
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Past Campaigns
                </CardTitle>
                <CardDescription>Showcase your successful collaborations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{campaign.title}</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {campaign.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{campaign.period}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Influencers:</span>
                          <p className="font-semibold">{campaign.influencers}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Reach:</span>
                          <p className="font-semibold">{campaign.reach}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Engagement:</span>
                          <p className="font-semibold">{campaign.engagement}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">ROI:</span>
                          <p className="font-semibold text-green-600">{campaign.roi}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verification Status
                </CardTitle>
                <CardDescription>Your account verification details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-900">Account Verified</h4>
                        <p className="text-sm text-green-700">Your account has been fully verified</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Verified</Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Business License</p>
                        <p className="text-sm text-gray-600">Verified</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Financial Info</p>
                        <p className="text-sm text-gray-600">Verified</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Identity</p>
                        <p className="text-sm text-gray-600">Verified</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Verification Benefits</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verified badge on your profile
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Higher visibility in search results
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Access to premium features
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Increased trust from influencers
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}
