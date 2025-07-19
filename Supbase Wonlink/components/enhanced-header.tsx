"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "./language-selector"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { Bell, Menu, User, LogOut, Settings, Wallet, Home } from "lucide-react"
import Link from "next/link"

interface EnhancedHeaderProps {
  variant?: "landing" | "dashboard"
  transparent?: boolean
}

export function EnhancedHeader({ variant = "landing", transparent = false }: EnhancedHeaderProps) {
  const { language, user, setUser, isAuthenticated } = useApp()
  const t = useTranslation(language)
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

  const baseUrl = user?.role === "brand" ? "/brand" : "/influencer"

  const headerClasses = `
    sticky top-0 z-50 transition-all duration-300
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticated ? `${baseUrl}/dashboard` : "/"} className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 korean-gradient rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold text-gradient">Wonlink</span>
              <div className="text-xs text-gray-500 -mt-1">Connect & Grow</div>
            </div>
          </Link>

          {/* Navigation - Dashboard */}
          {variant === "dashboard" && isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link href={`${baseUrl}/dashboard`}>
                <Button variant="ghost" size="sm" className="korean-button">
                  <Home className="w-4 h-4 mr-2" />
                  {t.dashboard}
                </Button>
              </Link>
              <Link href={`${baseUrl}/campaigns`}>
                <Button variant="ghost" size="sm" className="korean-button">
                  {t.campaigns}
                </Button>
              </Link>
              <Link href={`${baseUrl}/wallet`}>
                <Button variant="ghost" size="sm" className="korean-button">
                  <Wallet className="w-4 h-4 mr-2" />
                  {t.wallet}
                </Button>
              </Link>
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Notifications - Dashboard only */}
            {variant === "dashboard" && isAuthenticated && (
              <Button variant="ghost" size="sm" className="relative korean-button">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* User Menu - Dashboard */}
            {variant === "dashboard" && isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="korean-button">
                    <div className="w-8 h-8 korean-gradient rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline ml-2">{user?.name || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 korean-card">
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/profile`} className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {t.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/settings`} className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      {t.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Landing Page Actions */
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="korean-button hidden sm:inline-flex">
                    {t.login}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="korean-button korean-gradient text-white hover:shadow-lg hover:scale-105"
                  >
                    {t.getStarted}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="sm" className="korean-button">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 korean-card">
                <div className="p-2">
                  <LanguageSelector />
                </div>
                {!isAuthenticated && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/auth">{t.login}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth">{t.getStarted}</Link>
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
