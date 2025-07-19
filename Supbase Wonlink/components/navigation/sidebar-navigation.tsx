"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  PlayIcon as Campaign,
  Users,
  BarChart3,
  Settings,
  Wallet,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"
import type { NavigationItem } from "./types"

interface SidebarNavigationProps {
  userRole?: "brand" | "influencer" | "admin"
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function SidebarNavigation({
  userRole = "brand",
  isCollapsed = false,
  onToggleCollapse,
  className = "",
}: SidebarNavigationProps) {
  const pathname = usePathname()

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
      children: [
        {
          id: "create-campaign",
          label: "Create Campaign",
          href: "/brand/campaigns/create",
        },
        {
          id: "active-campaigns",
          label: "Active Campaigns",
          href: "/brand/campaigns/active",
        },
        {
          id: "draft-campaigns",
          label: "Drafts",
          href: "/brand/campaigns/drafts",
        },
      ],
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
    <div
      className={`bg-white border-r border-gray-200 h-full flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Wonlink</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">W</span>
            </div>
          )}
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse} className={isCollapsed ? "mx-auto mt-2" : ""}>
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && userRole === "brand" && (
        <div className="p-4 border-b border-gray-200">
          <Button asChild className="w-full">
            <Link href="/brand/campaigns/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {navItems.map((item) => (
            <div key={item.id} className="mb-1">
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon && getIcon(item.icon)}
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>

              {/* Sub-navigation */}
              {!isCollapsed && item.children && isActive(item.href) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className={`block px-3 py-1 text-sm rounded-md transition-colors ${
                        isActive(child.href)
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/settings"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive("/settings")
              ? "text-primary-600 bg-primary-50"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>
    </div>
  )
}
