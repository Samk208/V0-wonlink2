"use client"

import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { TabNavigation } from "@/components/navigation/tab-navigation"
import { GlobalSearch } from "@/components/navigation/global-search"
import { NotificationSystem } from "@/components/navigation/notification-system"
import { ContextualActions } from "@/components/navigation/contextual-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  Plus,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Edit,
  Share,
  Archive,
  Trash2,
  BarChart3,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

export default function BrandDashboard() {
  const { language, user } = useApp()
  const t = useTranslation(language)

  const dashboardTabs = [
    { label: "Overview", href: "/brand/dashboard", icon: BarChart3 },
    { label: "Active Campaigns", href: "/brand/dashboard/active", icon: Briefcase, badge: 3 },
    { label: "Applications", href: "/brand/dashboard/applications", icon: Users, badge: 12 },
    { label: "Messages", href: "/brand/dashboard/messages", icon: MessageCircle, badge: 2 },
  ]

  const campaignActions = [
    {
      label: "Edit",
      icon: Edit,
      onClick: () => console.log("Edit campaign"),
    },
    {
      label: "Share",
      icon: Share,
      onClick: () => console.log("Share campaign"),
    },
    {
      label: "Archive",
      icon: Archive,
      onClick: () => console.log("Archive campaign"),
      variant: "secondary" as const,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => console.log("Delete campaign"),
      variant: "destructive" as const,
      separator: true,
    },
  ]

  const breadcrumbs = [{ label: "Dashboard", href: "/brand/dashboard" }, { label: "Overview" }]

  return (
    <EnhancedDashboardLayout
      title="Brand Dashboard"
      breadcrumbs={breadcrumbs}
      actions={[
        <GlobalSearch key="search" placeholder="Search campaigns, influencers..." />,
        <NotificationSystem key="notifications" />,
      ]}
    >
      {/* Tab Navigation */}
      <div className="mb-6">
        <TabNavigation tabs={dashboardTabs} variant="underline" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">+0.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Manage your ongoing influencer campaigns</CardDescription>
            </div>
            <Link href="/brand/campaigns/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((campaign) => (
              <div
                key={campaign}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Summer Beauty Campaign {campaign}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Beauty & Skincare • 15 applications • $500-1000 budget
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                  <ContextualActions actions={campaignActions} variant="dropdown" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Review new influencer applications</CardDescription>
            </div>
            <Link href="/brand/dashboard/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((application) => (
              <div
                key={application}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Sarah Kim</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Applied to Summer Beauty Campaign • 50K followers
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending
                  </Badge>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </EnhancedDashboardLayout>
  )
}
