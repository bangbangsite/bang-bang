import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { BangerApplication, BangerStatus, BangerRede } from "./config"

// ---------------------------------------------------------------------------
// Row shape returned by Supabase (snake_case columns + JSONB redes)
// ---------------------------------------------------------------------------
interface BangerRow {
  id: string
  nome: string
  email: string
  whatsapp: string
  cidade: string
  uf: string
  nicho: BangerApplication["nicho"]
  redes: BangerRede[] // stored as JSONB, Supabase returns it parsed
  motivacao: string
  status: BangerStatus
  favorito: boolean
  notas: string
  created_at: string
  updated_at: string | null
}

function rowToApplication(row: BangerRow): BangerApplication {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    whatsapp: row.whatsapp,
    cidade: row.cidade,
    uf: row.uf,
    nicho: row.nicho,
    redes: Array.isArray(row.redes) ? row.redes : [],
    motivacao: row.motivacao,
    status: row.status,
    favorito: row.favorito,
    notas: row.notas,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ---------------------------------------------------------------------------
// Queries — called from Server Components only
// ---------------------------------------------------------------------------

/** Full list ordered newest-first. Admin-only (SELECT policy via is_admin()). */
export async function getBangers(): Promise<BangerApplication[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("bangers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[bangers/server] getBangers:", error.message)
    return []
  }

  return (data as BangerRow[]).map(rowToApplication)
}

/** Count of applications with status = 'novo'. Admin-only. */
export async function getNovosBangersCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("bangers")
    .select("id", { count: "exact", head: true })
    .eq("status", "novo")

  if (error) {
    console.error("[bangers/server] getNovosBangersCount:", error.message)
    return 0
  }

  return count ?? 0
}

/** Single application by id. Admin-only. */
export async function getBangerById(id: string): Promise<BangerApplication | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("bangers")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("[bangers/server] getBangerById:", error.message)
    return null
  }

  return data ? rowToApplication(data as BangerRow) : null
}
