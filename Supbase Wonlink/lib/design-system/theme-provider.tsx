"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useTheme as useNextTheme } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Safe hook that doesn't throw during SSR/static export
export function useTheme() {
  const { theme, setTheme, resolvedTheme, themes, systemTheme } = useNextTheme()
  return {
    theme,
    setTheme,
    resolvedTheme,
    themes,
    systemTheme,
  }
}
