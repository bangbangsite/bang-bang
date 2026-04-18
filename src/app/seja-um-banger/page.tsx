import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { BangerHero } from "@/components/banger/BangerHero"
import { ManifestoSection } from "@/components/banger/ManifestoSection"
import { PerksSection } from "@/components/banger/PerksSection"
import { HowItWorksSection } from "@/components/banger/HowItWorksSection"
import { TopBangersSection } from "@/components/banger/TopBangersSection"
import { TestimonialsSection } from "@/components/banger/TestimonialsSection"
import { BangerFAQ } from "@/components/banger/BangerFAQ"
import { BangerForm } from "@/components/banger/BangerForm"

export const metadata: Metadata = {
  title: "Seja um Banger — programa de embaixadores Bang Bang",
  description:
    "Programa oficial de embaixadores Bang Bang. Autenticidade, cachê justo, produto na porta e acesso VIP. Se você é banger de verdade, a gente quer te conhecer.",
  openGraph: {
    title: "Seja um Banger",
    description:
      "A Bang Bang não quer influencer. Quer banger — gente que vive a noite, tem voz própria e não vende script.",
  },
}

export default function SejaUmBangerPage() {
  return (
    <>
      <Header />
      <main>
        <BangerHero />
        <ManifestoSection />
        <PerksSection />
        <HowItWorksSection />
        <TopBangersSection />
        <TestimonialsSection />
        <BangerFAQ />
        <BangerForm />
      </main>
      <Footer />
    </>
  )
}
