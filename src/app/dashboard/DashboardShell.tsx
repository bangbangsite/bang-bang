"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { MobileMenuContext } from "./mobile-menu-context"

// Client shell for /dashboard: owns the mobile sidebar state and the
// MobileMenuContext provider. The auth gate runs in layout.tsx (server)
// before this ever mounts.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A0D0A]">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <MobileMenuContext.Provider value={{ open: () => setMobileOpen(true) }}>
          {children}
        </MobileMenuContext.Provider>
      </div>
    </div>
  )
}
