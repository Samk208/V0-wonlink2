"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { auth, type AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: { name: string; role: "brand" | "influencer" }) => Promise<void>
  signInWithOAuth: (provider: "google" | "kakao") => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    auth
      .getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))

    // Listen for auth changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange(setUser)

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await auth.signIn(email, password)
  }

  const signUp = async (email: string, password: string, userData: { name: string; role: "brand" | "influencer" }) => {
    await auth.signUp(email, password, userData)
  }

  const signInWithOAuth = async (provider: "google" | "kakao") => {
    await auth.signInWithOAuth(provider)
  }

  const signOut = async () => {
    await auth.signOut()
  }

  const updateProfile = async (updates: any) => {
    await auth.updateProfile(updates)
    // Refresh user data
    const updatedUser = await auth.getCurrentUser()
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
