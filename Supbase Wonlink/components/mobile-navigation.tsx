"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { usePlatform } from "@/hooks/use-platform"
import { Home, Search, Plus, Bell, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNavigation() {
  const { language, user, isAuthenticated } = useApp()
  const { t } = useTranslation(language)
  const platform = usePlatform()
  const pathname = usePathname()

  if (!isAuthenticated || !user) return null

  const baseUrl = user.role === "brand" ? "/brand" : "/influencer"

  const navItems = [
    {
      icon: Home,
      label: t("dashboard"),
      href: `${baseUrl}/dashboard`,
      active: pathname === `${baseUrl}/dashboard`,
    },
    {
      icon: Search,
      label: t("campaigns"),
      href: `${baseUrl}/campaigns`,
      active: pathname.includes("/campaigns"),
    },
    {
      icon: Plus,
      label: user.role === "brand" ? t("createCampaign") : t("apply"),
      href: user.role === "brand" ? `${baseUrl}/campaigns/create` : `${baseUrl}/campaigns/browse`,
      active: false,
      primary: true,
    },
    {
      icon: Bell,
      label: "Notifications",
      href: `${baseUrl}/notifications`,
      active: pathname.includes("/notifications"),
      badge: 3,
    },
    {
      icon: User,
      label: t("profile"),
      href: `${baseUrl}/profile`,
      active: pathname.includes("/profile"),
    },
  ]

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 
        ${platform.isNative ? `pb-[${platform.safeAreaBottom}px]` : "pb-2"}
        md:hidden
      `}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {navItems.map((item, index) => (
          <Link key={index} href={item.href} className="flex-1">
            <Button
              variant={item.active ? "default" : "ghost"}
              size="sm"
              className={`
                w-full flex flex-col items-center space-y-1 h-auto py-2 px-1 relative
                ${item.primary ? "korean-gradient text-white rounded-full w-12 h-12 mx-auto" : "korean-button"}
                ${item.active && !item.primary ? "bg-purple-50 text-purple-600" : ""}
              `}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${item.primary ? "w-6 h-6" : ""}`} />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 flex items-center justify-center bg-red-500 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {!item.primary && <span className="text-xs font-medium truncate max-w-full">{item.label}</span>}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}
