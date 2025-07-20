"use client"

import { useApp } from "@/app/providers"
import { useEffect, useState } from "react"

export function LanguageDebug() {
  const { language, isHydrated } = useApp()
  const [clientLanguage, setClientLanguage] = useState<string>("")
  const [cookieLanguage, setCookieLanguage] = useState<string>("")
  const [localStorageLanguage, setLocalStorageLanguage] = useState<string>("")

  useEffect(() => {
    // Get client-side language from cookie
    const cookies = document.cookie.split(';')
    const languageCookie = cookies.find(cookie => 
      cookie.trim().startsWith('wonlink-language=')
    )
    if (languageCookie) {
      setCookieLanguage(languageCookie.split('=')[1])
    }

    // Check for localStorage migration (for backward compatibility)
    try {
      const savedLanguage = localStorage.getItem('wonlink-language')
      setLocalStorageLanguage(savedLanguage || 'none')
    } catch (error) {
      setLocalStorageLanguage('error')
    }

    setClientLanguage('loaded')
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Language Debug (Dev Only)</div>
      <div>Context Language: {language}</div>
      <div>Hydrated: {isHydrated ? 'Yes' : 'No'}</div>
      <div>Cookie: {cookieLanguage || 'none'}</div>
      <div>localStorage: {localStorageLanguage}</div>
      <div>Client Loaded: {clientLanguage}</div>
    </div>
  )
}
