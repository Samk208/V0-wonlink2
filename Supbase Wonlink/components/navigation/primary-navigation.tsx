"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, PlayIcon as Campaign, Users, BarChart3, Settings, Wallet, Bell, Search, Menu, X } from "lucide-react"
import type { NavigationItem } from "./types"

interface PrimaryNavigationProps {
  userRole?: "brand" | "influencer" | "admin"
  className?: string
}

export function PrimaryNavigation({ userRole = "brand", className = "" }: PrimaryNavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    }
    const IconComponent = icons[iconName as keyof typeof icons]
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Wonlink</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.icon && getIcon(item.icon)}
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && getIcon(item.icon)}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
