"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  variant?: "default" | "centered" | "sidebar" | "split"
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
  background?: "default" | "gray" | "gradient"
  className?: string
}

export function PageLayout({
  children,
  variant = "default",
  maxWidth = "2xl",
  padding = "md",
  background = "default",
  className,
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-7xl",
    full: "max-w-none",
  }

  const paddingClasses = {
    none: "",
    sm: "px-4 py-4",
    md: "px-4 py-6 md:px-6 md:py-8",
    lg: "px-6 py-8 md:px-8 md:py-12",
  }

  const backgroundClasses = {
    default: "bg-background",
    gray: "bg-gray-50 dark:bg-gray-900",
    gradient:
      "bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900",
  }

  const variantClasses = {
    default: "min-h-screen",
    centered: "min-h-screen flex items-center justify-center",
    sidebar: "min-h-screen flex",
    split: "min-h-screen grid lg:grid-cols-2",
  }

  return (
    <div className={cn(variantClasses[variant], backgroundClasses[background], className)}>
      <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth], paddingClasses[padding])}>{children}</div>
    </div>
  )
}
