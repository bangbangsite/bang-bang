/**
 * Public-facing events catalog — types, constants and pure helpers.
 * No localStorage, no side effects. Consumed by server.ts, actions.ts,
 * and any Client Components that need the type definitions.
 */

import type { UF } from "@/lib/types/pdv"

export type EventCategoria =
  | "Festa"
  | "Show"
  | "Festival"
  | "Rooftop"
  | "Ativação"

export const EVENT_CATEGORIAS: EventCategoria[] = [
  "Festa",
  "Show",
  "Festival",
  "Rooftop",
  "Ativação",
]

export interface BangEvent {
  id: string
  /** URL-friendly slug — used for the future internal event page. */
  slug: string
  nome: string
  categoria: EventCategoria
  cidade: string
  uf: UF | ""
  /** YYYY-MM-DD */
  data: string
  /** YYYY-MM-DD — optional end date (multi-day events). */
  dataFim?: string
  /** HH:MM (24h) */
  hora?: string
  /** Name of the venue (ex: "Arena XP"). Optional. */
  venue?: string
  /** Short teaser shown on the card. Optional. */
  teaser?: string
  /** Absolute URL of the cover image. Empty/undefined → generated placeholder. */
  coverUrl?: string
  /** When present, the card shows a "Comprar ingresso" CTA pointing here. */
  ticketUrl?: string
  /** Marks the event as featured on the home / top of the list. */
  destaque?: boolean
  /** ISO timestamp. */
  createdAt: string
}

export const EMPTY_EVENT: Omit<BangEvent, "id" | "createdAt" | "slug"> = {
  nome: "",
  categoria: "Festa",
  cidade: "",
  uf: "",
  data: "",
  hora: "",
  venue: "",
  teaser: "",
  coverUrl: "",
  ticketUrl: "",
  destaque: false,
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

/** Events whose last relevant day (data or dataFim) is today or later. */
export function isUpcoming(e: BangEvent, now = new Date()): boolean {
  const end = e.dataFim || e.data
  if (!end) return false
  const todayIso = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString().slice(0, 10)
  return end >= todayIso
}

/** Sort: featured first, then ascending by date (nearest first). */
export function sortForListing(events: readonly BangEvent[]): BangEvent[] {
  return [...events].sort((a, b) => {
    if (Boolean(a.destaque) !== Boolean(b.destaque)) return a.destaque ? -1 : 1
    return a.data.localeCompare(b.data)
  })
}
