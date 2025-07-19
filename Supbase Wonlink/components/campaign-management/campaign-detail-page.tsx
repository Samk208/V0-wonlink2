"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UniversalCard, MetricCard } from "@/components/design-system/cards/universal-card"
import { UniversalHeader } from "@/components/design-system/navigation/universal-header"
import { PageLayout } from "@/components/design-system/layout/page-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { cn } from "@/lib/utils"
import {
  Calendar,
  DollarSign,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Edit,
  Pause,
  BarChart3,
  Clock,
  CheckCircle,
  Instagram,
  Target,
  TrendingUp,
  Download,
} from "lucide-react"

interface CampaignDetailProps {
  campaignId: string
}

export default function CampaignDetailPage({ campaignId }: CampaignDetailProps) {
  const { language } = useApp()
  const t = useTranslation(language)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock campaign data
  const campaign = {
    id: campaignId,
    title: "Summer Fashion Collection Launch",
    description:
      "Promote our new summer collection with authentic lifestyle content that showcases the versatility and style of our pieces.",
    brand: {
      name: "StyleCo",
      logo: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    status: "active",
    budget: 5000,
    spent: 2800,
    startDate: "2024-02-01",
    endDate: "2024-02-29",
    image: "/placeholder.svg?height=300&width=600",
    category: "Fashion",
    platforms: ["instagram", "tiktok"],
    deliverables: ["instagram-post", "instagram-story", "tiktok-video"],
    requirements: {
      minFollowers: "10K+",
      ageGroups: ["18-24", "25-34"],
      locations: ["United States", "Canada"],
    },
    metrics: {
      applications: 45,
      approved: 12,
      completed: 8,
      totalReach: 125000,
      totalEngagement: 8500,
      avgEngagementRate: 6.8,
    },
    timeline: [
      { date: "2024-01-15", event: "Campaign created", status: "completed" },
      { date: "2024-02-01", event: "Campaign launched", status: "completed" },
      { date: "2024-02-15", event: "Mid-campaign review", status: "upcoming" },
      { date: "2024-02-29", event: "Campaign ends", status: "upcoming" },
    ],
  }

  const applications = [
    {
      id: "1",
      influencer: {
        name: "Sarah Johnson",
        username: "@sarahjstyle",
        avatar: "/placeholder.svg?height=40&width=40",
        followers: 25000,
        engagementRate: 7.2,
        verified: true,
      },
      status: "pending",
      appliedDate: "2024-02-03",
      message:
        "I love your brand aesthetic and would be excited to create authentic content showcasing your summer pieces!",
      portfolio: [
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
      ],
    },
    {
      id: "2",
      influencer: {
        name: "Mike Chen",
        username: "@mikestyle",
        avatar: "/placeholder.svg?height=40&width=40",
        followers: 18000,
        engagementRate: 8.1,
        verified: false,
      },
      status: "approved",
      appliedDate: "2024-02-02",
      message:
        "Your summer collection aligns perfectly with my content style. I can create engaging TikTok videos and Instagram posts.",
      portfolio: ["/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200"],
    },
  ]

  const relatedCampaigns = [
    {
      id: "2",
      title: "Winter Accessories Campaign",
      status: "completed",
      applications: 32,
      budget: 3000,
    },
    {
      id: "3",
      title: "Spring Shoe Collection",
      status: "draft",
      applications: 0,
      budget: 4000,
    },
  ]

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Campaign Description */}
      <UniversalCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Description</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{campaign.description}</p>

          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-medium text-gray-900 dark:text-white">{campaign.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {campaign.startDate} - {campaign.endDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
              <p className="font-medium text-gray-900 dark:text-white">${campaign.budget.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </UniversalCard>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reach"
          value={campaign.metrics.totalReach.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={Eye}
        />
        <MetricCard
          title="Engagement"
          value={campaign.metrics.totalEngagement.toLocaleString()}
          change="+8.3%"
          trend="up"
          icon={Heart}
        />
        <MetricCard
          title="Avg. Engagement Rate"
          value={`${campaign.metrics.avgEngagementRate}%`}
          change="+2.1%"
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard
          title="Completed"
          value={`${campaign.metrics.completed}/${campaign.metrics.approved}`}
          icon={CheckCircle}
        />
      </div>

      {/* Recent Activity */}
      <UniversalCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { user: "Sarah Johnson", action: "submitted content for review", time: "2 hours ago" },
              { user: "Mike Chen", action: "posted Instagram story", time: "5 hours ago" },
              { user: "Emma Wilson", action: "applied to campaign", time: "1 day ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </UniversalCard>
    </div>
  )

  const renderRequirementsTab = () => (
    <div className="space-y-6">
      {/* Deliverables */}
      <UniversalCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Deliverables</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {campaign.deliverables.map((deliverable) => (
              <div key={deliverable} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Instagram className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {deliverable.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      </UniversalCard>

      {/* Audience Requirements */}
      <UniversalCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audience Requirements</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Followers</p>
              <p className="font-medium text-gray-900 dark:text-white">{campaign.requirements.minFollowers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Age Groups</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {campaign.requirements.ageGroups.map((age) => (
                  <Badge key={age} variant="secondary" className="text-xs">
                    {age}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Locations</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {campaign.requirements.locations.map((location) => (
                  <Badge key={location} variant="secondary" className="text-xs">
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </UniversalCard>

      {/* Content Guidelines */}
      <UniversalCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Guidelines</h3>
          <div className="prose dark:prose-invert max-w-none">
            <ul className="space-y-2">
              <li>Use natural lighting for all photos and videos</li>
              <li>Include brand hashtags: #StyleCoSummer #SummerVibes</li>
              <li>Tag @styleco_official in all posts</li>
              <li>Show products in authentic, lifestyle settings</li>
              <li>Maintain brand voice: casual, confident, and inclusive</li>
            </ul>
          </div>
        </div>
      </UniversalCard>
    </div>
  )

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      {/* Applications Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard title="Total Applications" value={campaign.metrics.applications} icon={Users} />
        <MetricCard
          title="Pending Review"
          value={campaign.metrics.applications - campaign.metrics.approved}
          icon={Clock}
        />
        <MetricCard title="Approved" value={campaign.metrics.approved} icon={CheckCircle} />
        <MetricCard title="Completed" value={campaign.metrics.completed} icon={Target} />
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <UniversalCard key={application.id} variant="interactive">
            <div className="space-y-4">
              {/* Influencer Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={application.influencer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {application.influencer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{application.influencer.name}</h4>
                      {application.influencer.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.influencer.username}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{application.influencer.followers.toLocaleString()} followers</span>
                      <span>{application.influencer.engagementRate}% engagement</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={application.status === "approved" ? "default" : "secondary"}
                    className={cn(
                      application.status === "approved" &&
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                      application.status === "pending" &&
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    )}
                  >
                    {application.status}
                  </Badge>
                </div>
              </div>

              {/* Application Message */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{application.message}</p>
              </div>

              {/* Portfolio Preview */}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Portfolio</p>
                <div className="flex space-x-2">
                  {application.portfolio.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Portfolio ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              {application.status === "pending" && (
                <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    Reject
                  </Button>
                  <Button size="sm" variant="ghost">
                    Message
                  </Button>
                </div>
              )}
            </div>
          </UniversalCard>
        ))}
      </div>
    </div>
  )

  return (
    <PageLayout variant="default" background="gradient">
      <UniversalHeader
        variant="dashboard"
        showBack
        title={campaign.title}
        actions={[
          <Button key="edit" variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>,
          <Button key="share" variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>,
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Section */}
            <UniversalCard padding="none" className="overflow-hidden">
              <div className="relative h-64 bg-gradient-to-r from-primary-600 to-secondary-600">
                <img
                  src={campaign.image || "/placeholder.svg"}
                  alt={campaign.title}
                  className="w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar className="w-10 h-10 border-2 border-white">
                      <AvatarImage src={campaign.brand.logo || "/placeholder.svg"} />
                      <AvatarFallback>{campaign.brand.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{campaign.brand.name}</span>
                        {campaign.brand.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-sm text-white/80">Verified Brand</p>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{campaign.title}</h1>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {campaign.startDate} - {campaign.endDate}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${campaign.budget.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </UniversalCard>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="applications">Applications ({campaign.metrics.applications})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                {renderOverviewTab()}
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                {renderRequirementsTab()}
              </TabsContent>

              <TabsContent value="applications" className="mt-6">
                {renderApplicationsTab()}
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400">Detailed analytics coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Status */}
            <UniversalCard>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Campaign Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Budget Used</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </UniversalCard>

            {/* Quick Actions */}
            <UniversalCard>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Campaign
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message All
                  </Button>
                </div>
              </div>
            </UniversalCard>

            {/* Campaign Timeline */}
            <UniversalCard>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Timeline</h3>
                <div className="space-y-3">
                  {campaign.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                          event.status === "completed" && "bg-green-500",
                          event.status === "upcoming" && "bg-gray-300 dark:bg-gray-600",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{event.event}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </UniversalCard>

            {/* Related Campaigns */}
            <UniversalCard>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Related Campaigns</h3>
                <div className="space-y-3">
                  {relatedCampaigns.map((related) => (
                    <div
                      key={related.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{related.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {related.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{related.applications} applications</span>
                        <span>${related.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </UniversalCard>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
