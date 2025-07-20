"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Users, Building, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/translations"
import { LanguageSelector } from "@/components/language-selector"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<"brand" | "influencer" | null>(null)
  const router = useRouter()
  const { t } = useTranslation()

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      if (userType === "brand") {
        router.push("/brand/dashboard")
      } else {
        router.push("/influencer/dashboard")
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/auth" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("goBack")}
            </Link>
            <LanguageSelector />
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("accountSetup")}</h1>
            <p className="text-gray-600">{t("customizedExperience")}</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                {t("stepProgress").replace("{step}", step.toString()).replace("{total}", totalSteps.toString())}
              </span>
              <span>{t("percentComplete").replace("{percent}", Math.round(progress).toString())}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CardTitle className="text-xl mb-2">{t("userTypeQuestion")}</CardTitle>
                  <CardDescription>{t("userTypeDescription")}</CardDescription>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      userType === "brand" ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setUserType("brand")}
                  >
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-lg">{t("brandCompany")}</CardTitle>
                      <CardDescription>{t("brandDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>{t("brandFeature1")}</li>
                        <li>{t("brandFeature2")}</li>
                        <li>{t("brandFeature3")}</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      userType === "influencer" ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setUserType("influencer")}
                  >
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-lg">{t("influencerUser")}</CardTitle>
                      <CardDescription>{t("influencerDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>{t("influencerFeature1")}</li>
                        <li>{t("influencerFeature2")}</li>
                        <li>{t("influencerFeature3")}</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CardTitle className="text-xl mb-2">
                    {userType === "brand" ? t("brandInfo") : t("influencerInfo")}
                  </CardTitle>
                  <CardDescription>{t("enterBasicInfo")}</CardDescription>
                </div>

                <div className="space-y-4">
                  {userType === "brand" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("companyName")}</label>
                        <input type="text" className="w-full p-3 border rounded-lg" placeholder={t("companyNamePlaceholder")} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("website")}</label>
                        <input type="url" className="w-full p-3 border rounded-lg" placeholder={t("websitePlaceholder")} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("industry")}</label>
                        <select className="w-full p-3 border rounded-lg">
                          <option>{t("selectIndustry")}</option>
                          <option>{t("fashionBeauty")}</option>
                          <option>{t("foodBeverage")}</option>
                          <option>{t("techIT")}</option>
                          <option>{t("travelLeisure")}</option>
                          <option>{t("other")}</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("activityName")}</label>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-lg"
                          placeholder={t("activityNamePlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("mainPlatform")}</label>
                        <select className="w-full p-3 border rounded-lg">
                          <option>{t("selectMainPlatform")}</option>
                          <option>{t("instagram")}</option>
                          <option>{t("youtube")}</option>
                          <option>{t("tiktok")}</option>
                          <option>{t("blog")}</option>
                          <option>{t("other")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("followerCount")}</label>
                        <select className="w-full p-3 border rounded-lg">
                          <option>{t("selectFollowerCount")}</option>
                          <option>{t("followers1K10K")}</option>
                          <option>{t("followers10K100K")}</option>
                          <option>{t("followers100K1M")}</option>
                          <option>{t("followers1MPlus")}</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <div>
                  <CardTitle className="text-xl mb-2">{t("setupComplete")}</CardTitle>
                  <CardDescription>
                    {userType === "brand"
                      ? t("brandSetupSuccess")
                      : t("influencerSetupSuccess")}
                  </CardDescription>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{t("nextSteps")}</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {userType === "brand" ? (
                      <>
                        <li>{t("brandNextStep1" as any)}</li>
                        <li>{t("brandNextStep2" as any)}</li>
                        <li>{t("brandNextStep3" as any)}</li>
                      </>
                    ) : (
                      <>
                        <li>{t("influencerNextStep1" as any)}</li>
                        <li>{t("influencerNextStep2" as any)}</li>
                        <li>{t("influencerNextStep3" as any)}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                {t("previous" as any)}
              </Button>

              <Button
                onClick={handleNext}
                disabled={step === 1 && !userType}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {step === totalSteps ? t("getStarted" as any) : t("next" as any)}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
