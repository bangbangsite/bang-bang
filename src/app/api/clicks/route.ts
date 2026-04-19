import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

// Valid CTA categories — mirrors the DB check constraint.
const VALID_CATEGORIES = new Set(["revenda", "distribuidor", "eventos"])

/**
 * POST /api/clicks
 *
 * Fire-and-forget endpoint for CTA click tracking.
 * RLS allows public (anon) INSERT on click_events, so no auth is required.
 *
 * Body: { category: "revenda" | "distribuidor" | "eventos", page?: string }
 *
 * Returns 204 on success (no body). Returns 400 on invalid category.
 * Intentionally swallows DB errors with a 500 — caller ignores the response.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("category" in body) ||
    typeof (body as Record<string, unknown>).category !== "string"
  ) {
    return NextResponse.json({ error: "Missing category" }, { status: 400 })
  }

  const { category, page } = body as { category: string; page?: unknown }

  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }

  const pagePath = typeof page === "string" ? page.slice(0, 255) : null

  try {
    const supabase = await createSupabaseServerClient()
    await supabase.from("click_events").insert({
      category,
      page: pagePath,
      // session_id is optional — client can pass it later if needed
    })
  } catch {
    // Best-effort: never propagate DB errors to the client
    return new NextResponse(null, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
