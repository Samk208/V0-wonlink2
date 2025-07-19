"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { UniversalCard, MetricCard } from "@/components/design-system/cards/universal-card"
import { UniversalHeader } from "@/components/design-system/navigation/universal-header"
import { PageLayout } from "@/components/design-system/layout/page-layout"
import { CampaignsEmptyState } from "@/components/design-system/empty-states/universal-empty-state"
import { CampaignCardSkeleton } from "@/components/design-system/feedback/loading-states"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Pause,
  Play,
  Download,
  DollarSign,
  Users,
  TrendingUp,
  X,
} from "lucide-react"

export default function CampaignDashboard() {
  const { language, user } = useApp()
  const t = useTranslation(language)
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [budgetFilter, setBudgetFilter] = useState("all")
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Mock campaigns data
  const campaigns = [
    {
      id: "1",
      title: "Summer Fashion Collection Launch",
      brand: "StyleCo",
      reward: "$5,000",
      deadline: "2024-02-29",
      requirements: "Instagram 10K+ followers",
      status: "active" as const,
      applications: 45,
      approved: 12,
      budget: 5000,
      spent: 2800,
      reach: 125000,
      engagement: 8500,
      category: "Fashion",
      createdDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Tech Product Review Campaign",
      brand: "TechCorp",
      reward: "$3,000",
      deadline: "2024-03-15",
      requirements: "YouTube 5K+ subscribers",
      status: "draft" as const,
      applications: 0,
      approved: 0,
      budget: 3000,
      spent: 0,
      reach: 0,
      engagement: 0,
      category: "Technology",
      createdDate: "2024-02-01",
    },
    {
      id: "3",
      title: "Fitness Equipment Showcase",
      brand: "FitLife",
      reward: "$2,500",
      deadline: "2024-01-31",
      requirements: "TikTok 15K+ followers",
      status: "completed" as const,
      applications: 28,
      approved: 8,
      budget: 2500,
      spent: 2500,
      reach: 89000,
      engagement: 6200,
      category: "Fitness",
      createdDate: "2024-01-01",
    },
  ]

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesBudget =
      budgetFilter === "all" ||
      (budgetFilter === "low" && campaign.budget < 3000) ||
      (budgetFilter === "medium" && campaign.budget >= 3000 && campaign.budget < 5000) ||
      (budgetFilter === "high" && campaign.budget >= 5000)

    return matchesSearch && matchesStatus && matchesBudget
  })

  const totalMetrics = campaigns.reduce(
    (acc, campaign) => ({
      totalBudget: acc.totalBudget + campaign.budget,
      totalSpent: acc.totalSpent + campaign.spent,
      totalApplications: acc.totalApplications + campaign.applications,
      totalReach: acc.totalReach + campaign.reach,
    }),
    { totalBudget: 0, totalSpent: 0, totalApplications: 0, totalReach: 0 },
  )

  const handleCampaignSelect = (campaignId: string, selected: boolean) => {
    if (selected) {
      setSelectedCampaigns((prev) => [...prev, campaignId])
    } else {
      setSelectedCampaigns((prev) => prev.filter((id) => id !== campaignId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCampaigns(filteredCampaigns.map((c) => c.id))
    } else {
      setSelectedCampaigns([])
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on campaigns:`, selectedCampaigns)
    setSelectedCampaigns([])
  }

  const handleCreateCampaign = () => {
    router.push("/brand/campaigns/create")
  }

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/brand/campaigns/${campaignId}`)
  }

  if (campaigns.length === 0) {
    return (
      <PageLayout variant="default" background="gradient">
        <UniversalHeader variant="dashboard" title="Campaigns" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <CampaignsEmptyState userRole="brand" onCreateCampaign={handleCreateCampaign} />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout variant="default" background="gradient">
      <UniversalHeader
        variant="dashboard"
        title="Campaign Management"
        subtitle="Manage your influencer marketing campaigns"
        actions={[
          <Button
            key="create"
            onClick={handleCreateCampaign}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>,
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Analytics Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Budget"
            value={`$${totalMetrics.totalBudget.toLocaleString()}`}
            change="+12.5%"
            trend="up"
            icon={DollarSign}
          />
          <MetricCard
            title="Total Spent"
            value={`$${totalMetrics.totalSpent.toLocaleString()}`}
            change="+8.3%"
            trend="up"
            icon={TrendingUp}
          />
          <MetricCard
            title="Applications"
            value={totalMetrics.totalApplications}
            change="+15.2%"
            trend="up"
            icon={Users}
          />
          <MetricCard
            title="Total Reach"
            value={totalMetrics.totalReach.toLocaleString()}
            change="+22.1%"
            trend="up"
            icon={Eye}
          />
        </div>

        {/* Filter Bar */}
        <UniversalCard padding="sm">
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(showFilters && "bg-primary-50 border-primary-200 dark:bg-primary-900/20")}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(statusFilter !== "all" || budgetFilter !== "all" || dateFilter !== "all") && (
                    <Badge variant="secondary" className="ml-2 w-2 h-2 p-0 bg-primary-600" />
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Range</label>
                  <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Budgets</SelectItem>
                      <SelectItem value="low">Under $3,000</SelectItem>
                      <SelectItem value="medium">$3,000 - $5,000</SelectItem>
                      <SelectItem value="high">Over $5,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all")
                      setBudgetFilter("all")
                      setDateFilter("all")
                      setSearchQuery("")
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </UniversalCard>

        {/* Bulk Actions Bar */}
        {selectedCampaigns.length > 0 && (
          <UniversalCard variant="outlined" padding="sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("pause")}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("duplicate")}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("export")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCampaigns([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </UniversalCard>
        )}

        {/* Campaigns Grid */}
        <div className="space-y-4">
          {/* Select All Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="newest">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="budget-high">Highest Budget</SelectItem>
                  <SelectItem value="budget-low">Lowest Budget</SelectItem>
                  <SelectItem value="applications">Most Applications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Campaigns List */}
          {!loading && filteredCampaigns.length > 0 && (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <UniversalCard key={campaign.id} variant="interactive" hover>
                  <div className="space-y-4">
                    {/* Header with Selection */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedCampaigns.includes(campaign.id)}
                          onCheckedChange={(checked) => handleCampaignSelect(campaign.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3
                              className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 transition-colors"
                              onClick={() => handleCampaignClick(campaign.id)}
                            >
                              {campaign.title}
                            </h3>
                            <Badge
                              variant={
                                campaign.status === "active"
                                  ? "default"
                                  : campaign.status === "completed"
                                    ? "secondary"
                                    : "outline"
                              }
                              className={cn(
                                campaign.status === "active" &&
                                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                                campaign.status === "draft" &&
                                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                                campaign.status === "completed" &&
                                  "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
                              )}
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {campaign.brand} • {campaign.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Budget</p>
                        <p className="font-medium text-gray-900 dark:text-white">${campaign.budget.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${campaign.spent.toLocaleString()} spent
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Applications</p>
                        <p className="font-medium text-gray-900 dark:text-white">{campaign.applications}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{campaign.approved} approved</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Reach</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {campaign.reach > 0 ? campaign.reach.toLocaleString() : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Engagement</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {campaign.engagement > 0 ? campaign.engagement.toLocaleString() : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                        <p className="font-medium text-gray-900 dark:text-white">{campaign.deadline}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Budget Progress</span>
                        <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            campaign.status === "active" && "bg-primary-600",
                            campaign.status === "completed" && "bg-green-600",
                            campaign.status === "draft" && "bg-gray-400",
                          )}
                          style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleCampaignClick(campaign.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {campaign.status === "active" ? (
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                        ) : campaign.status === "draft" ? (
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Publish
                          </Button>
                        ) : null}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">Created {campaign.createdDate}</div>
                    </div>
                  </div>
                </UniversalCard>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredCampaigns.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No campaigns found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search terms or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setBudgetFilter("all")
                  setDateFilter("all")
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
