"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UniversalCard, MetricCard } from "@/components/design-system/cards/universal-card"
import { UniversalHeader } from "@/components/design-system/navigation/universal-header"
import { PageLayout } from "@/components/design-system/layout/page-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Download, TrendingUp, Eye, Heart, MessageCircle, DollarSign, Target, BarChart3, RefreshCw } from "lucide-react"

interface CampaignAnalyticsProps {
  campaignId: string
}

export default function CampaignAnalyticsPage({ campaignId }: CampaignAnalyticsProps) {
  const { language } = useApp()
  const t = useTranslation(language)

  const [dateRange, setDateRange] = useState("30d")
  const [compareMode, setCompareMode] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("reach")

  // Mock analytics data
  const campaignData = {
    id: campaignId,
    title: "Summer Fashion Collection Launch",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-02-29",
    budget: 5000,
    spent: 3200,
  }

  const overviewMetrics = {
    totalReach: 245000,
    totalImpressions: 890000,
    totalEngagement: 18500,
    engagementRate: 7.2,
    clickThroughRate: 2.8,
    costPerEngagement: 0.17,
    roi: 285,
    conversions: 156,
    revenue: 14250,
  }

  const performanceData = [
    { date: "2024-02-01", reach: 8500, engagement: 612, impressions: 12400, clicks: 348 },
    { date: "2024-02-02", reach: 12300, engagement: 891, impressions: 18600, clicks: 521 },
    { date: "2024-02-03", reach: 15600, engagement: 1124, impressions: 23400, clicks: 656 },
    { date: "2024-02-04", reach: 11200, engagement: 806, impressions: 16800, clicks: 470 },
    { date: "2024-02-05", reach: 18900, engagement: 1361, impressions: 28350, clicks: 794 },
    { date: "2024-02-06", reach: 22100, engagement: 1593, impressions: 33150, clicks: 928 },
    { date: "2024-02-07", reach: 19800, engagement: 1426, impressions: 29700, clicks: 831 },
  ]

  const platformData = [
    { platform: "Instagram", reach: 145000, engagement: 12400, color: "#E1306C" },
    { platform: "TikTok", reach: 78000, engagement: 4200, color: "#000000" },
    { platform: "YouTube", reach: 22000, engagement: 1900, color: "#FF0000" },
  ]

  const influencerPerformance = [
    {
      id: "1",
      name: "Sarah Johnson",
      username: "@sarahjstyle",
      avatar: "/placeholder.svg?height=40&width=40",
      reach: 85000,
      engagement: 6800,
      engagementRate: 8.0,
      clicks: 1200,
      conversions: 45,
      revenue: 4500,
      status: "completed",
    },
    {
      id: "2",
      name: "Mike Chen",
      username: "@mikestyle",
      avatar: "/placeholder.svg?height=40&width=40",
      reach: 62000,
      engagement: 4200,
      engagementRate: 6.8,
      clicks: 890,
      conversions: 32,
      revenue: 3200,
      status: "active",
    },
    {
      id: "3",
      name: "Emma Wilson",
      username: "@emmastyle",
      avatar: "/placeholder.svg?height=40&width=40",
      reach: 98000,
      engagement: 7500,
      engagementRate: 7.7,
      clicks: 1450,
      conversions: 79,
      revenue: 6550,
      status: "completed",
    },
  ]

  const contentPerformance = [
    {
      id: "1",
      type: "Instagram Post",
      influencer: "Sarah Johnson",
      reach: 25000,
      engagement: 2100,
      engagementRate: 8.4,
      clicks: 420,
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "2",
      type: "TikTok Video",
      influencer: "Mike Chen",
      reach: 45000,
      engagement: 3200,
      engagementRate: 7.1,
      clicks: 680,
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "3",
      type: "Instagram Story",
      influencer: "Emma Wilson",
      reach: 18000,
      engagement: 1400,
      engagementRate: 7.8,
      clicks: 290,
      thumbnail: "/placeholder.svg?height=100&width=100",
    },
  ]

  const exportReport = () => {
    // Simulate report export
    console.log("Exporting analytics report...")
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reach"
          value={overviewMetrics.totalReach.toLocaleString()}
          change="+15.2%"
          trend="up"
          icon={Eye}
        />
        <MetricCard
          title="Engagement"
          value={overviewMetrics.totalEngagement.toLocaleString()}
          change="+12.8%"
          trend="up"
          icon={Heart}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${overviewMetrics.engagementRate}%`}
          change="+0.8%"
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard title="ROI" value={`${overviewMetrics.roi}%`} change="+45%" trend="up" icon={DollarSign} />
      </div>

      {/* Performance Chart */}
      <UniversalCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Over Time</h3>
            <div className="flex items-center space-x-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reach">Reach</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="impressions">Impressions</SelectItem>
                  <SelectItem value="clicks">Clicks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value.toLocaleString(), selectedMetric]}
                />
                <Area type="monotone" dataKey={selectedMetric} stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </UniversalCard>

      {/* Platform Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <UniversalCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="reach"
                    label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), "Reach"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </UniversalCard>

        <UniversalCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Performance</h3>
            <div className="space-y-3">
              {platformData.map((platform) => (
                <div
                  key={platform.platform}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: platform.color }} />
                    <span className="font-medium text-gray-900 dark:text-white">{platform.platform}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{platform.reach.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {platform.engagement.toLocaleString()} engagement
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UniversalCard>
      </div>
    </div>
  )

  const renderInfluencerTab = () => (
    <div className="space-y-6">
      {/* Influencer Performance Table */}
      <UniversalCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Influencer Performance</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Influencer</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Reach</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Engagement</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Conversions</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {influencerPerformance.map((influencer) => (
                  <tr
                    key={influencer.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={influencer.avatar || "/placeholder.svg"}
                          alt={influencer.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{influencer.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{influencer.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {influencer.reach.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {influencer.engagement.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {influencer.engagementRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {influencer.conversions}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      ${influencer.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          influencer.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {influencer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </UniversalCard>

      {/* Top Performing Content */}
      <UniversalCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Content</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentPerformance.map((content) => (
              <div key={content.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={content.thumbnail || "/placeholder.svg"}
                    alt={content.type}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{content.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{content.influencer}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Reach</p>
                    <p className="font-medium text-gray-900 dark:text-white">{content.reach.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Engagement</p>
                    <p className="font-medium text-gray-900 dark:text-white">{content.engagement.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Rate</p>
                    <p className="font-medium text-gray-900 dark:text-white">{content.engagementRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Clicks</p>
                    <p className="font-medium text-gray-900 dark:text-white">{content.clicks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </UniversalCard>
    </div>
  )

  const renderROITab = () => (
    <div className="space-y-6">
      {/* ROI Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard title="Total Investment" value={`$${campaignData.spent.toLocaleString()}`} icon={DollarSign} />
        <MetricCard
          title="Revenue Generated"
          value={`$${overviewMetrics.revenue.toLocaleString()}`}
          change="+28%"
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard
          title="Return on Investment"
          value={`${overviewMetrics.roi}%`}
          change="+45%"
          trend="up"
          icon={Target}
        />
      </div>

      {/* Cost Breakdown */}
      <UniversalCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Influencer Payments</span>
              <span className="font-medium text-gray-900 dark:text-white">$2,800 (87.5%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Platform Fees</span>
              <span className="font-medium text-gray-900 dark:text-white">$320 (10%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Additional Costs</span>
              <span className="font-medium text-gray-900 dark:text-white">$80 (2.5%)</span>
            </div>
          </div>
        </div>
      </UniversalCard>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricCard
          title="Cost Per Engagement"
          value={`$${overviewMetrics.costPerEngagement}`}
          change="-12%"
          trend="down"
          icon={Heart}
        />
        <MetricCard
          title="Cost Per Click"
          value={`$${(campaignData.spent / ((overviewMetrics.totalEngagement * overviewMetrics.clickThroughRate) / 100)).toFixed(2)}`}
          change="-8%"
          trend="down"
          icon={MessageCircle}
        />
      </div>
    </div>
  )

  return (
    <PageLayout variant="default" background="gradient">
      <UniversalHeader
        variant="dashboard"
        showBack
        title="Campaign Analytics"
        subtitle={campaignData.title}
        actions={[
          <Button key="refresh" variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>,
          <Button key="export" variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>,
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <UniversalCard padding="sm" className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Campaign Status:</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {campaignData.status}
              </span>
            </div>
          </div>
        </UniversalCard>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="influencers">Influencer Performance</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="influencers" className="mt-6">
            {renderInfluencerTab()}
          </TabsContent>

          <TabsContent value="roi" className="mt-6">
            {renderROITab()}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
