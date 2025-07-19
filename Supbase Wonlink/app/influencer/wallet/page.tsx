"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Download, Calendar, CreditCard } from "lucide-react"

export default function InfluencerWalletPage() {
  const { language, user } = useApp()
  const t = useTranslation(language)

  const walletStats = [
    {
      title: "Available Balance",
      value: "₩2,450,000",
      change: "+₩500,000",
      icon: Wallet,
      color: "text-green-600",
    },
    {
      title: "Pending Earnings",
      value: "₩800,000",
      change: "2 campaigns",
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      title: "Total Earned",
      value: "₩8,750,000",
      change: "This year",
      icon: TrendingUp,
      color: "text-blue-600",
    },
  ]

  const earnings = [
    {
      id: 1,
      type: "earning",
      description: "Summer Beauty Campaign - Glow Cosmetics",
      amount: "+₩500,000",
      date: "2024-01-15",
      status: "Completed",
      campaign: "Summer Beauty Campaign",
    },
    {
      id: 2,
      type: "withdrawal",
      description: "Bank Transfer",
      amount: "-₩1,000,000",
      date: "2024-01-10",
      status: "Completed",
      campaign: null,
    },
    {
      id: 3,
      type: "earning",
      description: "Fashion Week Showcase - Seoul Fashion",
      amount: "+₩750,000",
      date: "2024-01-08",
      status: "Completed",
      campaign: "Fashion Week Showcase",
    },
    {
      id: 4,
      type: "earning",
      description: "Tech Product Review - TechKorea",
      amount: "+₩300,000",
      date: "2024-01-05",
      status: "Pending",
      campaign: "Tech Product Review",
    },
  ]

  const pendingEarnings = [
    {
      id: 1,
      brand: "Glow Cosmetics",
      campaign: "Summer Beauty Campaign",
      amount: "₩500,000",
      dueDate: "2024-02-01",
      status: "Under Review",
    },
    {
      id: 2,
      brand: "Seoul Fashion",
      campaign: "Fashion Week Showcase",
      amount: "₩300,000",
      dueDate: "2024-02-05",
      status: "Approved",
    },
  ]

  const monthlyEarnings = [
    { month: "Jan", amount: 2450000 },
    { month: "Dec", amount: 1800000 },
    { month: "Nov", amount: 2100000 },
    { month: "Oct", amount: 1650000 },
    { month: "Sep", amount: 1900000 },
    { month: "Aug", amount: 2200000 },
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600 mt-2">Track your earnings and manage withdrawals</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {walletStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.color}`}>{stat.change}</p>
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

        {/* Main Content */}
        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="earnings">Earnings History</TabsTrigger>
            <TabsTrigger value="pending">Pending Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>All your earnings and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${earning.type === "earning" ? "bg-green-100" : "bg-blue-100"}`}
                        >
                          {earning.type === "earning" ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{earning.description}</p>
                          <p className="text-sm text-gray-600">{earning.date}</p>
                          {earning.campaign && <p className="text-xs text-gray-500">{earning.campaign}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            earning.amount.startsWith("+") ? "text-green-600" : "text-blue-600"
                          }`}
                        >
                          {earning.amount}
                        </p>
                        <Badge variant={earning.status === "Completed" ? "secondary" : "outline"} className="mt-1">
                          {earning.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Payments awaiting approval or processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingEarnings.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.brand}</p>
                        <p className="text-sm text-gray-600">{payment.campaign}</p>
                        <p className="text-xs text-gray-500">Expected: {payment.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{payment.amount}</p>
                        <Badge variant={payment.status === "Approved" ? "secondary" : "outline"} className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                  <CardDescription>Your earnings over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyEarnings.map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.month}</span>
                        <span className="font-semibold">₩{month.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Methods</CardTitle>
                  <CardDescription>Manage your payout methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-blue-100">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">KB Bank</p>
                          <p className="text-sm text-gray-600">•••• •••• •••• 1234</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Primary</Badge>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      Add Withdrawal Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}
