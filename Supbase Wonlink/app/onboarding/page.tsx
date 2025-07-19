"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Users, Building, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<"brand" | "influencer" | null>(null)
  const router = useRouter()

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
          <Link href="/auth" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Link>

          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">계정 설정</h1>
            <p className="text-gray-600">몇 가지 질문으로 맞춤형 경험을 제공해드릴게요</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                단계 {step} / {totalSteps}
              </span>
              <span>{Math.round(progress)}% 완료</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CardTitle className="text-xl mb-2">어떤 유형의 사용자이신가요?</CardTitle>
                  <CardDescription>귀하의 역할에 맞는 최적의 경험을 제공하기 위해 선택해주세요</CardDescription>
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
                      <CardTitle className="text-lg">브랜드/기업</CardTitle>
                      <CardDescription>인플루언서와 협업하여 마케팅 캠페인을 진행하고 싶어요</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 캠페인 생성 및 관리</li>
                        <li>• 인플루언서 검색 및 매칭</li>
                        <li>• 성과 분석 및 리포트</li>
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
                      <CardTitle className="text-lg">인플루언서</CardTitle>
                      <CardDescription>브랜드와 협업하여 수익을 창출하고 싶어요</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 캠페인 참여 및 지원</li>
                        <li>• 수익 관리 및 정산</li>
                        <li>• 프로필 및 포트폴리오 관리</li>
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
                    {userType === "brand" ? "브랜드 정보" : "인플루언서 정보"}
                  </CardTitle>
                  <CardDescription>기본 정보를 입력해주세요</CardDescription>
                </div>

                <div className="space-y-4">
                  {userType === "brand" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">회사명</label>
                        <input type="text" className="w-full p-3 border rounded-lg" placeholder="회사명을 입력하세요" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">웹사이트</label>
                        <input type="url" className="w-full p-3 border rounded-lg" placeholder="https://example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">업종</label>
                        <select className="w-full p-3 border rounded-lg">
                          <option>업종을 선택하세요</option>
                          <option>패션/뷰티</option>
                          <option>식품/음료</option>
                          <option>기술/IT</option>
                          <option>여행/레저</option>
                          <option>기타</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">활동명</label>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-lg"
                          placeholder="인플루언서 활동명을 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">주요 플랫폼</label>
                        <select className="w-full p-3 border rounded-lg">
                          <option>주요 활동 플랫폼을 선택하세요</option>
                          <option>Instagram</option>
                          <option>YouTube</option>
                          <option>TikTok</option>
                          <option>Blog</option>
                          <option>기타</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">팔로워 수</label>
                        <select className="w-full p-3 border rounded-lg">
                          <option>팔로워 수를 선택하세요</option>
                          <option>1K - 10K</option>
                          <option>10K - 100K</option>
                          <option>100K - 1M</option>
                          <option>1M+</option>
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
                  <CardTitle className="text-xl mb-2">설정 완료!</CardTitle>
                  <CardDescription>
                    {userType === "brand"
                      ? "브랜드 계정이 성공적으로 설정되었습니다. 이제 캠페인을 시작할 수 있어요!"
                      : "인플루언서 계정이 성공적으로 설정되었습니다. 이제 캠페인에 참여할 수 있어요!"}
                  </CardDescription>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">다음 단계:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {userType === "brand" ? (
                      <>
                        <li>• 프로필을 완성하여 신뢰도를 높이세요</li>
                        <li>• 첫 번째 캠페인을 생성해보세요</li>
                        <li>• 적합한 인플루언서를 찾아보세요</li>
                      </>
                    ) : (
                      <>
                        <li>• 프로필과 포트폴리오를 완성하세요</li>
                        <li>• 관심 있는 캠페인을 찾아보세요</li>
                        <li>• 브랜드와의 협업을 시작하세요</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                이전
              </Button>

              <Button
                onClick={handleNext}
                disabled={step === 1 && !userType}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {step === totalSteps ? "시작하기" : "다음"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
