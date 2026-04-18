"use client"

import { MapPin, Inbox, PartyPopper, Users } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatCard } from "@/components/dashboard/StatCard"
import { StateRanking } from "@/components/dashboard/StateRanking"
import { RecentPDVsList } from "@/components/dashboard/RecentPDVsList"
import { CTAEngagement } from "@/components/dashboard/CTAEngagement"
import { FAQSnapshot } from "@/components/dashboard/FAQSnapshot"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { WishlistRanking } from "@/components/dashboard/WishlistRanking"
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget"
import { NovosBangersWidget } from "@/components/dashboard/NovosBangersWidget"
import { ResetDemoDataCard } from "@/components/dashboard/ResetDemoDataCard"
import { usePDVs, countsByUF, recentPDVs } from "@/lib/pdvs/usePDVs"
import { useWishlist } from "@/lib/wishlist/useWishlist"
import { useEvents } from "@/lib/events/useEvents"
import { useBangers } from "@/lib/bangers/useBangers"
import { useMobileMenu } from "./mobile-menu-context"

export default function DashboardPage() {
  const { pdvs, overrides } = usePDVs()
  const { total: totalRequests } = useWishlist()
  const { upcoming } = useEvents()
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
        {/* Banner — explains that edits are local to this browser. Discreet
            inline strip, not a heavy alert. */}
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

        {/* Quick actions — jump into the most common edit flows in one click */}
        <QuickActions />

        {/* Stat cards — Total de PDVs is the permanent featured (white card
            with orange border + orange number) so the staff has a fixed
            anchor for the most important metric. */}
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
            value={upcoming.length}
            hint={
              upcoming.length === 0
                ? "agenda vazia"
                : upcoming.length === 1
                  ? "1 evento confirmado"
                  : `${upcoming.length} eventos confirmados`
            }
            icon={<PartyPopper size={16} strokeWidth={2.2} />}
          />
          <StatCard
            label="Solicitações"
            value={totalRequests}
            hint={
              totalRequests === 0
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

        {/* Conteúdo do site: próximos eventos + bangers pendentes (bate-pronto) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UpcomingEventsWidget />
          <NovosBangersWidget />
        </div>

        {/* Wishlist ranking + CTA engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
          <WishlistRanking />
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

        {/* Danger zone — last block on the page, intentionally separated */}
        <ResetDemoDataCard />
      </div>
    </>
  )
}
