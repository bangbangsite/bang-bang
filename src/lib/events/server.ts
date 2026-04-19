import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { BangEvent } from "./config"

// ─── DB row shape → BangEvent ───────────────────────────────────────────────
// The DB uses snake_case; BangEvent uses camelCase. This mapper is the single
// place that bridges the two worlds.
interface EventRow {
  id: string
  slug: string
  nome: string
  categoria: BangEvent["categoria"]
  cidade: string
  uf: string
  data: string
  data_fim: string | null
  hora: string | null
  venue: string | null
  teaser: string | null
  cover_url: string | null
  ticket_url: string | null
  destaque: boolean
  created_at: string
  updated_at: string
}

function rowToEvent(row: EventRow): BangEvent {
  return {
    id: row.id,
    slug: row.slug,
    nome: row.nome,
    categoria: row.categoria,
    cidade: row.cidade,
    uf: row.uf as BangEvent["uf"],
    data: row.data,
    dataFim: row.data_fim ?? undefined,
    hora: row.hora ?? undefined,
    venue: row.venue ?? undefined,
    teaser: row.teaser ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    ticketUrl: row.ticket_url ?? undefined,
    destaque: row.destaque,
    createdAt: row.created_at,
  }
}

/** Today's date in YYYY-MM-DD, evaluated server-side at request time. */
function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** All events ordered by start date ascending. Used by the admin list. */
export async function getEvents(): Promise<BangEvent[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("data", { ascending: true })

  if (error) {
    console.error("[events/server] getEvents:", error.message)
    return []
  }

  return (data as EventRow[]).map(rowToEvent)
}

/**
 * Events whose end date (data_fim if set, otherwise data) is today or later,
 * ordered by start date ascending. Used by the public /eventos page and the
 * dashboard widget.
 *
 * The filter uses data_fim when present so a multi-day event that has already
 * started (but hasn't ended) still shows up.
 *
 * We filter in the DB using an OR so we push minimal data over the wire:
 *   (data_fim IS NOT NULL AND data_fim >= today)
 *   OR (data_fim IS NULL AND data >= today)
 */
export async function getUpcomingEvents(limit?: number): Promise<BangEvent[]> {
  const supabase = await createSupabaseServerClient()
  const today = todayISO()

  let query = supabase
    .from("events")
    .select("*")
    .or(`and(data_fim.is.null,data.gte.${today}),data_fim.gte.${today}`)
    .order("data", { ascending: true })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[events/server] getUpcomingEvents:", error.message)
    return []
  }

  return (data as EventRow[]).map(rowToEvent)
}

/**
 * Upcoming events with destaque=true. Used by home sections that need to
 * highlight featured events.
 */
export async function getHighlightEvents(): Promise<BangEvent[]> {
  const supabase = await createSupabaseServerClient()
  const today = todayISO()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("destaque", true)
    .or(`and(data_fim.is.null,data.gte.${today}),data_fim.gte.${today}`)
    .order("data", { ascending: true })

  if (error) {
    console.error("[events/server] getHighlightEvents:", error.message)
    return []
  }

  return (data as EventRow[]).map(rowToEvent)
}

/** Single event lookup by slug. Returns null if not found. */
export async function getEventBySlug(slug: string): Promise<BangEvent | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    // PGRST116 = "The result contains 0 rows" — not an unexpected error.
    if (error.code !== "PGRST116") {
      console.error("[events/server] getEventBySlug:", error.message)
    }
    return null
  }

  return rowToEvent(data as EventRow)
}
