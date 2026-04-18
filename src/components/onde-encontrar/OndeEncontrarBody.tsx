"use client"

import { useMemo, useRef } from "react"
import type { PDV, PDVsByUF } from "@/lib/types/pdv"
import { Container } from "@/components/shared/Container"
import { OndeEncontrarHero } from "./OndeEncontrarHero"
import { OndeEncontrarBrowser } from "./OndeEncontrarBrowser"
import { WishlistForm } from "./WishlistForm"

interface OndeEncontrarBodyProps {
  pdvs: PDV[]
  /**
   * Kept on the API surface for the page-level prop contract (the page hands
   * over data straight from JSON). The browser derives its own UF aggregates
   * from `pdvs` so this is currently passive data.
   */
  activeUfs: PDVsByUF[]
}

export function OndeEncontrarBody({ pdvs }: OndeEncontrarBodyProps) {
  const formRef = useRef<HTMLDivElement>(null)
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Hero stats
  const cities = useMemo(
    () => new Set(pdvs.map((p) => `${p.cidade}|${p.uf}`)).size,
    [pdvs],
  )
  const states = useMemo(() => new Set(pdvs.map((p) => p.uf)).size, [pdvs])

  return (
    <>
      {/* ==================== HERO ==================== */}
      <OndeEncontrarHero
        totalPdvs={pdvs.length}
        cityCount={cities}
        stateCount={states}
      />

      {/* ==================== BROWSER (Lista | Mapa) ==================== */}
      <section
        id="busca-rapida"
        className="relative bg-[#FAFAF8] py-14 md:py-20 scroll-mt-24"
      >
        <Container>
          <OndeEncontrarBrowser pdvs={pdvs} onRequestHere={scrollToForm} />
        </Container>
      </section>

      {/* ==================== WISHLIST FORM ==================== */}
      <section className="bg-[#FAFAF8] py-16 md:py-24 border-t border-[#4A2C1A]/8">
        <Container>
          <div ref={formRef}>
            <WishlistForm highlighted={false} prefill={null} />
          </div>
        </Container>
      </section>
    </>
  )
}
