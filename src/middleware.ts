import { NextRequest, NextResponse } from "next/server"
import { updateSupabaseSession } from "@/lib/supabase/middleware"

// Preview-gate middleware. While PREVIEW_TOKEN is set, every route is
// rewritten to /coming-soon unless the visitor carries a valid preview
// cookie. Hitting ?access=<TOKEN> grants the cookie for 90 days.
//
// When you're ready to launch: delete PREVIEW_TOKEN from Vercel env. The
// middleware sees no token and passes everything through — no redeploy
// of middleware needed.
//
// Supabase session refresh runs on every "let through" branch (post-launch
// traffic and preview-authenticated traffic), so access tokens stay fresh
// before they hit Server Components and Route Handlers.

const PREVIEW_COOKIE = "bb_preview"
const COMING_SOON_PATH = "/coming-soon"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days

// Refresh the Supabase session and return a response, falling back to a
// plain NextResponse.next() if Supabase isn't configured (local dev with
// no .env.local) or the call fails for any reason. Failure to refresh
// must not break the page — the user just won't have an updated token
// for this request, and the next one tries again.
async function refreshSession(req: NextRequest): Promise<NextResponse> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return NextResponse.next({ request: req })
  }
  try {
    return await updateSupabaseSession(req)
  } catch {
    return NextResponse.next({ request: req })
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const previewToken = process.env.PREVIEW_TOKEN

  // Gate disabled (post-launch or local dev with no token set). All
  // traffic is real, so refresh sessions for everyone.
  if (!previewToken) return await refreshSession(req)

  // The coming-soon page itself must render for unauthenticated visitors.
  // No session refresh — these are anonymous public visitors.
  if (pathname.startsWith(COMING_SOON_PATH)) {
    const res = NextResponse.next()
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  // ?access=TOKEN grants the cookie and redirects to the clean URL, so
  // Pedro can share a single magic link without it bouncing around. The
  // follow-up request lands in the cookie-carrying branch below.
  const accessToken = searchParams.get("access")
  if (accessToken && accessToken === previewToken) {
    const cleanUrl = new URL(req.url)
    cleanUrl.searchParams.delete("access")
    const res = NextResponse.redirect(cleanUrl)
    res.cookies.set(PREVIEW_COOKIE, previewToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })
    return res
  }

  // Device already carries the preview cookie — refresh Supabase session
  // and let them in. Still noindex so the preview never gets cached by
  // search engines, even if someone shares their logged-in URL.
  const cookie = req.cookies.get(PREVIEW_COOKIE)
  if (cookie?.value === previewToken) {
    const res = await refreshSession(req)
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  // No token, no cookie — show the teaser. No session refresh.
  const rewriteUrl = req.nextUrl.clone()
  rewriteUrl.pathname = COMING_SOON_PATH
  const res = NextResponse.rewrite(rewriteUrl)
  res.headers.set("X-Robots-Tag", "noindex, nofollow")
  return res
}

export const config = {
  // Match everything except Next internals and static files (anything with
  // a dot in the last segment is treated as a file: .png, .webp, .ico...).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
}
