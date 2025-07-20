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
  const { t } = useTranslation(language)

  const dashboardTabs = [
    { label: t("overview"), href: "/brand/dashboard", icon: BarChart3 },
    { label: t("activeCampaigns"), href: "/brand/dashboard/active", icon: Briefcase, badge: 3 },
    { label: t("applications"), href: "/brand/dashboard/applications", icon: Users, badge: 12 },
    { label: t("messages"), href: "/brand/dashboard/messages", icon: MessageCircle, badge: 2 },
  ]

  const campaignActions = [
    {
      label: t("edit"),
      icon: Edit,
      onClick: () => {
        // TODO: Implement edit campaign functionality
      },
    },
    {
      label: t("share"),
      icon: Share,
      onClick: () => {
        // TODO: Implement share campaign functionality
      },
    },
    {
      label: t("archive"),
      icon: Archive,
      onClick: () => {
        // TODO: Implement archive campaign functionality
      },
      variant: "secondary" as const,
    },
    {
      label: t("delete"),
      icon: Trash2,
      onClick: () => {
        // TODO: Implement delete campaign functionality
      },
      variant: "destructive" as const,
      separator: true,
    },
  ]

  const breadcrumbs = [{ label: t("dashboard"), href: "/brand/dashboard" }, { label: t("overview") }]

  return (
    <EnhancedDashboardLayout
      title={t("dashboard")}
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
            <CardTitle className="text-sm font-medium">{t("activeCampaigns")}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">{t("increaseFromLastMonth").replace("{value}", "1")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalApplications")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">{t("increaseFromLastWeek").replace("{value}", "12")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("campaignSpend")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">{t("percentageIncrease" as any).replace("{value}", "15")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("engagementRate")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">{t("percentageIncrease").replace("{value}", "8.2")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("activeCampaigns")}</CardTitle>
              <CardDescription>{t("manageOngoingCampaigns")}</CardDescription>
            </div>
            <Link href="/brand/campaigns/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {t("createCampaign")}
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
                      {t("summerBeautyCampaign")} {campaign}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("beautySkincare")} • 15 {t("applications")} • $500-1000 {t("budget")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {t("active")}
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
              <CardTitle>{t("recentApplications")}</CardTitle>
              <CardDescription>{t("reviewNewApplications")}</CardDescription>
            </div>
            <Link href="/brand/dashboard/applications">
              <Button variant="outline">{t("viewAll")}</Button>
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
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{t("sarahKim")}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("appliedTo")} {t("summerBeautyCampaign")} • 50K {t("followers")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {t("pending")}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {t("review")}
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
