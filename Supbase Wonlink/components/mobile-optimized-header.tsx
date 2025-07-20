"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "./language-selector"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { usePlatform } from "@/hooks/use-platform"
import { Bell, User, LogOut, Settings, Wallet, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MobileOptimizedHeaderProps {
  variant?: "landing" | "dashboard"
  transparent?: boolean
  showBack?: boolean
  title?: string
}

export function MobileOptimizedHeader({
  variant = "landing",
  transparent = false,
  showBack = false,
  title,
}: MobileOptimizedHeaderProps) {
  const { language, user, setUser, isAuthenticated } = useApp()
  const { t } = useTranslation(language)
  const platform = usePlatform()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    setUser(null)
    window.location.href = "/"
  }

  const handleBack = () => {
    router.back()
  }

  const baseUrl = user?.role === "brand" ? "/brand" : "/influencer"

  // Mobile-first header styling with safe area support
  const headerClasses = `
    sticky top-0 z-50 transition-all duration-300
    ${platform.isNative ? `pt-[${platform.safeAreaTop}px]` : ""}
    ${
      transparent && !isScrolled
        ? "bg-transparent"
        : isScrolled
          ? "glass-effect border-b border-white/20 shadow-lg"
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
    }
  `

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-3">
            {/* Back Button - Mobile */}
            {showBack && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="korean-button p-2 md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Logo */}
            <Link href={isAuthenticated ? `${baseUrl}/dashboard` : "/"} className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-9 h-9 korean-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                {platform.isNative && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Title or Logo Text */}
              <div className="hidden sm:block">
                {title ? (
                  <span className="text-lg font-bold text-gray-900">{title}</span>
                ) : (
                  <>
                    <span className="text-xl font-bold text-gradient">Wonlink</span>
                    <div className="text-xs text-gray-500 -mt-0.5">
                      {platform.isNative ? "Mobile App" : "Connect & Grow"}
                    </div>
                  </>
                )}
              </div>
            </Link>
          </div>

          {/* Center - Page Title (Mobile) */}
          {title && (
            <div className="sm:hidden">
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-32">{title}</h1>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Language Selector - Hidden on small mobile */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            {/* Notifications - Dashboard only */}
            {variant === "dashboard" && isAuthenticated && (
              <Button variant="ghost" size="sm" className="relative korean-button p-2">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* User Menu - Dashboard */}
            {variant === "dashboard" && isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="korean-button p-2">
                    <div className="w-8 h-8 korean-gradient rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 korean-card">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium">{user?.name || "User"}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/profile`} className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/wallet`} className="flex items-center">
                      <Wallet className="w-4 h-4 mr-2" />
                      {t("wallet")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/settings`} className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <div className="md:hidden p-2 border-t border-gray-100">
                    <LanguageSelector />
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Landing Page Actions */
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="korean-button hidden sm:inline-flex">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="korean-button korean-gradient text-white hover:shadow-lg hover:scale-105 px-4"
                  >
                    {t("getStarted")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
