"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export type Tab = { label: string; href: string; disabled?: boolean }

export function TabNavigation({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname()

  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-disabled={tab.disabled}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${
                tab.disabled
                  ? "cursor-not-allowed text-gray-400"
                  : active
                    ? "border-primary-600 font-medium text-primary-600"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
