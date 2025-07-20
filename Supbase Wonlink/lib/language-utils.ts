import type { Language } from '@/lib/translations'

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ko', 'zh']
export const DEFAULT_LANGUAGE: Language = 'en'
export const LANGUAGE_COOKIE = 'wonlink-language'

export async function getServerLanguage(): Promise<Language> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const languageCookie = cookieStore.get(LANGUAGE_COOKIE)
    const language = languageCookie?.value as Language
    
    if (language && SUPPORTED_LANGUAGES.includes(language)) {
      return language
    }
  } catch (error) {
    // cookies() throws in client components or outside request context
    console.warn('Failed to read language from server cookies:', error)
  }
  
  return DEFAULT_LANGUAGE
}

// New function for static routes that can't use cookies()
export function getStaticLanguage(): Language {
  return DEFAULT_LANGUAGE
}

export function getClientLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }
  
  // Try to get from cookie first (SSR-safe)
  const cookies = document.cookie.split(';')
  const languageCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${LANGUAGE_COOKIE}=`)
  )
  
  if (languageCookie) {
    const language = languageCookie.split('=')[1] as Language
    if (SUPPORTED_LANGUAGES.includes(language)) {
      return language
    }
  }
  
  // Only fallback to localStorage if no cookie exists
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_COOKIE) as Language
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      // Migrate to cookie and return the language
      setLanguageCookie(savedLanguage)
      return savedLanguage
    }
  } catch (error) {
    console.warn('Failed to read from localStorage:', error)
  }
  
  return DEFAULT_LANGUAGE
}

export function setLanguageCookie(language: Language): void {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    console.warn(`Unsupported language: ${language}`)
    return
  }
  
  // Set cookie with proper attributes
  const cookieValue = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`
  document.cookie = cookieValue
  
  // Also update localStorage for backward compatibility
  try {
    localStorage.setItem(LANGUAGE_COOKIE, language)
  } catch (error) {
    console.warn('Failed to update localStorage:', error)
  }
}

// New function to check if we're in a browser environment
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

// New function to get language safely for SSR
export function getLanguageForSSR(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }
  
  return getClientLanguage()
}