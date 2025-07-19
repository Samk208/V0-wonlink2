"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "./providers"
import { useTranslation } from "@/lib/translations"
import { redirect } from "next/navigation"

export default function HomePage() {
  const { isAuthenticated, user, language } = useApp()
  const t = useTranslation(language)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard
      if (user.role === "brand") {
        router.push("/brand/dashboard")
      } else if (user.role === "influencer") {
        router.push("/influencer/dashboard")
      }
    } else {
      // Redirect to landing page
      redirect("/landing")
    }
  }, [isAuthenticated, user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center fade-in">
        <div className="w-20 h-20 korean-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-white font-bold text-2xl">W</span>
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Wonlink</h1>
        <p className="text-gray-600">{t.loading}</p>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  )
}
