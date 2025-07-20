"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  ArrowRight,
  Instagram,
  Youtube,
  TwitterIcon as TikTok,
  Twitter,
} from "lucide-react"
import Link from "next/link"

export default function InfluencerDashboard() {
  const { language, user } = useApp()
  const t = useTranslation(language)

  const stats = [
    {
      title: t.t("totalEarnings" as any),
      value: "₩2,450,000",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: t.t("activeCampaigns" as any),
      value: "3",
      change: "+1",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: t.t("totalFollowers" as any),
      value: "125K",
      change: "+2.3K",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: t.t("engagementRate" as any),
      value: "4.8%",
      change: "+0.3%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const recentCampaigns = [
    {
      id: 1,
      titleKey: "summerBeautyCollection",
      brandKey: "glowCosmetics",
      statusKey: "active",
      payment: "₩500,000",
      deadline: "2024-02-15",
      progress: 75,
    },
    {
      id: 2,
      titleKey: "fashionWeekShowcase",
      brandKey: "seoulFashion",
      statusKey: "completed",
      payment: "₩750,000",
      deadline: "2024-01-30",
      progress: 100,
    },
    {
      id: 3,
      titleKey: "techProductReview",
      brandKey: "techKorea",
      statusKey: "inReview",
      payment: "₩300,000",
      deadline: "2024-02-20",
      progress: 50,
    },
  ]

  const socialStats = [
    { platform: "Instagram", followers: "85K", engagement: "5.2%", icon: Instagram, color: "text-pink-600" },
    { platform: "YouTube", followers: "25K", engagement: "4.1%", icon: Youtube, color: "text-red-600" },
    { platform: "TikTok", followers: "15K", engagement: "6.8%", icon: TikTok, color: "text-black" },
    { platform: "Twitter", followers: "8K", engagement: "3.5%", icon: Twitter, color: "text-blue-600" },
  ]

  const sidebarItems = [
    { label: t.t("dashboard"), href: "/influencer/dashboard" },
    { label: t.t("browseCampaigns" as any), href: "/influencer/campaigns" },
    { label: t.t("myApplications"), href: "/influencer/applications" },
    { label: t.t("portfolio"), href: "/influencer/portfolio" },
    { label: t.t("earnings"), href: "/influencer/wallet" },
    { label: t.t("profile"), href: "/profile/influencer" },
  ]

  return (
    <EnhancedDashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.t("welcomeBack" as any)}, {user?.name || "Influencer"}!</h1>
          <p className="text-gray-600 mt-2">{t.t("hereIsWhatsHappening" as any)}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.color}`}>{stat.change} {t.t("fromLastMonth" as any)}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Campaigns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t.t("recentCampaigns" as any)}</CardTitle>
                  <CardDescription>{t.t("latestCampaignActivities" as any)}</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/influencer/campaigns">
                    {t.t("viewAll" as any)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{t.t(campaign.titleKey as any)}</h3>
                          <Badge
                            variant={
                              campaign.statusKey === "active"
                                ? "default"
                                : campaign.statusKey === "completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {t.t(campaign.statusKey as any)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{t.t(campaign.brandKey as any)}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-green-600">{campaign.payment}</span>
                          <span className="text-gray-500">{t.t("due" as any)}: {campaign.deadline}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{t.t("progress" as any)}</span>
                            <span>{campaign.progress}%</span>
                          </div>
                          <Progress value={campaign.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t.t("socialMediaStats" as any)}</CardTitle>
                <CardDescription>{t.t("platformPerformance" as any)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialStats.map((social) => {
                    const Icon = social.icon
                    return (
                      <div key={social.platform} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${social.color}`} />
                          <div>
                            <p className="font-medium">{social.platform}</p>
                            <p className="text-sm text-gray-600">{social.followers} {t.t("followers" as any)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{social.engagement}</p>
                          <p className="text-xs text-gray-500">{t.t("engagement" as any)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                  <Link href="/influencer/portfolio">
                    {t.t("updatePortfolio" as any)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t.t("quickActions" as any)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/influencer/campaigns">{t.t("browseNewCampaigns" as any)}</Link>
                </Button>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/influencer/applications">{t.t("viewApplications" as any)}</Link>
                </Button>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/influencer/wallet">{t.t("checkEarnings" as any)}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EnhancedDashboardLayout>
  )
}
