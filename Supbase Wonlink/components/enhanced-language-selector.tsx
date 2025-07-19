"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApp } from "@/app/providers"
import { Globe, Check } from "lucide-react"

export function EnhancedLanguageSelector() {
  const { language, setLanguage } = useApp()

  const languages = [
    { code: "en" as const, name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "ko" as const, name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
    { code: "zh" as const, name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="korean-button flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 korean-card">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </div>
            </div>
            {language === lang.code && <Check className="w-4 h-4 text-purple-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
