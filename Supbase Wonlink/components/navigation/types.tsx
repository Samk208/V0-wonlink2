import type React from "react"
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
  badge?: string
  children?: NavigationItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface TabItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
}
