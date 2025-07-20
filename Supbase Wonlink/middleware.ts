import { NextRequest, NextResponse } from 'next/server'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_COOKIE } from '@/lib/language-utils'
import type { Language } from '@/lib/translations'

function getLanguageFromHeaders(request: NextRequest): Language {
  const acceptLanguage = request.headers.get('accept-language')
  if (!acceptLanguage) return DEFAULT_LANGUAGE

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=')
      return { code: code.split('-')[0].toLowerCase(), quality: parseFloat(q) }
    })
    .sort((a, b) => b.quality - a.quality)

  // Find first supported language
  for (const { code } of languages) {
    if (SUPPORTED_LANGUAGES.includes(code as Language)) {
      return code as Language
    }
  }

  return DEFAULT_LANGUAGE
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get current language preference from cookie
  let language: Language = request.cookies.get(LANGUAGE_COOKIE)?.value as Language || null
  
  // If no language cookie exists, detect from browser headers
  if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
    language = getLanguageFromHeaders(request)
    
    // Set the detected language as a cookie for future requests
    response.cookies.set(LANGUAGE_COOKIE, language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false // Allow client-side access
    })
  }

  // Add language to response headers for server components
  response.headers.set('x-language', language)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}