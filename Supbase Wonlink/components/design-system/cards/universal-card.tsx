"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface UniversalCardProps {
  children: ReactNode
  variant?: "default" | "elevated" | "outlined" | "filled" | "interactive"
  size?: "sm" | "md" | "lg" | "xl"
  padding?: "none" | "sm" | "md" | "lg"
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full"
  hover?: boolean
  clickable?: boolean
  loading?: boolean
  className?: string
  onClick?: () => void
}

export function UniversalCard({
  children,
  variant = "default",
  size = "md",
  padding = "md",
  radius = "lg",
  hover = false,
  clickable = false,
  loading = false,
  className,
  onClick,
}: UniversalCardProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-200"

  const variantClasses = {
    default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700",
    outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
    filled: "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
    interactive:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600",
  }

  const sizeClasses = {
    sm: "min-h-[4rem]",
    md: "min-h-[6rem]",
    lg: "min-h-[8rem]",
    xl: "min-h-[12rem]",
  }

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  }

  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }

  const interactiveClasses = cn({
    "cursor-pointer": clickable || onClick,
    "hover:shadow-lg hover:scale-[1.02]": hover,
    "active:scale-[0.98]": clickable || onClick,
  })

  const loadingOverlay = loading && (
    <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        paddingClasses[padding],
        radiusClasses[radius],
        interactiveClasses,
        className,
      )}
      onClick={onClick}
      role={clickable || onClick ? "button" : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
    >
      {loadingOverlay}
      {children}
    </div>
  )
}

// Specialized card components
export function CampaignCard({
  title,
  brand,
  reward,
  deadline,
  requirements,
  status,
  onClick,
  className,
}: {
  title: string
  brand: string
  reward: string
  deadline: string
  requirements: string
  status: "active" | "draft" | "completed"
  onClick?: () => void
  className?: string
}) {
  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  }

  return (
    <UniversalCard variant="interactive" hover clickable onClick={onClick} className={className}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{brand}</p>
          </div>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[status])}>{status}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Reward:</span>
            <p className="font-medium text-gray-900 dark:text-white">{reward}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
            <p className="font-medium text-gray-900 dark:text-white">{deadline}</p>
          </div>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Requirements:</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{requirements}</p>
        </div>
      </div>
    </UniversalCard>
  )
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  className,
}: {
  title: string
  value: string | number
  change?: string
  icon?: any
  trend?: "up" | "down" | "neutral"
  className?: string
}) {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  }

  return (
    <UniversalCard variant="elevated" className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && <p className={cn("text-sm mt-1", trendColors[trend])}>{change}</p>}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>
    </UniversalCard>
  )
}
