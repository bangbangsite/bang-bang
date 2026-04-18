import { createBrowserClient } from "@supabase/ssr"

// Browser-side Supabase client. Use inside "use client" components, hooks,
// and event handlers. Never import this from Server Components — those get
// the server helper below (which wires cookies).
//
// Each call returns a fresh client; the underlying connection pool is
// managed by the SDK, so creating one per component is cheap.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
