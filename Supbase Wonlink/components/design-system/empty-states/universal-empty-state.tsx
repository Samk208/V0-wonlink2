"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { UniversalCard } from "../cards/universal-card"
import { cn } from "@/lib/utils"
import { Search, Users, Target, FileText, Wallet, Bell, Settings } from "lucide-react"

interface UniversalEmptyStateProps {
  variant?: "search" | "campaigns" | "applications" | "notifications" | "wallet" | "profile" | "settings" | "custom"
  title: string
  description: string
  icon?: ReactNode
  actions?: {
    primary?: {
      label: string
      onClick: () => void
    }
    secondary?: {
      label: string
      onClick: () => void
    }
  }
  illustration?: ReactNode
  className?: string
}

const defaultIcons = {
  search: Search,
  campaigns: Target,
  applications: FileText,
  notifications: Bell,
  wallet: Wallet,
  profile: Users,
  settings: Settings,
  custom: FileText,
}

export function UniversalEmptyState({
  variant = "custom",
  title,
  description,
  icon,
  actions,
  illustration,
  className,
}: UniversalEmptyStateProps) {
  const IconComponent = icon || defaultIcons[variant]

  return (
    <UniversalCard variant="outlined" padding="lg" className={cn("text-center max-w-md mx-auto", className)}>
      <div className="space-y-6">
        {/* Illustration or Icon */}
        <div className="flex justify-center">
          {illustration || (
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              {typeof IconComponent === "function" ? (
                <IconComponent className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              ) : (
                IconComponent
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.primary && (
              <Button
                onClick={actions.primary.onClick}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
              >
                {actions.primary.label}
              </Button>
            )}
            {actions.secondary && (
              <Button variant="outline" onClick={actions.secondary.onClick}>
                {actions.secondary.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </UniversalCard>
  )
}

// Specialized empty state components
export function CampaignsEmptyState({
  userRole,
  onCreateCampaign,
  onBrowseCampaigns,
}: {
  userRole: "brand" | "influencer"
  onCreateCampaign?: () => void
  onBrowseCampaigns?: () => void
}) {
  if (userRole === "brand") {
    return (
      <UniversalEmptyState
        variant="campaigns"
        title="No campaigns yet"
        description="Create your first campaign to start connecting with influencers and grow your brand reach."
        actions={{
          primary: onCreateCampaign
            ? {
                label: "Create Campaign",
                onClick: onCreateCampaign,
              }
            : undefined,
          secondary: {
            label: "Learn More",
            onClick: () => console.log("Learn more"),
          },
        }}
      />
    )
  }

  return (
    <UniversalEmptyState
      variant="campaigns"
      title="No campaigns available"
      description="Check back soon for new campaign opportunities that match your profile and interests."
      actions={{
        primary: onBrowseCampaigns
          ? {
              label: "Browse All Campaigns",
              onClick: onBrowseCampaigns,
            }
          : undefined,
        secondary: {
          label: "Update Profile",
          onClick: () => console.log("Update profile"),
        },
      }}
    />
  )
}

export function SearchEmptyState({
  query,
  onClearSearch,
  onBrowseAll,
}: {
  query: string
  onClearSearch: () => void
  onBrowseAll: () => void
}) {
  return (
    <UniversalEmptyState
      variant="search"
      title={`No results for "${query}"`}
      description="Try adjusting your search terms or browse all available options."
      actions={{
        primary: {
          label: "Clear Search",
          onClick: onClearSearch,
        },
        secondary: {
          label: "Browse All",
          onClick: onBrowseAll,
        },
      }}
    />
  )
}
