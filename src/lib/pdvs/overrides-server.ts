/**
 * Server-side reader for the pdv_overrides singleton row.
 *
 * Returns the in-memory camelCase shape that the rest of the app expects.
 * JSONB columns arrive in snake_case from Postgres; we normalise here so no
 * consumer ever deals with the DB column names.
 *
 * Uses createSupabaseServerClient so it works in Server Components, Route
 * Handlers, and Server Actions. SELECT is permitted by the public RLS policy
 * (no auth required for reads).
 */
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { EMPTY_OVERRIDES, type PDVOverrides } from "./overrides"
import type { PDV } from "@/lib/types/pdv"

interface DBRow {
  added: PDV[]
  edited: Record<string, Partial<PDV>>
  deleted_ids: string[]
  created_at_map: Record<string, string>
}

function rowToOverrides(row: DBRow): PDVOverrides {
  return {
    added: Array.isArray(row.added) ? row.added : [],
    edited:
      row.edited && typeof row.edited === "object"
        ? (row.edited as Record<string, Partial<PDV>>)
        : {},
    deletedIds: Array.isArray(row.deleted_ids) ? row.deleted_ids : [],
    createdAt:
      row.created_at_map && typeof row.created_at_map === "object"
        ? (row.created_at_map as Record<string, string>)
        : {},
  }
}

export async function getPDVOverrides(): Promise<PDVOverrides> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (
    !url ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    url.includes("127.0.0.1") ||
    url.includes("localhost")
  ) {
    return EMPTY_OVERRIDES
  }
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("pdv_overrides")
      .select("added, edited, deleted_ids, created_at_map")
      .eq("id", true)
      .single<DBRow>()

    if (error || !data) return EMPTY_OVERRIDES
    return rowToOverrides(data)
  } catch {
    return EMPTY_OVERRIDES
  }
}
