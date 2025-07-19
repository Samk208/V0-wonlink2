"use client"

import type { ReactNode } from "react"
import { EnhancedHeader } from "./enhanced-header"

interface DashboardLayoutProps {
  children: ReactNode
  activeTab?: string
}

export function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <EnhancedHeader variant="dashboard" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  )
}
