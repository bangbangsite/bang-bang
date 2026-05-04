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
  const { pdvs } = await getMergedPDVs()

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

        {/* 04 — Distribuição + Logística + Parceiros: argumento B2B + ficha
            técnica + prova social, todos na mesma dobra */}
        <RevendaSection />

        {/* 05 — Eventos: pivot B2B — "ative sua marca em eventos" com link
            discreto pra agenda B2C em /eventos */}
        <EventosSection />

        {/* 06 — Quero Bang Bang na minha cidade: capilaridade (KPIs) +
            wishlist form + link discreto pro mapa completo em /onde-encontrar */}
        <OndeComprarSection pdvs={pdvs} />

        {/* 07 — FAQ: quebrar objeções B2B (ilha card branca dentro do cinza) */}
        <FAQSection />

        {/* 08 — CTA: conversão final B2B (3 caminhos) */}
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
