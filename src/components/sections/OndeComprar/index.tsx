"use client"

import { MapPin, Building2, Globe2 } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { WishlistForm } from "@/components/onde-encontrar/WishlistForm"
import type { PDV } from "@/lib/types/pdv"

interface OndeComprarSectionProps {
  pdvs: PDV[]
}

interface KpiProps {
  icon: React.ReactNode
  value: string
  label: string
}

function KpiCard({ icon, value, label }: KpiProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-[#4A2C1A]/10 p-5 md:p-6 shadow-[0_12px_32px_-22px_rgba(74,44,26,0.25)]">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_8px_18px_-6px_rgba(232,122,30,0.55)]"
        style={{
          background:
            "linear-gradient(135deg, #E87A1E 0%, #C4650F 60%, #E85D10 100%)",
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span
          className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A] tabular-nums"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {value}
        </span>
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/60">
          {label}
        </span>
      </div>
    </div>
  )
}

export function OndeComprarSection({ pdvs }: OndeComprarSectionProps) {
  const totalPdvs = pdvs.length
  const cities = new Set(pdvs.map((p) => `${p.cidade}|${p.uf}`)).size
  const states = new Set(pdvs.map((p) => p.uf)).size

  return (
    <SectionWrapper id="quero-bang-bang" bg="light" py="lg">
      <Container>
        <SectionTitle
          eyebrow="Capilaridade"
          title="Onde a Bang Bang"
          highlight="já tá."
          subtitle="Em expansão acelerada por todo o Brasil — e a próxima cidade pode ser a sua."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-12 max-w-4xl mx-auto">
          <KpiCard
            icon={<MapPin size={22} strokeWidth={2.4} />}
            value={totalPdvs.toLocaleString("pt-BR")}
            label="PDVs ativos"
          />
          <KpiCard
            icon={<Building2 size={22} strokeWidth={2.4} />}
            value={cities.toLocaleString("pt-BR")}
            label="Cidades"
          />
          <KpiCard
            icon={<Globe2 size={22} strokeWidth={2.4} />}
            value={states.toLocaleString("pt-BR")}
            label="Estados"
          />
        </div>

        <div className="mt-12 md:mt-16">
          <WishlistForm />
        </div>
      </Container>
    </SectionWrapper>
  )
}
