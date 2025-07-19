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
      title: "Total Earnings",
      value: "₩2,450,000",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Campaigns",
      value: "3",
      change: "+1",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Total Followers",
      value: "125K",
      change: "+2.3K",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Engagement Rate",
      value: "4.8%",
      change: "+0.3%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const recentCampaigns = [
    {
      id: 1,
      title: "Summer Beauty Collection",
      brand: "Glow Cosmetics",
      status: "Active",
      payment: "₩500,000",
      deadline: "2024-02-15",
      progress: 75,
    },
    {
      id: 2,
      title: "Fashion Week Showcase",
      brand: "Seoul Fashion",
      status: "Completed",
      payment: "₩750,000",
      deadline: "2024-01-30",
      progress: 100,
    },
    {
      id: 3,
      title: "Tech Product Review",
      brand: "TechKorea",
      status: "In Review",
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
    { label: "Dashboard", href: "/influencer/dashboard" },
    { label: "Browse Campaigns", href: "/influencer/campaigns" },
    { label: "My Applications", href: "/influencer/applications" },
    { label: "Portfolio", href: "/influencer/portfolio" },
    { label: "Earnings", href: "/influencer/wallet" },
    { label: "Profile", href: "/profile/influencer" },
  ]

  return (
    <EnhancedDashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Influencer"}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your campaigns today.</p>
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
                      <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
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
                  <CardTitle>Recent Campaigns</CardTitle>
                  <CardDescription>Your latest campaign activities</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/influencer/campaigns">
                    View All
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
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <Badge
                            variant={
                              campaign.status === "Active"
                                ? "default"
                                : campaign.status === "Completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{campaign.brand}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-green-600">{campaign.payment}</span>
                          <span className="text-gray-500">Due: {campaign.deadline}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
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
                <CardTitle>Social Media Stats</CardTitle>
                <CardDescription>Your platform performance</CardDescription>
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
                            <p className="text-sm text-gray-600">{social.followers} followers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{social.engagement}</p>
                          <p className="text-xs text-gray-500">engagement</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                  <Link href="/influencer/portfolio">
                    Update Portfolio
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/influencer/campaigns">Browse New Campaigns</Link>
                </Button>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/influencer/applications">View Applications</Link>
                </Button>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/influencer/wallet">Check Earnings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EnhancedDashboardLayout>
  )
}
