import { getEvents } from "@/lib/events/server"
import { EventosManager } from "./EventosManager"

// Server Component: fetches events at request time and passes to the
// interactive client manager. No client-side state for the data layer.
export default async function DashboardEventosPage() {
  const events = await getEvents()

  return <EventosManager initialEvents={events} />
}
