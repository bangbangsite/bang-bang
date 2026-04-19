import { requireUser } from "@/lib/auth/supabase-auth"
import { DashboardShell } from "./DashboardShell"

// Server-side auth gate. requireUser() redirects to /login when there's no
// session — every signed-in user is admin under the current model, so no
// extra role check is needed here.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()
  return <DashboardShell>{children}</DashboardShell>
}
