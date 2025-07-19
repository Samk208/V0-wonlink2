"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EnhancedDashboardLayout } from "@/components/enhanced-dashboard-layout"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import {
  Settings,
  User,
  Shield,
  CreditCard,
  Globe,
  Smartphone,
  Bell,
  Lock,
  Trash2,
  Download,
  Upload,
} from "lucide-react"

export function ProfileSettings() {
  const { language } = useApp()
  const t = useTranslation(language)

  const [accountSettings, setAccountSettings] = useState({
    email: "user@example.com",
    phone: "+82-10-1234-5678",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true,
    dataSharing: false,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    campaignUpdates: true,
    messageNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
  })

  const [paymentInfo, setPaymentInfo] = useState({
    bankName: "KB Kookmin Bank",
    accountNumber: "****-**-****567",
    accountHolder: "John Doe",
    taxId: "123-45-67890",
  })

  const [languageSettings, setLanguageSettings] = useState({
    language: "en",
    timezone: "Asia/Seoul",
    dateFormat: "MM/DD/YYYY",
    currency: "KRW",
  })

  const [connectedApps] = useState([
    {
      name: "Instagram",
      connected: true,
      permissions: ["Read profile", "Post content"],
      lastSync: "2024-01-15",
    },
    {
      name: "TikTok",
      connected: true,
      permissions: ["Read profile", "Analytics"],
      lastSync: "2024-01-14",
    },
    {
      name: "YouTube",
      connected: false,
      permissions: [],
      lastSync: null,
    },
  ])

  return (
    <EnhancedDashboardLayout title="Settings">
      <div className="space-y-6">
        <Card className="korean-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account preferences and security</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="korean-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountSettings.email}
                      onChange={(e) => setAccountSettings((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={accountSettings.phone}
                      onChange={(e) => setAccountSettings((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <Button className="korean-button korean-gradient text-white">Update Information</Button>
                </CardContent>
              </Card>

              <Card className="korean-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={accountSettings.currentPassword}
                      onChange={(e) => setAccountSettings((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={accountSettings.newPassword}
                      onChange={(e) => setAccountSettings((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={accountSettings.confirmPassword}
                      onChange={(e) => setAccountSettings((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  <Button className="korean-button korean-gradient text-white">Change Password</Button>
                </CardContent>
              </Card>
            </div>

            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Language & Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={languageSettings.language}
                      onValueChange={(value) => setLanguageSettings((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={languageSettings.timezone}
                      onValueChange={(value) => setLanguageSettings((prev) => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Seoul">Seoul (UTC+9)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                        <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={languageSettings.dateFormat}
                      onValueChange={(value) => setLanguageSettings((prev) => ({ ...prev, dateFormat: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={languageSettings.currency}
                      onValueChange={(value) => setLanguageSettings((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KRW">KRW (₩)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy Controls
                </CardTitle>
                <CardDescription>Control who can see your information and how it's used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <p className="text-sm text-gray-600">Who can see your profile</p>
                  </div>
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) => setPrivacySettings((prev) => ({ ...prev, profileVisibility: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEmail">Show Email Address</Label>
                    <p className="text-sm text-gray-600">Display email on your public profile</p>
                  </div>
                  <Switch
                    id="showEmail"
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, showEmail: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showPhone">Show Phone Number</Label>
                    <p className="text-sm text-gray-600">Display phone number on your profile</p>
                  </div>
                  <Switch
                    id="showPhone"
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, showPhone: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowMessages">Allow Direct Messages</Label>
                    <p className="text-sm text-gray-600">Let others send you messages</p>
                  </div>
                  <Switch
                    id="allowMessages"
                    checked={privacySettings.allowMessages}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, allowMessages: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showOnlineStatus">Show Online Status</Label>
                    <p className="text-sm text-gray-600">Let others see when you're online</p>
                  </div>
                  <Switch
                    id="showOnlineStatus"
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({ ...prev, showOnlineStatus: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataSharing">Data Sharing</Label>
                    <p className="text-sm text-gray-600">Share analytics with platform partners</p>
                  </div>
                  <Switch
                    id="dataSharing"
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, dataSharing: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="text-red-600">Data Management</CardTitle>
                <CardDescription>Manage your personal data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Download Your Data</h4>
                    <p className="text-sm text-gray-600">Get a copy of all your data</p>
                  </div>
                  <Button variant="outline" className="korean-button bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="campaignUpdates">Campaign Updates</Label>
                    <p className="text-sm text-gray-600">Get notified about campaign status changes</p>
                  </div>
                  <Switch
                    id="campaignUpdates"
                    checked={notificationSettings.campaignUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, campaignUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messageNotifications">Message Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified about new messages</p>
                  </div>
                  <Switch
                    id="messageNotifications"
                    checked={notificationSettings.messageNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, messageNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, marketingEmails: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
                <CardDescription>Manage your payment and tax information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={paymentInfo.bankName}
                      onChange={(e) => setPaymentInfo((prev) => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={paymentInfo.accountNumber}
                      onChange={(e) => setPaymentInfo((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={paymentInfo.accountHolder}
                      onChange={(e) => setPaymentInfo((prev) => ({ ...prev, accountHolder: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={paymentInfo.taxId}
                      onChange={(e) => setPaymentInfo((prev) => ({ ...prev, taxId: e.target.value }))}
                    />
                  </div>
                </div>

                <Button className="korean-button korean-gradient text-white">Update Payment Info</Button>
              </CardContent>
            </Card>

            <Card className="korean-card">
              <CardHeader>
                <CardTitle>Tax Documents</CardTitle>
                <CardDescription>Upload and manage your tax documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload tax documents</p>
                  <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  <Button variant="outline" className="mt-4 korean-button bg-transparent">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="korean-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Connected Apps & Services
                </CardTitle>
                <CardDescription>Manage your connected social media accounts and integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedApps.map((app) => (
                    <div key={app.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="font-semibold text-sm">{app.name.substring(0, 2)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{app.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={app.connected ? "default" : "secondary"}>
                              {app.connected ? "Connected" : "Not Connected"}
                            </Badge>
                            {app.lastSync && <span className="text-xs text-gray-500">Last sync: {app.lastSync}</span>}
                          </div>
                          {app.permissions.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {app.permissions.map((permission) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {app.connected ? (
                          <>
                            <Button variant="outline" size="sm" className="korean-button bg-transparent">
                              Settings
                            </Button>
                            <Button variant="outline" size="sm" className="korean-button text-red-600 bg-transparent">
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="korean-button korean-gradient text-white">
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="korean-card">
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Manage API keys and third-party integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">API Key</h4>
                      <p className="text-sm text-gray-600">For third-party integrations</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                        wl_sk_****************************
                      </code>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="korean-button bg-transparent">
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm" className="korean-button bg-transparent">
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}
