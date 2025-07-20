"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { LanguageSelector } from "@/components/language-selector"
import { HydrationBoundary } from "@/components/hydration-boundary"

export default function LandingPage() {
  const { language, isHydrated } = useApp()
  const { t } = useTranslation(language)

  // Show static content during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Static Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Wonlink</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <Link href="/auth">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/onboarding">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Static Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              🚀 Get Started Today
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connect Brands with Influencers
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From launching influencer marketing campaigns for small brands to monetizing influencer reach - streamline and transparently manage every process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start for Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Loading indicator for rest of content */}
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    )
  }

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
            <HydrationBoundary fallback={<div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>} as="div">
              <LanguageSelector />
            </HydrationBoundary>
            <Link href="/auth">
              <Button variant="outline">
                <HydrationBoundary fallback="Login" as="span">
                  {t("login")}
                </HydrationBoundary>
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button>
                <HydrationBoundary fallback="Sign Up" as="span">
                  {t("signUp")}
                </HydrationBoundary>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 <HydrationBoundary fallback="Get Started Today" as="span">
              {t("getStartedToday")}
            </HydrationBoundary>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <HydrationBoundary fallback="Connect Brands with Influencers" as="span">
              {t("heroTitle")}
            </HydrationBoundary>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            <HydrationBoundary fallback="From launching influencer marketing campaigns for small brands to monetizing influencer reach - streamline and transparently manage every process.">
              {t("heroSubtitle")}
            </HydrationBoundary>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <HydrationBoundary fallback="Start for Free" as="span">
                  {t("startForFree")}
                </HydrationBoundary>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline">
              <HydrationBoundary fallback="Learn More" as="span">
                {t("learnMore")}
              </HydrationBoundary>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            <HydrationBoundary fallback="Key Features" as="span">
              {t("keyFeatures")}
            </HydrationBoundary>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  <HydrationBoundary fallback="Trust & Safety" as="span">
                    {t("trustAndSafety")}
                  </HydrationBoundary>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <HydrationBoundary fallback="Verified influencers and secure payment processing ensure trust and safety for all parties.">
                    {t("trustAndSafetyDesc")}
                  </HydrationBoundary>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  <HydrationBoundary fallback="Performance Analytics">
                    {t("performanceAnalytics")}
                  </HydrationBoundary>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <HydrationBoundary fallback="Track campaign performance with detailed analytics and insights.">
                    {t("performanceAnalyticsDesc")}
                  </HydrationBoundary>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  <HydrationBoundary fallback="Mobile First">
                    {t("mobileFirst")}
                  </HydrationBoundary>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <HydrationBoundary fallback="Mobile-optimized platform for seamless campaign management on the go.">
                    {t("mobileFirstDesc")}
                  </HydrationBoundary>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <HydrationBoundary fallback="Key Features">
              {t("keyFeatures")}
            </HydrationBoundary>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">
                <HydrationBoundary fallback="Active Influencers">
                  {t("activeInfluencers")}
                </HydrationBoundary>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">
                <HydrationBoundary fallback="Completed Campaigns">
                  {t("completedCampaigns")}
                </HydrationBoundary>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">
                <HydrationBoundary fallback="Satisfaction Rate">
                  {t("satisfactionRate")}
                </HydrationBoundary>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">
                <HydrationBoundary fallback="Support">
                  {t("support")}
                </HydrationBoundary>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            <HydrationBoundary fallback="Get Started Today">
              {t("getStartedToday")}
            </HydrationBoundary>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            <HydrationBoundary fallback="Join thousands of brands and influencers who trust Wonlink for their marketing campaigns.">
              {t("ctaDescription")}
            </HydrationBoundary>
          </p>
          <Link href="/onboarding">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <HydrationBoundary fallback="Start for Free">
                {t("startForFree")}
              </HydrationBoundary>
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
                <HydrationBoundary fallback="Connect Brands with Influencers">
                  {t("heroTitle")}
                </HydrationBoundary>
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">
                <HydrationBoundary fallback="Product">
                  {t("product")}
                </HydrationBoundary>
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li><HydrationBoundary fallback="Campaigns">{t("campaigns")}</HydrationBoundary></li>
                <li><HydrationBoundary fallback="Influencer Tools">{t("influencerTools")}</HydrationBoundary></li>
                <li><HydrationBoundary fallback="Analytics Dashboard">{t("analyticsDashboard")}</HydrationBoundary></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">
                <HydrationBoundary fallback="Support">
                  {t("support")}
                </HydrationBoundary>
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li><HydrationBoundary fallback="Help Center">{t("helpCenter")}</HydrationBoundary></li>
                <li><HydrationBoundary fallback="Contact Us">{t("contactUs")}</HydrationBoundary></li>
                <li><HydrationBoundary fallback="API">{t("api")}</HydrationBoundary></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">
                <HydrationBoundary fallback="Company">
                  {t("company")}
                </HydrationBoundary>
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li><HydrationBoundary fallback="About Us">{t("aboutUs")}</HydrationBoundary></li>
                <li><HydrationBoundary fallback="Careers">{t("careers")}</HydrationBoundary></li>
                <li><HydrationBoundary fallback="Blog">{t("blog")}</HydrationBoundary></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Wonlink. <HydrationBoundary fallback="All rights reserved.">{t("allRightsReserved")}</HydrationBoundary></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
