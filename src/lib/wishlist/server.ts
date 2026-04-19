import { createSupabaseServerClient } from "@/lib/supabase/server"
import { rankCitiesByDemand, type CityRequest, type CityRankRow } from "./config"
import type { UF } from "@/lib/types/pdv"

// Server-side data access for wishlist_requests. Import only from Server
// Components and Server Actions — never from "use client" files.
//
// RLS: SELECT is admin-only (is_admin() = auth.uid()-is-in-profiles-with-
// role-admin). Callers must already be authenticated; the dashboard layout
// enforces that upstream via requireUser().

interface DbRow {
  id: string
  nome: string
  whatsapp: string
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  created_at: string
}

function rowToCityRequest(row: DbRow): CityRequest {
  return {
    id: row.id,
    nome: row.nome,
    whatsapp: row.whatsapp,
    cep: row.cep,
    endereco: row.endereco,
    numero: row.numero,
    complemento: row.complemento,
    bairro: row.bairro,
    cidade: row.cidade,
    uf: row.uf as UF | "",
    createdAt: row.created_at,
  }
}

export async function getWishlistRequests(): Promise<CityRequest[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("wishlist_requests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[wishlist/server] getWishlistRequests error:", error.message)
    return []
  }

  return (data as DbRow[]).map(rowToCityRequest)
}

export function getWishlistRankings(
  requests: readonly CityRequest[],
): CityRankRow[] {
  return rankCitiesByDemand(requests)
}
