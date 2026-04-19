"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

type CTACategoryKey = "revenda" | "distribuidor" | "eventos"

const VALID_CATEGORIES = new Set<string>(["revenda", "distribuidor", "eventos"])

/**
 * Server Action: record a single CTA click.
 *
 * Prefer the Route Handler (`POST /api/clicks`) for client-side fire-and-forget
 * since Server Actions carry navigation overhead. This action exists for
 * server-side contexts (e.g., future form submissions) where fetch isn't natural.
 *
 * RLS on click_events allows public INSERT — no auth needed.
 */
export async function recordClick(
  category: CTACategoryKey,
  page?: string,
): Promise<{ ok: boolean }> {
  if (!VALID_CATEGORIES.has(category)) {
    return { ok: false }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from("click_events").insert({
      category,
      page: page?.slice(0, 255) ?? null,
    })
    if (error) return { ok: false }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
