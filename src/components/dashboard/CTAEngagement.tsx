import { MousePointerClick, MessageCircle, Briefcase, PartyPopper } from "lucide-react"
import { getClickEngagement } from "@/lib/contacts/clicks-server"
import type { CTACategoryKey } from "@/lib/contacts/clicks-server"
import { CTAEngagementDisplay } from "./CTAEngagementDisplay"

// Server Component — fetches aggregated click data from Supabase and passes
// it down as props to the client sub-component that handles rendering.
// No "use client" here: data fetching stays on the server.

interface CategoryMeta {
  key: CTACategoryKey
  label: string
  icon: React.ReactNode
  color: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "revenda",
    label: "Revenda",
    icon: <MessageCircle size={16} strokeWidth={2.2} />,
    color: "#E87A1E",
  },
  {
    key: "distribuidor",
    label: "Distribuidor",
    icon: <Briefcase size={16} strokeWidth={2.2} />,
    color: "#C4650F",
  },
  {
    key: "eventos",
    label: "Eventos",
    icon: <PartyPopper size={16} strokeWidth={2.2} />,
    color: "#ffd36a",
  },
]

export async function CTAEngagement() {
  const engagement = await getClickEngagement()

  return (
    <section className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6">
      <header className="flex items-end justify-between gap-3 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <MousePointerClick size={16} strokeWidth={2.2} className="text-[#E87A1E]" />
            <h2
              className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Engajamento nos CTAs
            </h2>
          </div>
          <p className="text-xs text-[#4A2C1A]/60 mt-0.5">
            Cliques registrados em tempo real via Supabase
          </p>
        </div>
      </header>

      <CTAEngagementDisplay engagement={engagement} categories={CATEGORIES} />
    </section>
  )
}
