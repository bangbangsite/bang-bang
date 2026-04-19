import { getWishlistRequests, getWishlistRankings } from "@/lib/wishlist/server"
import { SolicitacoesClient } from "./SolicitacoesClient"

// Server Component — fetches data at request time and passes it down.
// The dashboard layout already guards against unauthenticated access.
export default async function SolicitacoesPage() {
  const requests = await getWishlistRequests()
  const ranking = getWishlistRankings(requests)

  return <SolicitacoesClient requests={requests} ranking={ranking} />
}
