import { getUpcomingEvents } from "@/lib/events/server"
import { DashboardHome } from "./DashboardHome"
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget"

// Server Component wrapper: fetches events data and passes it as props to
// the client-heavy dashboard shell. Keeps the client component free of
// any direct Supabase calls while the rest (PDVs, wishlist, bangers) remain
// in their existing localStorage hooks for now.
export default async function DashboardPage() {
  const upcomingEvents = await getUpcomingEvents()

  return (
    <DashboardHome
      upcomingCount={upcomingEvents.length}
      eventsWidget={<UpcomingEventsWidget />}
    />
  )
}
