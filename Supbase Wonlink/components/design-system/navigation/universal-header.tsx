"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "@/components/language-selector"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { usePlatform } from "@/hooks/use-platform"
import { useTheme } from "@/lib/design-system/theme-provider"
import { Bell, User, LogOut, Settings, Wallet, ArrowLeft, Menu, Sun, Moon, Monitor } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface UniversalHeaderProps {
  variant?: "landing" | "dashboard" | "auth" | "minimal"
  transparent?: boolean
  showBack?: boolean
  title?: string
  subtitle?: string
  actions?: ReactNode[]
  className?: string
}

export function UniversalHeader({
  variant = "landing",
  transparent = false,
  showBack = false,
  title,
  subtitle,
  actions = [],
  className,
}: UniversalHeaderProps) {
  const { language, user, setUser, isAuthenticated } = useApp()
  const { t } = useTranslation(language)
  const platform = usePlatform()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
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
    router.push("/")
  }

  const handleBack = () => {
    router.back()
  }

  const baseUrl = user?.role === "brand" ? "/brand" : "/influencer"

  // Dynamic header styling based on context
  const headerClasses = cn(
    "sticky top-0 z-50 transition-all duration-300 border-b",
    {
      // Background variations
      "bg-transparent border-transparent": transparent && !isScrolled,
      "bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm": !transparent || isScrolled,
      "dark:bg-gray-900/95 dark:border-gray-800": resolvedTheme === "dark",

      // Platform-specific adjustments
      [`pt-[${platform.safeAreaTop}px]`]: platform.isNative,
    },
    className,
  )

  // Logo component with context awareness
  const Logo = () => (
    <Link href={isAuthenticated ? `${baseUrl}/dashboard` : "/"} className="flex items-center space-x-3 group">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
          <span className="text-white font-bold text-lg">W</span>
        </div>
        {platform.isNative && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
        )}
      </div>

      <div className="hidden sm:block">
        {title ? (
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{title}</span>
            {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400 -mt-0.5">{subtitle}</div>}
          </div>
        ) : (
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Wonlink
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
              {platform.isNative ? "Mobile App" : "Connect & Grow"}
            </div>
          </div>
        )}
      </div>
    </Link>
  )

  // Navigation items based on variant
  const NavigationItems = () => {
    if (variant === "dashboard" && isAuthenticated) {
      return (
        <nav className="hidden md:flex items-center space-x-1">
          <Link href={`${baseUrl}/dashboard`}>
            <Button
              variant={pathname === `${baseUrl}/dashboard` ? "default" : "ghost"}
              size="sm"
              className="transition-all duration-200"
            >
              {t("dashboard")}
            </Button>
          </Link>
          <Link href={`${baseUrl}/campaigns`}>
            <Button
              variant={pathname.includes("/campaigns") ? "default" : "ghost"}
              size="sm"
              className="transition-all duration-200"
            >
              {t("campaigns")}
            </Button>
          </Link>
          <Link href={`${baseUrl}/wallet`}>
            <Button
              variant={pathname.includes("/wallet") ? "default" : "ghost"}
              size="sm"
              className="transition-all duration-200"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {t("wallet")}
            </Button>
          </Link>
        </nav>
      )
    }
    return null
  }

  // User menu for authenticated users
  const UserMenu = () => {
    if (!isAuthenticated || !user) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline ml-2 font-medium">{user.name || "User"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <p className="font-medium text-gray-900 dark:text-white">{user.name || "User"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
          </div>

          <DropdownMenuItem asChild>
            <Link href={`${baseUrl}/profile`} className="flex items-center">
              <User className="w-4 h-4 mr-3" />
              {t("profile")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`${baseUrl}/wallet`} className="flex items-center">
              <Wallet className="w-4 h-4 mr-3" />
              {t("wallet")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`${baseUrl}/settings`} className="flex items-center">
              <Settings className="w-4 h-4 mr-3" />
              {t("settings")}
            </Link>
          </DropdownMenuItem>

          <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <div className="flex items-center space-x-1">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="w-8 h-8 p-0"
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="w-8 h-8 p-0"
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="w-8 h-8 p-0"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <LanguageSelector />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

          <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
            <LogOut className="w-4 h-4 mr-3" />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <Logo />
          </div>

          {/* Center Section - Page Title (Mobile) */}
          {title && (
            <div className="sm:hidden flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h1>
            </div>
          )}

          {/* Navigation */}
          <NavigationItems />

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Custom Actions */}
            {actions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}

            {/* Language Selector - Desktop */}
            {variant !== "minimal" && (
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
            )}

            {/* Notifications - Dashboard only */}
            {variant === "dashboard" && isAuthenticated && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* Theme Toggle - Landing */}
            {variant === "landing" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="hidden sm:flex"
              >
                {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <UserMenu />
            ) : variant !== "auth" && variant !== "minimal" ? (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    {t("getStarted")}
                  </Button>
                </Link>
              </div>
            ) : null}

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <LanguageSelector />
                </div>
                {!isAuthenticated && variant !== "auth" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/auth">{t("login")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth">{t("getStarted")}</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
