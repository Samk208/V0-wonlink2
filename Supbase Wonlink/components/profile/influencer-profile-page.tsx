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
import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  User,
  Instagram,
  Youtube,
  Star,
  Shield,
  Edit,
  Plus,
  ExternalLink,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  Heart,
  MessageCircle,
  Eye,
  DollarSign,
} from "lucide-react"

export function InfluencerProfilePage() {
  const { language } = useApp()
  const t = useTranslation(language)

  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Emma Chen",
    username: "@emmachen_style",
    bio: "Fashion & lifestyle content creator passionate about sustainable fashion and mindful living. Sharing daily outfits, beauty tips, and lifestyle inspiration with my amazing community! 🌱✨",
    avatar: "/placeholder.svg?height=100&width=100&text=EC",
    location: "Seoul, South Korea",
    joinDate: "2021",
    email: "emma@emmachen.com",
    categories: ["Fashion", "Beauty", "Lifestyle"],
    languages: ["Korean", "English", "Japanese"],
  })

  const [socialAccounts] = useState([
    {
      platform: "Instagram",
      handle: "@emmachen_style",
      followers: "125K",
      engagement: "4.2%",
      verified: true,
      connected: true,
      icon: Instagram,
      color: "from-pink-500 to-purple-500",
    },
    {
      platform: "TikTok",
      handle: "@emmachen_style",
      followers: "89K",
      engagement: "6.8%",
      verified: true,
      connected: true,
      icon: MessageCircle,
      color: "from-black to-gray-800",
    },
    {
      platform: "YouTube",
      handle: "Emma Chen",
      followers: "45K",
      engagement: "3.1%",
      verified: false,
      connected: true,
      icon: Youtube,
      color: "from-red-500 to-red-600",
    },
  ])

  const [portfolio] = useState([
    {
      id: 1,
      title: "Sustainable Fashion Haul",
      brand: "EcoStyle",
      platform: "Instagram",
      type: "Reel",
      views: "245K",
      likes: "12.3K",
      comments: "892",
      date: "2024-01-15",
      thumbnail: "/placeholder.svg?height=200&width=200&text=Fashion",
    },
    {
      id: 2,
      title: "Morning Skincare Routine",
      brand: "GlowBeauty",
      platform: "TikTok",
      type: "Video",
      views: "189K",
      likes: "15.7K",
      comments: "1.2K",
      date: "2024-01-10",
      thumbnail: "/placeholder.svg?height=200&width=200&text=Beauty",
    },
    {
      id: 3,
      title: "Seoul Cafe Tour",
      brand: "CafeHopping",
      platform: "YouTube",
      type: "Vlog",
      views: "67K",
      likes: "3.4K",
      comments: "456",
      date: "2024-01-05",
      thumbnail: "/placeholder.svg?height=200&width=200&text=Lifestyle",
    },
  ])

  const [audienceInsights] = useState({
    demographics: {
      ageGroups: [
        { range: "18-24", percentage: 35 },
        { range: "25-34", percentage: 45 },
        { range: "35-44", percentage: 15 },
        { range: "45+", percentage: 5 },
      ],
      gender: {
        female: 78,
        male: 20,
        other: 2,
      },
      topCountries: [
        { country: "South Korea", percentage: 45 },
        { country: "Japan", percentage: 20 },
        { country: "United States", percentage: 15 },
        { country: "Singapore", percentage: 10 },
        { country: "Others", percentage: 10 },
      ],
    },
    engagement: {
      avgLikes: "8.5K",
      avgComments: "342",
      avgShares: "156",
      bestPostTime: "7-9 PM KST",
      topHashtags: ["#fashion", "#ootd", "#beauty", "#lifestyle", "#seoul"],
    },
  })

  const [rateCard] = useState({
    instagramPost: "₩800,000",
    instagramStory: "₩300,000",
    instagramReel: "₩1,200,000",
    tiktokVideo: "₩600,000",
    youtubeVideo: "₩2,000,000",
    packageDeals: true,
    longTermDiscount: "15%",
  })

  const verificationStatus = {
    overall: "verified",
    identity: "verified",
    social: "verified",
    content: "verified",
  }

  return (
    <EnhancedDashboardLayout title="My Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="korean-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
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
                    <h1 className="text-2xl font-bold">{profileData.name}</h1>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-purple-600 font-medium mb-2">{profileData.username}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profileData.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {profileData.joinDate}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {profileData.categories.map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="korean-button">
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">{profileData.bio}</p>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="korean-button bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" size="sm" className="korean-button bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="rates">Rate Card</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="korean-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{profileData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{profileData.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Languages:</span>
                        <div className="flex space-x-1">
                          {profileData.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categories:</span>
                        <div className="flex space-x-1">
                          {profileData.categories.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="korean-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Followers:</span>
                    <span className="font-semibold">259K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Engagement:</span>
                    <span className="font-semibold">4.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed Campaigns:</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Earnings:</span>
                    <span className="font-semibold text-green-600">₩12.5M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold ml-1">4.9</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <CardTitle>Connected Social Media Accounts</CardTitle>
                <CardDescription>Manage your social media integrations and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialAccounts.map((account) => (
                    <div key={account.platform} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-r ${account.color} rounded-lg flex items-center justify-center`}
                          >
                            <account.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{account.platform}</h4>
                              {account.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                            </div>
                            <p className="text-sm text-gray-600">{account.handle}</p>
                          </div>
                        </div>
                        <Badge variant={account.connected ? "default" : "secondary"}>
                          {account.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Followers:</span>
                          <p className="font-semibold">{account.followers}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Engagement:</span>
                          <p className="font-semibold">{account.engagement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4 korean-button korean-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Connect New Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Content Portfolio
                    </CardTitle>
                    <CardDescription>Showcase your best work and campaign results</CardDescription>
                  </div>
                  <Button className="korean-button korean-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolio.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-square bg-gray-100 relative">
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{item.platform}</span>
                          <span>{item.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {item.views}
                          </div>
                          <div className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {item.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {item.comments}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="korean-card">
                <CardHeader>
                  <CardTitle>Demographics</CardTitle>
                  <CardDescription>Your audience breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      {audienceInsights.demographics.ageGroups.map((group) => (
                        <div key={group.range} className="flex items-center justify-between">
                          <span className="text-sm">{group.range}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full"
                                style={{ width: `${group.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{group.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Gender Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Female</span>
                        <span className="text-sm font-medium">{audienceInsights.demographics.gender.female}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Male</span>
                        <span className="text-sm font-medium">{audienceInsights.demographics.gender.male}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Other</span>
                        <span className="text-sm font-medium">{audienceInsights.demographics.gender.other}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="korean-card">
                <CardHeader>
                  <CardTitle>Engagement Insights</CardTitle>
                  <CardDescription>Performance metrics and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Avg. Likes</span>
                      <p className="font-semibold">{audienceInsights.engagement.avgLikes}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Avg. Comments</span>
                      <p className="font-semibold">{audienceInsights.engagement.avgComments}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Avg. Shares</span>
                      <p className="font-semibold">{audienceInsights.engagement.avgShares}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Best Time</span>
                      <p className="font-semibold">{audienceInsights.engagement.bestPostTime}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Top Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {audienceInsights.engagement.topHashtags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="korean-card">
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Where your audience is located</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audienceInsights.demographics.topCountries.map((country) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <span className="text-sm">{country.country}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{country.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Card Tab */}
          <TabsContent value="rates" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Rate Card
                    </CardTitle>
                    <CardDescription>Your pricing for different content types</CardDescription>
                  </div>
                  <Button variant="outline" className="korean-button bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Rates
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Instagram</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Feed Post</span>
                        <span className="font-semibold">{rateCard.instagramPost}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Story</span>
                        <span className="font-semibold">{rateCard.instagramStory}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Reel</span>
                        <span className="font-semibold">{rateCard.instagramReel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Other Platforms</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>TikTok Video</span>
                        <span className="font-semibold">{rateCard.tiktokVideo}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>YouTube Video</span>
                        <span className="font-semibold">{rateCard.youtubeVideo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Special Offers</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Package deals available for multiple posts
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {rateCard.longTermDiscount} discount for long-term partnerships
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Custom pricing for unique campaign requirements
                    </li>
                  </ul>
                </div>

                <div className="mt-6 p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Collaboration Preferences</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <p className="font-medium">Within 24 hours</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Content Delivery:</span>
                      <p className="font-medium">3-5 business days</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Revisions:</span>
                      <p className="font-medium">Up to 2 free revisions</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Usage Rights:</span>
                      <p className="font-medium">6 months included</p>
                    </div>
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
