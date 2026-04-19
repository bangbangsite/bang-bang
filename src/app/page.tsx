import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { MarqueeBanner } from "@/components/sections/MarqueeBanner"
import { SaboresSection } from "@/components/sections/SaboresSection"
import { RevendaSection } from "@/components/sections/RevendaSection"
import { EventosSection } from "@/components/sections/EventosSection"
import { OndeComprarSection } from "@/components/sections/OndeComprar"
import { FAQSection } from "@/components/sections/FAQSection"
import { CTASection } from "@/components/sections/CTASection"
import { getMergedPDVs } from "@/lib/pdvs/server"

export default async function Home() {
  const { pdvs, activeUfs } = await getMergedPDVs()

  return (
    <>
      <Header />
      <main>
        {/* 01 — Hero: impacto visual imediato */}
        <HeroSection />

        {/* 02 — Marquee: credenciais B2B em faixa rolante */}
        <MarqueeBanner />

        {/* 03 — Sabores: showcase do produto (alimenta os dois lados) */}
        <SaboresSection />

        {/* 04 — Revenda + Parceiros (mesma dobra): argumento B2B + prova social */}
        <RevendaSection />

        {/* 05 — Eventos: pivot B2B — "ative sua marca em eventos" com link
            discreto pra agenda B2C em /eventos */}
        <EventosSection />

        {/* 06 — Onde Comprar: gateway enxuto pra /onde-encontrar */}
        <OndeComprarSection pdvs={pdvs} activeUfs={activeUfs} />

        {/* 07 — FAQ: quebrar objeções B2B (ilha card branca dentro do cinza) */}
        <FAQSection />

        {/* 08 — CTA: conversão final B2B (3 caminhos) */}
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
