"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  description: string
  type: "campaign" | "influencer" | "brand" | "hashtag"
  href: string
  badge?: string
  verified?: boolean
}

interface Result {
  label: string
  href: string
}

interface GlobalSearchProps {
  placeholder?: string
  className?: string
  variant?: "input" | "button"
  data: Result[]
}

export function GlobalSearch({
  placeholder = "Search campaigns, influencers...",
  className,
  variant = "input",
  data,
}: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const results = data.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setQuery("")
  }

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "campaign":
        return "Briefcase"
      case "influencer":
        return "User"
      case "brand":
        return "Building"
      case "hashtag":
        return "Hash"
      default:
        return "Search"
    }
  }

  if (variant === "button") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-start text-muted-foreground", className)}
            onClick={() => setOpen(true)}
          >
            <Search className="w-4 h-4 mr-2" />
            <span>{placeholder}</span>
            <kbd className="ml-auto hidden font-mono text-xs text-gray-400 sm:inline">⌘K</kbd>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
            <CommandList className="max-h-72 overflow-y-auto">
              {results.map((r) => (
                <Link key={r.href} href={r.href} onClick={() => setOpen(false)}>
                  <CommandItem>{r.label}</CommandItem>
                </Link>
              ))}
              {results.length === 0 && <p className="p-4 text-sm text-gray-500">No results</p>}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input placeholder={placeholder} className="pl-10 pr-16" onClick={() => setOpen(true)} readOnly />
      <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg p-0">
            <Command shouldFilter={false}>
              <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
              <CommandList className="max-h-72 overflow-y-auto">
                {results.map((r) => (
                  <Link key={r.href} href={r.href} onClick={() => setOpen(false)}>
                    <CommandItem>{r.label}</CommandItem>
                  </Link>
                ))}
                {results.length === 0 && <p className="p-4 text-sm text-gray-500">No results</p>}
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
