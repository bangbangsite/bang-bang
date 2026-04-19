"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  Phone,
  MessageCircleQuestion,
  Inbox,
  PartyPopper,
  Briefcase,
  Users,
  LogOut,
  X,
  Lock,
} from "lucide-react"
import { logoutAction } from "@/app/login/actions"
import { Logo } from "@/components/shared/Logo"
import { usePDVs } from "@/lib/pdvs/usePDVs"
import { cn } from "@/lib/utils"

interface NavGroup {
  /** Section heading shown above the items. */
  label: string
  items: readonly NavItem[]
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Operação",
    items: [
      { href: "/dashboard",              label: "Dashboard",    icon: LayoutDashboard },
      { href: "/dashboard/pdvs",         label: "PDVs",         icon: MapPin },
      { href: "/dashboard/solicitacoes", label: "Solicitações", icon: Inbox },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/dashboard/eventos",      label: "Eventos",      icon: PartyPopper },
      { href: "/dashboard/bangers",      label: "Bangers",      icon: Users },
      { href: "/dashboard/contatos",     label: "Contatos",     icon: Phone },
      { href: "/dashboard/faq",          label: "FAQ",          icon: MessageCircleQuestion },
    ],
  },
] as const

const COMING_SOON = [
  { label: "Trabalhe Conosco", icon: Briefcase },
] as const

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { overrides } = usePDVs()

  const editedCount =
    Object.keys(overrides.edited).length +
    overrides.added.length +
    overrides.deletedIds.length

  // Notification badges per nav route. Only routes that exist on the badge map
  // render a pill — keeps the sidebar quiet when nothing needs attention.
  const badges: Record<string, number> = {
    "/dashboard/pdvs": editedCount,
  }

  return (
    <>
      {/* mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-[#1A0D0A]/40 backdrop-blur-sm z-30 lg:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Navegação do painel"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#4A2C1A]/8 transition-transform",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full p-5 overflow-y-auto">
          {/* Brand + mobile close */}
          <div className="flex items-center justify-between mb-7 pt-1">
            <Link
              href="/dashboard"
              className="inline-flex flex-col gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] rounded"
            >
              <Logo variant="dark" height={48} />
              <span
                className="text-[9px] tracking-[0.28em] uppercase text-[#E87A1E]/80 font-bold"
                style={{ fontFamily: "var(--font-heading-var)" }}
              >
                Painel staff
              </span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full text-[#4A2C1A]/55 hover:bg-[#FAFAF8] hover:text-[#2D1810]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav groups */}
          <nav aria-label="Principal" className="flex flex-col gap-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] tracking-[0.24em] uppercase text-[#4A2C1A]/45 font-bold mb-2 px-2">
                  {group.label}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active =
                      href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname?.startsWith(href)
                    const badge = badges[href]
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={onClose}
                          className={cn(
                            "group relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
                            active
                              ? "bg-[#FAFAF8] text-[#1A1A1A] font-semibold"
                              : "text-[#4A2C1A]/75 hover:bg-[#FAFAF8] hover:text-[#1A1A1A]",
                          )}
                        >
                          {/* Active indicator — vertical orange bar pinned to
                              the left edge of the rounded item. */}
                          {active && (
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#E87A1E]"
                            />
                          )}
                          <Icon
                            size={17}
                            strokeWidth={1.9}
                            className={cn(
                              "shrink-0 transition-colors",
                              active
                                ? "text-[#E87A1E]"
                                : "text-[#4A2C1A]/50 group-hover:text-[#2D1810]",
                            )}
                          />
                          <span className="flex-1 truncate">{label}</span>
                          {badge !== undefined && badge > 0 && (
                            <span
                              className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full bg-[#E87A1E] text-white text-[10px] font-bold tabular-nums shrink-0"
                              aria-label={`${badge} pendentes`}
                            >
                              {badge > 99 ? "99+" : badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            {/* Em construção — disabled placeholders */}
            <div>
              <p className="text-[10px] tracking-[0.24em] uppercase text-[#4A2C1A]/35 font-bold mb-2 px-2 flex items-center gap-1.5">
                <Lock size={10} strokeWidth={2.5} />
                Em construção
              </p>
              <ul className="flex flex-col gap-0.5">
                {COMING_SOON.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <div
                      aria-disabled="true"
                      title={`${label} — em breve`}
                      className="group flex items-center justify-between gap-3 pl-4 pr-3 py-2.5 rounded-lg text-[13px] font-medium text-[#4A2C1A]/30 cursor-not-allowed select-none"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon size={17} strokeWidth={1.9} className="text-[#4A2C1A]/25" />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="text-[8px] tracking-[0.22em] uppercase px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#4A2C1A]/40 font-bold shrink-0">
                        Em breve
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="flex-1" />

          {/* Footer — logout */}
          <div className="pt-4 border-t border-[#4A2C1A]/8">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#4A2C1A]/45 font-bold mb-2 px-2">
              Conta
            </p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="group flex w-full items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-[13px] font-medium text-[#4A2C1A]/75 hover:text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
              >
                <LogOut
                  size={17}
                  strokeWidth={1.9}
                  className="text-[#4A2C1A]/50 group-hover:text-[#E87A1E]"
                />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
