"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useSyncExternalStore } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { hasSession } from "@/lib/auth/session"
import { MobileMenuContext } from "./mobile-menu-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // SSR-safe auth flag — server always returns false, client reads real state.
  const authed = useSyncExternalStore(
    () => () => {},
    () => hasSession(),
    () => false,
  )

  useEffect(() => {
    if (!authed) {
      router.replace("/login")
    }
  }, [authed, router])

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f0d08] text-white/80 text-sm">
        Redirecionando para o login…
      </div>
    )
  }

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
