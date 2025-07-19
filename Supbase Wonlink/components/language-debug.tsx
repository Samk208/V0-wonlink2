"use client"

import { useApp } from "@/app/providers"
import { useTranslation } from "@/lib/translations"

export function LanguageDebug() {
  const { language, setLanguage } = useApp()
  const { t } = useTranslation(language)

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
      <div className="mb-2 font-bold">Language Debug Panel</div>
      <div>Current Language: <span className="text-yellow-300">{language}</span></div>
      <div>Welcome Text: <span className="text-green-300">{t("welcome")}</span></div>
      <div>Dashboard Text: <span className="text-green-300">{t("dashboard")}</span></div>
      <div>Loading Text: <span className="text-green-300">{t("loading")}</span></div>
      <div className="mt-3">
        <button 
          onClick={() => setLanguage("ko")} 
          className={`px-3 py-1 rounded mr-2 ${language === "ko" ? "bg-blue-600" : "bg-blue-500"}`}
        >
          한국어
        </button>
        <button 
          onClick={() => setLanguage("en")} 
          className={`px-3 py-1 rounded ${language === "en" ? "bg-green-600" : "bg-green-500"}`}
        >
          English
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        LocalStorage: {typeof window !== "undefined" ? localStorage.getItem("wonlink-language") : "N/A"}
      </div>
    </div>
  )
}
