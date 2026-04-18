import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Supabase session refresh — call this from the edge middleware/proxy so
// expired access tokens get refreshed on every request. Returns the
// Response with updated cookies.
//
// Two-step pattern: we create an initial response, hand it to the SDK so
// it can write cookies, then getUser() touches the session which triggers
// a refresh if needed. The response carrying those refreshed cookies is
// what we return.
//
// Wired from `src/middleware.ts` on the post-launch and preview-authenticated
// branches via a `refreshSession` wrapper that handles missing env vars and
// transient failures.
export async function updateSupabaseSession(req: NextRequest) {
  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Touch the session — triggers refresh when access token is expiring.
  await supabase.auth.getUser()

  return response
}
