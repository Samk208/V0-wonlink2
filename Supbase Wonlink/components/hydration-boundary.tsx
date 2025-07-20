"use client"

import { useState, useEffect, type ReactNode } from "react"

interface HydrationBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  suppressHydrationWarning?: boolean
  as?: 'div' | 'span' | 'fragment'
}

export function HydrationBoundary({ 
  children, 
  fallback = null,
  suppressHydrationWarning = false,
  as = 'fragment'
}: HydrationBoundaryProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    if (as === 'span') {
      return <span suppressHydrationWarning={suppressHydrationWarning}>{fallback}</span>
    } else if (as === 'div') {
      return <div suppressHydrationWarning={suppressHydrationWarning}>{fallback}</div>
    } else {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <HydrationBoundary fallback={fallback}>
      {children}
    </HydrationBoundary>
  )
}

// Specific component for language-sensitive content
export function LanguageHydrationBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode 
  fallback?: ReactNode 
}) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <div suppressHydrationWarning>{fallback}</div>
  }

  return <>{children}</>
}