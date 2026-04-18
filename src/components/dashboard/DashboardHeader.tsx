"use client"

import { Menu } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  onMenuOpen: () => void
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  onMenuOpen,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-[#4A2C1A]/8">
      <div className="flex items-center justify-between gap-4 px-5 md:px-8 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Abrir menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#2D1810] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          <div className="min-w-0">
            <h1
              className="font-black uppercase text-[#1A1A1A] text-xl md:text-2xl leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-[#4A2C1A]/55 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  )
}
