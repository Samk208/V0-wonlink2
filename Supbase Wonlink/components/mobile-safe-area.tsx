"use client"

import type { ReactNode } from "react"
import { usePlatform } from "@/hooks/use-platform"

interface MobileSafeAreaProps {
  children: ReactNode
  className?: string
}

export function MobileSafeArea({ children, className = "" }: MobileSafeAreaProps) {
  const platform = usePlatform()

  return (
    <div
      className={`
        ${platform.isNative ? `pt-[${platform.safeAreaTop}px] pb-[${platform.safeAreaBottom}px]` : ""}
        ${className}
      `}
      style={{
        paddingTop: platform.isNative ? `${platform.safeAreaTop}px` : undefined,
        paddingBottom: platform.isNative ? `${platform.safeAreaBottom}px` : undefined,
      }}
    >
      {children}
    </div>
  )
}
