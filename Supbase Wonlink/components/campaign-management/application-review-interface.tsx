"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UniversalCard, MetricCard } from "@/components/design-system/cards/universal-card"
import { UniversalHeader } from "@/components/design-system/navigation/universal-header"
import { PageLayout } from "@/components/design-system/layout/page-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { cn } from "@/lib/utils"
import {
  Check,
  X,
  MessageCircle,
  Heart,
  Users,
  TrendingUp,
  Instagram,
  Youtube,
  ExternalLink,
  Star,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Send,
  Search,
} from "lucide-react"

interface ApplicationReviewProps {
  campaignId: string
}

export default function ApplicationReviewInterface({ campaignId }: ApplicationReviewProps) {
  const { language } = useApp()
  const t = useTranslation(language)

  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)

  // Mock applications data
  const applications = [
    {
      id: "1",
      influencer: {
        name: "Sarah Johnson",
        username: "@sarahjstyle",
        avatar: "/placeholder.svg?height=60&width=60",
        bio: "Fashion & lifestyle content creator passionate about sustainable fashion",
        followers: 25000,
        following: 1200,
        posts: 450,
        engagementRate: 7.2,
        avgLikes: 1800,
        avgComments: 120,
        verified: true,
        location: "Los Angeles, CA",
        joinedDate: "2022-03-15",
        categories: ["Fashion", "Lifestyle", "Beauty"],
        platforms: [
          { name: "Instagram", followers: 25000, handle: "@sarahjstyle" },
          { name: "TikTok", followers: 18000, handle: "@sarahjstyle" },
        ],
      },
      status: "pending",
      appliedDate: "2024-02-03T10:30:00Z",
      message:
        "I absolutely love your brand aesthetic and would be thrilled to create authentic content showcasing your summer pieces! My audience is primarily young women aged 18-28 who are passionate about fashion and sustainability. I have experience creating both static posts and video content, and I'm confident I can deliver high-quality content that aligns with your brand values.",
      proposedDeliverables: ["Instagram Post", "Instagram Story", "TikTok Video"],
      timeline: "Available to start immediately, can deliver within 5-7 days",
      portfolio: [
        {
          id: "1",
          type: "image",
          url: "/placeholder.svg?height=300&width=300",
          caption: "Summer outfit inspiration",
          likes: 2100,
          comments: 85,
          platform: "Instagram",
        },
        {
          id: "2",
          type: "image",
          url: "/placeholder.svg?height=300&width=300",
          caption: "Sustainable fashion haul",
          likes: 1850,
          comments: 92,
          platform: "Instagram",
        },
        {
          id: "3",
          type: "video",
          url: "/placeholder.svg?height=300&width=300",
          caption: "Get ready with me",
          likes: 3200,
          comments: 156,
          platform: "TikTok",
        },
      ],
      previousBrands: ["Zara", "H&M", "Sustainable Fashion Co"],
      rating: 4.8,
      completedCampaigns: 12,
    },
    {
      id: "2",
      influencer: {
        name: "Mike Chen",
        username: "@mikestyle",
        avatar: "/placeholder.svg?height=60&width=60",
        bio: "Men's fashion and lifestyle blogger. Minimalist aesthetic.",
        followers: 18000,
        following: 800,
        posts: 320,
        engagementRate: 8.1,
        avgLikes: 1450,
        avgComments: 95,
        verified: false,
        location: "New York, NY",
        joinedDate: "2021-08-20",
        categories: ["Fashion", "Lifestyle", "Minimalism"],
        platforms: [
          { name: "Instagram", followers: 18000, handle: "@mikestyle" },
          { name: "YouTube", followers: 5200, handle: "Mike Chen Style" },
        ],
      },
      status: "approved",
      appliedDate: "2024-02-02T14:15:00Z",
      message:
        "Your summer collection perfectly aligns with my minimalist aesthetic and content style. I specialize in creating clean, professional content that showcases products in authentic settings. My audience trusts my recommendations and I have a proven track record of driving engagement and conversions for fashion brands.",
      proposedDeliverables: ["Instagram Post", "YouTube Video"],
      timeline: "Can start next week, delivery within 10 days",
      portfolio: [
        {
          id: "4",
          type: "image",
          url: "/placeholder.svg?height=300&width=300",
          caption: "Minimalist summer wardrobe",
          likes: 1650,
          comments: 78,
          platform: "Instagram",
        },
        {
          id: "5",
          type: "video",
          url: "/placeholder.svg?height=300&width=300",
          caption: "Capsule wardrobe essentials",
          likes: 2800,
          comments: 124,
          platform: "YouTube",
        },
      ],
      previousBrands: ["Uniqlo", "Everlane", "COS"],
      rating: 4.9,
      completedCampaigns: 8,
    },
  ]

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.influencer.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleApplicationAction = async (applicationId: string, action: "approve" | "reject", feedback?: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(`${action} application ${applicationId}`, feedback ? `with feedback: ${feedback}` : "")
      setShowFeedbackDialog(false)
      setFeedbackMessage("")
      setActionType(null)
    } catch (error) {
      console.error("Error processing application:", error)
    }
  }

  const openFeedbackDialog = (action: "approve" | "reject") => {
    setActionType(action)
    setShowFeedbackDialog(true)
  }

  const renderInfluencerProfile = (application: (typeof applications)[0]) => {
    const { influencer } = application

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={influencer.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {influencer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{influencer.name}</h3>
              {influencer.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{influencer.username}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{influencer.bio}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{influencer.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(influencer.joinedDate).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Followers" value={influencer.followers.toLocaleString()} icon={Users} />
          <MetricCard title="Engagement Rate" value={`${influencer.engagementRate}%`} icon={TrendingUp} />
          <MetricCard title="Avg. Likes" value={influencer.avgLikes.toLocaleString()} icon={Heart} />
          <MetricCard title="Completed Campaigns" value={influencer.completedCampaigns} icon={CheckCircle} />
        </div>

        {/* Platforms */}
        <UniversalCard>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Platforms</h4>
            <div className="space-y-3">
              {influencer.platforms.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {platform.name === "Instagram" && <Instagram className="w-5 h-5 text-pink-600" />}
                    {platform.name === "YouTube" && <Youtube className="w-5 h-5 text-red-600" />}
                    {platform.name === "TikTok" && <MessageCircle className="w-5 h-5 text-black dark:text-white" />}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{platform.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{platform.handle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{platform.followers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">followers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UniversalCard>

        {/* Categories */}
        <UniversalCard>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Content Categories</h4>
            <div className="flex flex-wrap gap-2">
              {influencer.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </UniversalCard>

        {/* Previous Collaborations */}
        <UniversalCard>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Previous Brand Collaborations</h4>
            <div className="flex flex-wrap gap-2">
              {influencer.previousBrands.map((brand) => (
                <Badge key={brand} variant="outline">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        </UniversalCard>
      </div>
    )
  }

  const renderPortfolio = (application: (typeof applications)[0]) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">Content Portfolio</h4>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Profile
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {application.portfolio.map((item) => (
            <UniversalCard key={item.id} padding="none" className="overflow-hidden">
              <div className="relative group">
                <img src={item.url || "/placeholder.svg"} alt={item.caption} className="w-full h-48 object-cover" />
                {item.type === "video" && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-800 border-y-[6px] border-y-transparent ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.platform}
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">{item.caption}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{item.likes.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{item.comments}</span>
                  </span>
                </div>
              </div>
            </UniversalCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <PageLayout variant="default" background="gradient">
      <UniversalHeader
        variant="dashboard"
        showBack
        title="Application Review"
        subtitle="Review and manage campaign applications"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filter */}
            <UniversalCard padding="sm">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search influencers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  {["all", "pending", "approved", "rejected"].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </UniversalCard>

            {/* Applications */}
            <div className="space-y-3">
              {filteredApplications.map((application) => (
                <UniversalCard
                  key={application.id}
                  variant={selectedApplication === application.id ? "elevated" : "default"}
                  clickable
                  onClick={() => setSelectedApplication(application.id)}
                  className={cn(
                    "transition-all duration-200",
                    selectedApplication === application.id && "ring-2 ring-primary-500",
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={application.influencer.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {application.influencer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {application.influencer.name}
                          </h4>
                          {application.influencer.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{application.influencer.username}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{application.influencer.followers.toLocaleString()} followers</span>
                          <span>{application.influencer.engagementRate}% engagement</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : application.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className={cn(
                          "text-xs",
                          application.status === "approved" &&
                            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                          application.status === "pending" &&
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                          application.status === "rejected" &&
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                        )}
                      >
                        {application.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{application.message}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(application.appliedDate).toLocaleDateString()}</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current text-yellow-500" />
                        <span>{application.rating}</span>
                      </div>
                    </div>
                  </div>
                </UniversalCard>
              ))}
            </div>
          </div>

          {/* Application Detail */}
          <div className="lg:col-span-2">
            {selectedApplication ? (
              (() => {
                const application = applications.find((app) => app.id === selectedApplication)
                if (!application) return null

                return (
                  <div className="space-y-6">
                    {/* Action Header */}
                    <UniversalCard>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Application from {application.influencer.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Applied {new Date(application.appliedDate).toLocaleDateString()} • Rating:{" "}
                            {application.rating}/5 •{application.completedCampaigns} completed campaigns
                          </p>
                        </div>
                        {application.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => openFeedbackDialog("reject")}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => openFeedbackDialog("approve")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </UniversalCard>

                    {/* Application Message */}
                    <UniversalCard>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Application Message</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{application.message}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Proposed Deliverables
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {application.proposedDeliverables.map((deliverable) => (
                                <Badge key={deliverable} variant="secondary" className="text-xs">
                                  {deliverable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Timeline</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.timeline}</p>
                          </div>
                        </div>
                      </div>
                    </UniversalCard>

                    {/* Tabs for Profile and Portfolio */}
                    <Tabs defaultValue="profile">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Influencer Profile</TabsTrigger>
                        <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                      </TabsList>

                      <TabsContent value="profile" className="mt-6">
                        {renderInfluencerProfile(application)}
                      </TabsContent>

                      <TabsContent value="portfolio" className="mt-6">
                        {renderPortfolio(application)}
                      </TabsContent>
                    </Tabs>
                  </div>
                )
              })()
            ) : (
              <UniversalCard className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select an Application</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose an application from the list to review details
                  </p>
                </div>
              </UniversalCard>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Application" : "Reject Application"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {actionType === "approve" ? "Welcome message (optional)" : "Rejection reason (optional)"}
              </label>
              <Textarea
                placeholder={
                  actionType === "approve"
                    ? "Welcome to the campaign! We're excited to work with you..."
                    : "Thank you for your interest. Unfortunately..."
                }
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedApplication && handleApplicationAction(selectedApplication, actionType!, feedbackMessage)
                }
                className={cn(
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white",
                )}
              >
                <Send className="w-4 h-4 mr-2" />
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
