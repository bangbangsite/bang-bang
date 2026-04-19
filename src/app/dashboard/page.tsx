import { getUpcomingEvents } from "@/lib/events/server"
import { getWishlistRequests, getWishlistRankings } from "@/lib/wishlist/server"
import { getBangers } from "@/lib/bangers/server"
import { DashboardHome } from "./DashboardHome"
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget"
import { CTAEngagement } from "@/components/dashboard/CTAEngagement"
import { NovosBangersWidget } from "@/components/dashboard/NovosBangersWidget"

// Server Component wrapper: fetches everything the dashboard home needs in
// parallel and passes it down. Server-rendered widgets (events, engagement,
// novos bangers) are injected as ReactNode slots so the client shell stays
// async-free.
export default async function DashboardPage() {
  const [upcomingEvents, wishlistRequests, bangerApplications] = await Promise.all([
    getUpcomingEvents(),
    getWishlistRequests(),
    getBangers(),
  ])

  const wishlistRanking = getWishlistRankings(wishlistRequests)
  const totalBangers = bangerApplications.length
  const novosBangers = bangerApplications.filter((a) => a.status === "novo").length

  return (
    <DashboardHome
      upcomingCount={upcomingEvents.length}
      eventsWidget={<UpcomingEventsWidget />}
      engagementWidget={<CTAEngagement />}
      novosBangersWidget={<NovosBangersWidget />}
      wishlistTotal={wishlistRequests.length}
      wishlistRanking={wishlistRanking}
      totalBangers={totalBangers}
      novosBangers={novosBangers}
    />
  )
}
