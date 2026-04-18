import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Server-side Supabase client. Use inside Server Components, Route Handlers,
// Server Actions, and the proxy/middleware layer. Cookie handling is routed
// through Next's cookies() API so sessions refresh on every render.
//
// The try/catch around setAll is intentional: Server Components are not
// allowed to mutate cookies. The SDK calls setAll after every request to
// keep the session fresh, and we only want that to succeed when we're in a
// mutable context (middleware, route handlers, server actions). Swallowing
// the error in Server Components is the pattern recommended by Supabase.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — ignore. Auth pages and Server
            // Actions hit this path via route handlers / middleware where
            // cookie mutation is allowed.
          }
        },
      },
    },
  )
}
