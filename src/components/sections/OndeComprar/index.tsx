"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import pdvsData from "@/data/pdvs.json"
import activeUfsData from "@/data/pdvs-active-ufs.json"
import type { PDV, PDVsByUF } from "@/lib/types/pdv"
import { OndeComprarProvider } from "./store"
import { BuscaRapida } from "./BuscaRapida"

const pdvs = pdvsData as PDV[]
const activeUfs = activeUfsData as PDVsByUF[]
const TOTAL_PDVS = pdvs.length
const CITIES = new Set(pdvs.map((p) => `${p.cidade}|${p.uf}`)).size
const STATES = new Set(pdvs.map((p) => p.uf)).size

function isCepDigits(raw: string): boolean {
  return /^\d{8}$/.test(raw.replace(/\D/g, ""))
}

export function OndeComprarSection() {
  // Shared input state between BuscaRapida and the gateway CTA so a typed CEP
  // travels with the click on "Ver mapa completo" — even if the user never
  // pressed Enter inside the search.
  const [searchValue, setSearchValue] = useState("")

  const cepDigits = searchValue.replace(/\D/g, "")
  const ctaHref = isCepDigits(searchValue)
    ? `/onde-encontrar?cep=${cepDigits}`
    : "/onde-encontrar"

  return (
    <SectionWrapper id="onde-comprar" bg="light" py="md">
      <Container>
        <OndeComprarProvider pdvs={pdvs} activeUfs={activeUfs}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            {/* Left — pitch. Centered on mobile (feels more punchy for a
                single-column pitch block); left-aligned from lg+ where the
                two-column grid takes over. */}
            <div className="flex flex-col items-center text-center gap-3 lg:items-start lg:text-left">
              <span className="inline-flex items-center gap-2.5 text-[10px] md:text-[11px] font-semibold tracking-[0.28em] uppercase px-3.5 py-2 rounded-full border border-[#2D1810]/20 bg-white/60 backdrop-blur-md text-[#4A2C1A]">
                <span className="w-2 h-2 rounded-full bg-[#E87A1E] shadow-[0_0_10px_#E87A1E]" />
                Pra quem bebe
              </span>

              <h2
                className="font-black uppercase text-[#1A1A1A] leading-[0.95] tracking-tight"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(2.25rem, 5.5vw, 2.75rem)",
                }}
              >
                Acha a Bang Bang{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #E87A1E, #ff7a3a 55%, #E87A1E)",
                  }}
                >
                  mais perto.
                </span>
              </h2>

              <p className="text-[#4A2C1A]/70 text-sm md:text-base leading-relaxed">
                Joga teu CEP, cidade ou estado. Se ainda não chegou aí, dá pra pedir.
              </p>

              {/* Stats — single discreet pill with all three numbers inline.
                  Kept intentionally quiet so it doesn't compete with the
                  headline or the search input. */}
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#4A2C1A]/15 bg-white/50 backdrop-blur-sm text-[11px] text-[#4A2C1A]/70 whitespace-nowrap">
                <StatInline value={TOTAL_PDVS} label="PDVs" />
                <span aria-hidden="true" className="text-[#4A2C1A]/30">·</span>
                <StatInline value={CITIES} label="cidades" />
                <span aria-hidden="true" className="text-[#4A2C1A]/30">·</span>
                <StatInline value={STATES} label="estados" />
              </div>
            </div>

            {/* Right — busca + CTA. The CTA href reflects the typed CEP so a
                click on "Ver mapa completo" carries the value over even when
                the user didn't press Enter. */}
            <div className="flex flex-col gap-3.5">
              <BuscaRapida
                eagerCepRedirectTo="/onde-encontrar"
                missRedirectTo="/onde-encontrar"
                onInputChange={setSearchValue}
              />

              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2.5 px-6 h-12 rounded-lg bg-[#E87A1E] text-white font-black text-sm uppercase tracking-[0.14em] shadow-[0_12px_32px_-10px_rgba(232,122,30,0.6)] hover:bg-[#C4650F] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(232,122,30,0.75)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2"
              >
                <MapPin size={16} strokeWidth={2.6} />
                Ver mapa completo
                <ArrowRight size={16} strokeWidth={2.6} />
              </Link>
            </div>
          </div>
        </OndeComprarProvider>
      </Container>
    </SectionWrapper>
  )
}

function StatInline({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-bold text-[#4A2C1A]/90 tabular-nums">
        {value.toLocaleString("pt-BR")}
      </span>
      <span className="text-[#4A2C1A]/60">{label}</span>
    </span>
  )
}
