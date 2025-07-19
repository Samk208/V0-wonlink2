"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import type { Language } from "@/lib/translations"
import type { User } from "@/components/navigation/types"

interface AppContextType {
  language: Language
  setLanguage: (language: Language) => void
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export function Providers({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ko")
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("wonlink-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
      }
    }

    const savedLanguage = localStorage.getItem("wonlink-language") as Language
    if (savedLanguage && (savedLanguage === "ko" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("wonlink-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("wonlink-user")
    }
  }, [user])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("wonlink-language", language)
  }, [language])

  const value = {
    language,
    setLanguage,
    user,
    setUser,
    isAuthenticated: !!user,
  }

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
      <Toaster />
    </AppContext.Provider>
  )
}
