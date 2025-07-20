"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "./providers"

export default function HomePage() {
  const { isAuthenticated, user, isHydrated } = useApp()
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect without waiting for full hydration to improve performance
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        // Redirect to appropriate dashboard
        if (user.role === "brand") {
          router.push("/brand/dashboard")
        } else if (user.role === "influencer") {
          router.push("/influencer/dashboard")
        }
      } else {
        // Redirect to landing page
        router.push("/landing")
      }
    }, 100) // Small delay to prevent hydration issues

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  // Simplified loading state for better performance
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-white font-bold text-2xl">W</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Wonlink</h1>
        <p className="text-gray-600">Loading...</p>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  )
}
