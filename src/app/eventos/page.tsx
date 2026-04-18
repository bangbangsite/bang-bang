import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { Container } from "@/components/shared/Container"
import { EventsHero } from "@/components/events/EventsHero"
import { EventsBrowser } from "@/components/events/EventsBrowser"

export const metadata: Metadata = {
  title: "Eventos Bang Bang — agenda de festas, shows e festivais",
  description:
    "Calendário oficial dos eventos com Bang Bang. Festas, shows, festivais e ativações nas principais cidades do Brasil.",
  openGraph: {
    title: "Eventos Bang Bang",
    description:
      "Onde a Bang Bang estará nas próximas semanas — festas, shows, festivais e ativações.",
  },
}

export default function EventosPage() {
  return (
    <>
      <Header />
      <main>
        <EventsHero />
        <section className="bg-[#FAFAF8] py-14 md:py-20">
          <Container>
            <EventsBrowser />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
