"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"
import { LanguageDebug } from "@/components/language-debug"

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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{t.features.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.stats.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.stats.items.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {language === "ko" ? "지금 시작해보세요" : "Get Started Today"}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {language === "ko"
              ? "브랜드든 인플루언서든, Wonlink에서 새로운 기회를 만나보세요"
              : "Whether you're a brand or influencer, discover new opportunities with Wonlink"}
          </p>
          <Link href="/onboarding">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {language === "ko" ? "무료로 시작하기" : "Start Free"}
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
                {language === "ko"
                  ? "브랜드와 인플루언서를 연결하는 혁신적인 플랫폼"
                  : "Innovative platform connecting brands with influencers"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{language === "ko" ? "제품" : "Product"}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{language === "ko" ? "캠페인 관리" : "Campaign Management"}</li>
                <li>{language === "ko" ? "인플루언서 검색" : "Influencer Discovery"}</li>
                <li>{language === "ko" ? "분석 도구" : "Analytics"}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{language === "ko" ? "지원" : "Support"}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{language === "ko" ? "도움말" : "Help Center"}</li>
                <li>{language === "ko" ? "문의하기" : "Contact Us"}</li>
                <li>{language === "ko" ? "API 문서" : "API Docs"}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{language === "ko" ? "회사" : "Company"}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{language === "ko" ? "회사 소개" : "About"}</li>
                <li>{language === "ko" ? "채용" : "Careers"}</li>
                <li>{language === "ko" ? "개인정보처리방침" : "Privacy"}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Wonlink. {language === "ko" ? "모든 권리 보유." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
