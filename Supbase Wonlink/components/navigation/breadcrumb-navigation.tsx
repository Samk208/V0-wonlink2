"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export type Crumb = { label: string; href?: string }

export function BreadcrumbNavigation({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {idx > 0 && <ChevronRight className="h-4 w-4" />}
            {item.href ? (
              <Link href={item.href} className="ml-1 hover:text-primary-600 md:ml-2">
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 font-medium text-gray-700 md:ml-2">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
