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
    <div
      // DS Brand White surface, Brand Dark border, lg radius (24)
      className="flex items-center gap-4 rounded-3xl bg-white border border-[#2C1505]/10 p-5 md:p-6 shadow-[0_12px_32px_-22px_rgba(39,12,8,0.3)]"
    >
      <div
        // DS validated brand gradient, md radius (12)
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_8px_18px_-6px_rgba(39,12,8,0.5)]"
        style={{
          background:
            "linear-gradient(135deg, #270C08 0%, #8C4515 50%, #C8902C 100%)",
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span
          // DS display value → Bebas Neue, scaled up
          className="text-4xl md:text-5xl text-[#2C1505] tabular-nums leading-none"
          style={{
            fontFamily: "var(--font-display-var)",
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}
        >
          {value}
        </span>
        <span
          className="mt-1.5 text-[11px] tracking-[0.18em] uppercase text-[#5A5228]/85"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 600 }}
        >
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
