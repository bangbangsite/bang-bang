import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { Container } from "@/components/shared/Container"
import { EventsHero } from "@/components/events/EventsHero"
import { EventsBrowser } from "@/components/events/EventsBrowser"
import { getUpcomingEvents } from "@/lib/events/server"

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

// Server Component: fetches events once per request, passes to client children.
// Zero client-side fetching on the public /eventos page.
export default async function EventosPage() {
  const events = await getUpcomingEvents()

  return (
    <>
      <Header />
      <main>
        <EventsHero events={events} />
        <section className="bg-[#FAFAF8] py-14 md:py-20">
          <Container>
            <EventsBrowser events={events} />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
