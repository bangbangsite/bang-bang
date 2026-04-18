/**
 * City-request "wishlist" — consumers filling out the form on
 * /onde-encontrar when they don't find a PDV in their city. Stored in
 * localStorage until a backend is plugged in. Staff reads these in the
 * dashboard (/dashboard/solicitacoes) and ranks demand per city.
 */

import type { UF } from "@/lib/types/pdv"

const KEY = "bb_wishlist_v1"

export interface CityRequest {
  id: string
  /** Display name — required. */
  nome: string
  /** Raw input the user typed. Normalization happens in helpers. */
  whatsapp: string
  /** Digits-only CEP, may be empty if user skipped CEP lookup. */
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: UF | ""
  /** ISO timestamp. */
  createdAt: string
}

export const EMPTY_REQUEST: Omit<CityRequest, "id" | "createdAt"> = {
  nome: "",
  whatsapp: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
}

// ----------------- storage -----------------
export function readWishlist(): CityRequest[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidRequest)
  } catch {
    return []
  }
}

export function writeWishlist(next: CityRequest[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota errors — storage is best-effort */
  }
}

export function resetWishlist(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export const WISHLIST_STORAGE_KEY = KEY

// ----------------- helpers -----------------

function isValidRequest(v: unknown): v is CityRequest {
  if (!v || typeof v !== "object") return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === "string" &&
    typeof r.nome === "string" &&
    typeof r.whatsapp === "string" &&
    typeof r.createdAt === "string"
  )
}

/** Generate a stable-ish id for a new request. */
export function newRequestId(): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `req-${Date.now().toString(36)}-${rand}`
}

/** Ranking row used by the dashboard widget + stats. */
export interface CityRankRow {
  cidade: string
  uf: UF | ""
  count: number
  cep?: string
}

/**
 * Aggregate requests by city+uf. Ties are broken by most-recent request first
 * (so a city with 3 brand-new votes outranks 3 stale ones).
 */
export function rankCitiesByDemand(
  requests: readonly CityRequest[],
): CityRankRow[] {
  const map = new Map<string, { row: CityRankRow; latestAt: string }>()
  for (const r of requests) {
    const city = (r.cidade || "").trim()
    const uf = r.uf
    // Fall back to CEP when city was not resolved — still lets us rank.
    const key = city ? `${city.toLowerCase()}|${uf}` : `cep:${r.cep}`
    const existing = map.get(key)
    if (existing) {
      existing.row.count += 1
      if (r.createdAt > existing.latestAt) existing.latestAt = r.createdAt
    } else {
      map.set(key, {
        row: { cidade: city || "Cidade sem nome", uf, count: 1, cep: r.cep || undefined },
        latestAt: r.createdAt,
      })
    }
  }
  return [...map.values()]
    .sort((a, b) => {
      if (b.row.count !== a.row.count) return b.row.count - a.row.count
      return a.latestAt < b.latestAt ? 1 : -1
    })
    .map((v) => v.row)
}
