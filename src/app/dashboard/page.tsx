import { getUpcomingEvents } from "@/lib/events/server"
import { getWishlistRequests, getWishlistRankings } from "@/lib/wishlist/server"
import { DashboardHome } from "./DashboardHome"
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget"

// Server Component wrapper: fetches everything the dashboard home needs in
// parallel and passes it down. Keeps DashboardHome free of direct Supabase
// calls — PDVs and bangers stay on localStorage hooks until their own waves.
export default async function DashboardPage() {
  const [upcomingEvents, wishlistRequests] = await Promise.all([
    getUpcomingEvents(),
    getWishlistRequests(),
  ])

  const wishlistRanking = getWishlistRankings(wishlistRequests)

  return (
    <DashboardHome
      upcomingCount={upcomingEvents.length}
      eventsWidget={<UpcomingEventsWidget />}
      wishlistTotal={wishlistRequests.length}
      wishlistRanking={wishlistRanking}
    />
  )
}
