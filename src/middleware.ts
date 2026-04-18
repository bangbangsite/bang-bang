import { NextRequest, NextResponse } from "next/server"

// Preview-gate middleware. While PREVIEW_TOKEN is set, every route is
// rewritten to /coming-soon unless the visitor carries a valid preview
// cookie. Hitting ?access=<TOKEN> grants the cookie for 90 days.
//
// When you're ready to launch: delete PREVIEW_TOKEN from Vercel env. The
// middleware sees no token and passes everything through — no redeploy
// of middleware needed.

const PREVIEW_COOKIE = "bb_preview"
const COMING_SOON_PATH = "/coming-soon"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const previewToken = process.env.PREVIEW_TOKEN

  // Gate disabled (post-launch or local dev with no token set).
  if (!previewToken) return NextResponse.next()

  // The coming-soon page itself must render for unauthenticated visitors.
  if (pathname.startsWith(COMING_SOON_PATH)) {
    const res = NextResponse.next()
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  // ?access=TOKEN grants the cookie and redirects to the clean URL, so
  // Pedro can share a single magic link without it bouncing around.
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

  // Device already carries the cookie — let them in. Still noindex so the
  // preview never gets cached by search engines, even if someone shares
  // their logged-in URL.
  const cookie = req.cookies.get(PREVIEW_COOKIE)
  if (cookie?.value === previewToken) {
    const res = NextResponse.next()
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  // No token, no cookie — show the teaser.
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
