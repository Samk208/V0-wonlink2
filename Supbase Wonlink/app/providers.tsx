"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import type { Language } from "@/lib/translations"
import { getClientLanguage, setLanguageCookie } from "@/lib/language-utils"

interface User {
  id: string
  name: string
  email: string
  role: "brand" | "influencer"
  avatar_url?: string
  verified?: boolean
}

interface AppContextType {
  language: Language
  setLanguage: (language: Language) => void
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  isHydrated: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

interface ProvidersProps {
  children: ReactNode
  initialLanguage?: Language
}

export function Providers({ children, initialLanguage = "en" }: ProvidersProps) {
  // Use the initialLanguage from server to prevent hydration mismatch
  const [language, setLanguageState] = useState<Language>(initialLanguage)
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize language from cookies after hydration (SSR-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clientLanguage = getClientLanguage()
      if (clientLanguage !== language) {
        setLanguageState(clientLanguage)
      }
      setIsHydrated(true)
    }
  }, [language])

  // Load user from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem("wonlink-user")
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error("Failed to parse saved user:", error)
        }
      }
    }
  }, [])

  // Save user to localStorage when it changes (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem("wonlink-user", JSON.stringify(user))
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem("wonlink-user")
    }
  }, [user])

  // Enhanced setLanguage function with cookie support
  const setLanguage = (newLanguage: Language) => {
    const supportedLanguages: Language[] = ['en', 'ko', 'zh']
    if (supportedLanguages.includes(newLanguage)) {
      setLanguageState(newLanguage)
      // Save to cookie for SSR persistence
      if (typeof window !== 'undefined') {
        setLanguageCookie(newLanguage)
      }
    }
  }

  const value = {
    language,
    setLanguage,
    user,
    setUser,
    isAuthenticated: !!user,
    isHydrated,
  }

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </AppContext.Provider>
  )
}
