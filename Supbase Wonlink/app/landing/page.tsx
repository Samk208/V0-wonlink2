"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { LanguageSelector } from "@/components/language-selector"

export default function LandingPage() {
  const { language } = useApp()
  const { t } = useTranslation(language)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Wonlink</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <Link href="/auth">
              <Button variant="outline">{t("login")}</Button>
            </Link>
            <Link href="/onboarding">
              <Button>{t("signUp")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 {t("getStartedToday")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("heroSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {t("startForFree")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline">
              {t("learnMore")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t("keyFeatures")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{t("trustAndSafety")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("trustAndSafetyDesc")}</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{t("performanceAnalytics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("performanceAnalyticsDesc")}</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{t("mobileFirst")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("mobileFirstDesc")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("keyFeatures")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">{t("activeInfluencers")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">{t("completedCampaigns")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">{t("satisfactionRate")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">{t("support")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t("getStartedToday")}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t("ctaDescription")}
          </p>
          <Link href="/onboarding">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {t("startForFree")}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-xl font-bold">Wonlink</span>
              </div>
              <p className="text-gray-400">
                {t("heroTitle")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("product")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("campaigns")}</li>
                <li>{t("influencerTools")}</li>
                <li>{t("analyticsDashboard")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("support")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("helpCenter")}</li>
                <li>{t("contactUs")}</li>
                <li>{t("api")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("company")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("aboutUs")}</li>
                <li>{t("careers")}</li>
                <li>{t("blog")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Wonlink. {t("allRightsReserved")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
