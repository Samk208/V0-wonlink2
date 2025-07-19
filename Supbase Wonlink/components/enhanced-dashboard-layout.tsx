import type { ReactNode } from "react"
import { PrimaryNavigation } from "../navigation/primary-navigation"
import { SidebarNavigation } from "../navigation/sidebar-navigation"
import { MobileNavigation } from "../navigation/mobile-navigation"
import type { NavItem } from "../navigation/types"

export function EnhancedDashboardLayout({
  sidebarItems,
  children,
}: {
  sidebarItems: NavItem[]
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PrimaryNavigation variant="brand" />

      <div className="flex flex-1">
        <SidebarNavigation items={sidebarItems} />

        <main className="flex-1 px-4 py-6">{children}</main>
      </div>

      {/* Bottom nav for small screens */}
      <MobileNavigation />
    </div>
  )
}
