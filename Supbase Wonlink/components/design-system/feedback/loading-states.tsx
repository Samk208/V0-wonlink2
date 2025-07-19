"use client"

import { cn } from "@/lib/utils"
import { UniversalCard } from "../cards/universal-card"

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "pulse" | "dots"
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingState({ variant = "spinner", size = "md", text, className }: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
        <div className={cn("animate-spin rounded-full border-b-2 border-primary-600", sizeClasses[size])} />
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-75" />
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-150" />
        {text && <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full" />
      </div>
    )
  }

  // Skeleton variant
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </div>
  )
}

// Specialized loading components
export function CampaignCardSkeleton() {
  return (
    <UniversalCard>
      <div className="animate-pulse space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    </UniversalCard>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <UniversalCard key={i}>
            <div className="animate-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </UniversalCard>
        ))}
      </div>

      {/* Main Content */}
      <UniversalCard>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>

          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </UniversalCard>
    </div>
  )
}
