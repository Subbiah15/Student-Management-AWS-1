"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          className="text-muted-foreground lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
          {subtitle && (
            <p className="hidden text-sm text-muted-foreground sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <p className="hidden text-xs font-medium text-muted-foreground sm:block">Student records workspace</p>
    </header>
  )
}
