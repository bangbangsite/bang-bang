"use client"

import type { ReactNode } from "react"
import { MapPin, Inbox, PartyPopper, Users } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatCard } from "@/components/dashboard/StatCard"
import { StateRanking } from "@/components/dashboard/StateRanking"
import { RecentPDVsList } from "@/components/dashboard/RecentPDVsList"
import { CTAEngagement } from "@/components/dashboard/CTAEngagement"
import { FAQSnapshot } from "@/components/dashboard/FAQSnapshot"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { WishlistRanking } from "@/components/dashboard/WishlistRanking"
import { NovosBangersWidget } from "@/components/dashboard/NovosBangersWidget"
import { ResetDemoDataCard } from "@/components/dashboard/ResetDemoDataCard"
import { usePDVs, countsByUF, recentPDVs } from "@/lib/pdvs/usePDVs"
import { useBangers } from "@/lib/bangers/useBangers"
import type { CityRankRow } from "@/lib/wishlist/config"
import { useMobileMenu } from "./mobile-menu-context"

interface DashboardHomeProps {
  /** Pre-fetched upcoming events count (from Server Component). */
  upcomingCount: number
  /** Server-rendered UpcomingEventsWidget passed as a slot. */
  eventsWidget: ReactNode
  /** Pre-fetched total wishlist requests (from Server Component). */
  wishlistTotal: number
  /** Pre-computed wishlist city ranking (from Server Component). */
  wishlistRanking: readonly CityRankRow[]
}

export function DashboardHome({
  upcomingCount,
  eventsWidget,
  wishlistTotal,
  wishlistRanking,
}: DashboardHomeProps) {
  const { pdvs, overrides } = usePDVs()
  const { novosCount: novosBangers, total: totalBangers } = useBangers()
  const { open: openMobileMenu } = useMobileMenu()

  const total = pdvs.length
  const ufCounts = countsByUF(pdvs)
  const statesActive = ufCounts.length
  const topState = ufCounts[0]
  const recent = recentPDVs(pdvs, overrides, 5)

  const totalEdited = Object.keys(overrides.edited).length
  const totalAdded = overrides.added.length
  const totalDeleted = overrides.deletedIds.length
  const totalChanged = totalEdited + totalAdded + totalDeleted

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        subtitle="Visão geral dos pontos de venda Bang Bang"
        onMenuOpen={openMobileMenu}
      />

      <div className="px-5 md:px-8 py-6 md:py-8 flex flex-col gap-5">
        {/* Banner — explains that edits are local to this browser. */}
        {totalChanged > 0 && (
          <div className="rounded-xl bg-white border border-[#4A2C1A]/8 px-4 py-2.5 text-sm flex items-center gap-3">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-[#E87A1E] shrink-0"
            />
            <p className="text-[#4A2C1A]/80 leading-snug flex-1 min-w-0">
              <strong className="text-[#2D1810] font-semibold">
                {totalChanged} {totalChanged === 1 ? "alteração local" : "alterações locais"}
              </strong>{" "}
              <span className="text-[#4A2C1A]/55">
                — edições ficam neste navegador até o backend ser plugado. Gerencie em{" "}
                <strong className="text-[#2D1810] font-semibold">PDVs</strong>.
              </span>
            </p>
          </div>
        )}

        {/* Quick actions */}
        <QuickActions />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            featured
            label="Total de PDVs"
            value={total.toLocaleString("pt-BR")}
            hint={
              statesActive > 0
                ? `${statesActive} estados${topState ? ` · líder ${topState.uf}` : ""}`
                : "base completa"
            }
            icon={<MapPin size={16} strokeWidth={2.2} />}
          />
          <StatCard
            label="Próximos eventos"
            value={upcomingCount}
            hint={
              upcomingCount === 0
                ? "agenda vazia"
                : upcomingCount === 1
                  ? "1 evento confirmado"
                  : `${upcomingCount} eventos confirmados`
            }
            icon={<PartyPopper size={16} strokeWidth={2.2} />}
          />
          <StatCard
            label="Solicitações"
            value={wishlistTotal}
            hint={
              wishlistTotal === 0
                ? "nenhum pedido de cidade ainda"
                : "consumidores querendo Bang Bang"
            }
            icon={<Inbox size={16} strokeWidth={2.2} />}
          />
          <StatCard
            label="Bangers"
            value={totalBangers}
            hint={
              novosBangers > 0
                ? `${novosBangers} novos · ${totalBangers - novosBangers} em pipeline`
                : totalBangers === 0
                  ? "nenhum candidato ainda"
                  : "triagem completa"
            }
            icon={<Users size={16} strokeWidth={2.2} />}
          />
        </div>

        {/* Conteúdo do site: próximos eventos + bangers pendentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* eventsWidget is a Server Component rendered by the parent server page */}
          {eventsWidget}
          <NovosBangersWidget />
        </div>

        {/* Wishlist ranking + CTA engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
          <WishlistRanking ranking={wishlistRanking} total={wishlistTotal} />
          <CTAEngagement />
        </div>

        {/* FAQ snapshot */}
        <div className="grid grid-cols-1">
          <FAQSnapshot />
        </div>

        {/* Main grid — ranking (wide) + recent (side) */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <StateRanking
            data={ufCounts}
            title="PDVs por estado (ranking)"
          />
          <RecentPDVsList items={recent} />
        </div>

        {/* Danger zone */}
        <ResetDemoDataCard />
      </div>
    </>
  )
}
