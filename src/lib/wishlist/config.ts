/**
 * City-request "wishlist" — types, constants, and pure helpers.
 * Storage is now Supabase (see server.ts + actions.ts).
 */

import type { UF } from "@/lib/types/pdv"

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
