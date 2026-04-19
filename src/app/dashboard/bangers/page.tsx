import { getBangers } from "@/lib/bangers/server"
import { BangersManager } from "./BangersManager"

// Server Component — fetches from Supabase (admin-only via RLS) and passes
// the hydrated list to the client shell which handles filters, search, and
// optimistic mutations through Server Actions.
export default async function DashboardBangersPage() {
  const applications = await getBangers()
  return <BangersManager initialApplications={applications} />
}
