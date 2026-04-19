import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

// Server-only auth helpers. The browser equivalent sits in client components
// and calls supabase.auth directly — there's no middleware-style role gate
// because every signed-in user is admin (see migration
// 20260418000002_simplify_roles_admin_only.sql).

export interface AuthUser {
  id: string
  email: string | null
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return { id: data.user.id, email: data.user.email ?? null }
}

// Redirects to /login when there's no session. Use from Server Components
// and route handlers that require a logged-in user. Every signed-in user
// is admin, so this is the only gate the dashboard needs.
export async function requireUser(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
}
