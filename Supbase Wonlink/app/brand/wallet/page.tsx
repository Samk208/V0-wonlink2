"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Download, Calendar, DollarSign } from "lucide-react"

export default function BrandWalletPage() {
  const { language, user } = useApp()
  const t = useTranslation(language)

  const walletStats = [
    {
      title: "Available Balance",
      value: "₩5,250,000",
      change: "-₩750,000",
      icon: Wallet,
      color: "text-green-600",
    },
    {
      title: "Pending Payments",
      value: "₩1,200,000",
      change: "3 campaigns",
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      title: "Total Spent",
      value: "₩12,450,000",
      change: "This month",
      icon: DollarSign,
      color: "text-blue-600",
    },
  ]

  const transactions = [
    {
      id: 1,
      type: "payment",
      description: "Payment to Sarah Kim - Summer Beauty Campaign",
      amount: "-₩500,000",
      date: "2024-01-15",
      status: "Completed",
      campaign: "Summer Beauty Campaign",
    },
    {
      id: 2,
      type: "deposit",
      description: "Wallet Top-up",
      amount: "+₩2,000,000",
      date: "2024-01-10",
      status: "Completed",
      campaign: null,
    },
    {
      id: 3,
      type: "payment",
      description: "Payment to Alex Park - Fashion Week Showcase",
      amount: "-₩750,000",
      date: "2024-01-08",
      status: "Completed",
      campaign: "Fashion Week Showcase",
    },
    {
      id: 4,
      type: "payment",
      description: "Payment to Kim Min-jun - Tech Product Review",
      amount: "-₩300,000",
      date: "2024-01-05",
      status: "Pending",
      campaign: "Tech Product Review",
    },
  ]

  const pendingPayments = [
    {
      id: 1,
      influencer: "Sarah Kim",
      campaign: "Summer Beauty Campaign",
      amount: "₩500,000",
      dueDate: "2024-02-01",
      status: "Due Soon",
    },
    {
      id: 2,
      influencer: "Alex Park",
      campaign: "Fashion Week Showcase",
      amount: "₩750,000",
      dueDate: "2024-02-05",
      status: "Scheduled",
    },
    {
      id: 3,
      influencer: "Kim Min-jun",
      campaign: "Tech Product Review",
      amount: "₩300,000",
      dueDate: "2024-02-10",
      status: "Scheduled",
    },
  ]

  const sidebarItems = [
    { label: "Dashboard", href: "/brand/dashboard" },
    { label: "Campaigns", href: "/brand/campaigns" },
    { label: "Find Influencers", href: "/brand/find" },
    { label: "Messages", href: "/brand/messages" },
    { label: "Analytics", href: "/brand/analytics" },
    { label: "Wallet", href: "/brand/wallet" },
    { label: "Profile", href: "/profile/brand" },
  ]

  return (
    <EnhancedDashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600 mt-2">Manage your payments and transactions</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
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
                      <p className="text-sm text-gray-500">{stat.change}</p>
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
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="pending">Pending Payments</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All your wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "payment" ? "bg-red-100" : "bg-green-100"
                          }`}
                        >
                          {transaction.type === "payment" ? (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                          {transaction.campaign && <p className="text-xs text-gray-500">{transaction.campaign}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.amount.startsWith("-") ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {transaction.amount}
                        </p>
                        <Badge variant={transaction.status === "Completed" ? "secondary" : "outline"} className="mt-1">
                          {transaction.status}
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
                <CardDescription>Upcoming payments to influencers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.influencer}</p>
                        <p className="text-sm text-gray-600">{payment.campaign}</p>
                        <p className="text-xs text-gray-500">Due: {payment.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{payment.amount}</p>
                        <Badge variant={payment.status === "Due Soon" ? "destructive" : "outline"} className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 1234</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Primary</Badge>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}
