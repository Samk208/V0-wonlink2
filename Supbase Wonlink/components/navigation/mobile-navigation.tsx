"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, PlayIcon as Campaign, Users, BarChart3, Settings, Wallet, Menu, Plus, Bell, Search } from "lucide-react"
import type { NavigationItem } from "./types"

interface MobileNavigationProps {
  userRole?: "brand" | "influencer" | "admin"
  className?: string
}

export function MobileNavigation({ userRole = "brand", className = "" }: MobileNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const brandNavItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/brand/dashboard",
      icon: "Home",
    },
    {
      id: "campaigns",
      label: "Campaigns",
      href: "/brand/campaigns",
      icon: "Campaign",
      badge: "3",
    },
    {
      id: "influencers",
      label: "Influencers",
      href: "/brand/influencers",
      icon: "Users",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/brand/analytics",
      icon: "BarChart3",
    },
    {
      id: "wallet",
      label: "Wallet",
      href: "/brand/wallet",
      icon: "Wallet",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: "Settings",
    },
  ]

  const influencerNavItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/influencer/dashboard",
      icon: "Home",
    },
    {
      id: "campaigns",
      label: "Browse Campaigns",
      href: "/influencer/campaigns",
      icon: "Campaign",
    },
    {
      id: "applications",
      label: "My Applications",
      href: "/influencer/applications",
      icon: "Users",
      badge: "2",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/influencer/analytics",
      icon: "BarChart3",
    },
    {
      id: "wallet",
      label: "Earnings",
      href: "/influencer/wallet",
      icon: "Wallet",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: "Settings",
    },
  ]

  const navItems = userRole === "brand" ? brandNavItems : influencerNavItems

  const getIcon = (iconName: string) => {
    const icons = {
      Home: Home,
      Campaign: Campaign,
      Users: Users,
      BarChart3: BarChart3,
      Settings: Settings,
      Wallet: Wallet,
      Bell: Bell,
      Search: Search,
      Plus: Plus,
    }
    const IconComponent = icons[iconName as keyof typeof icons]
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className={`md:hidden ${className}`}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Wonlink</span>
              </Link>
            </div>

            {/* Quick Actions */}
            {userRole === "brand" && (
              <div className="p-6 border-b border-gray-200">
                <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                  <Link href="/brand/campaigns/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </div>
            )}

            {/* Navigation */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && getIcon(item.icon)}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
                  </Link>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">© 2024 Wonlink. All rights reserved.</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
