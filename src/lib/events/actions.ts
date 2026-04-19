"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth/supabase-auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  slugify,
  EVENT_CATEGORIAS,
  type BangEvent,
  type EventCategoria,
} from "./config"

// ─── Action result shape ─────────────────────────────────────────────────────

export interface EventActionResult {
  ok: boolean
  error: string | null
  event?: BangEvent
}

// ─── DB row → BangEvent (local copy to avoid cross-module import cycles) ─────

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

// ─── Field extraction from FormData ──────────────────────────────────────────

interface EventFields {
  nome: string
  categoria: EventCategoria
  cidade: string
  uf: string
  data: string
  dataFim?: string
  hora?: string
  venue?: string
  teaser?: string
  coverUrl?: string
  ticketUrl?: string
  destaque: boolean
  slug?: string
}

function extractFields(formData: FormData): EventFields | { validationError: string } {
  const nome = (formData.get("nome") as string | null)?.trim() ?? ""
  if (!nome) return { validationError: "Nome é obrigatório." }

  const categoria = (formData.get("categoria") as string | null) ?? ""
  if (!EVENT_CATEGORIAS.includes(categoria as EventCategoria)) {
    return { validationError: `Categoria inválida: "${categoria}". Use: ${EVENT_CATEGORIAS.join(", ")}.` }
  }

  const cidade = (formData.get("cidade") as string | null)?.trim() ?? ""
  if (!cidade) return { validationError: "Cidade é obrigatória." }

  const data = (formData.get("data") as string | null)?.trim() ?? ""
  if (!data) return { validationError: "Data é obrigatória." }

  const dataFim = (formData.get("dataFim") as string | null)?.trim() || undefined
  if (dataFim && dataFim < data) {
    return { validationError: "Data fim deve ser igual ou posterior à data de início." }
  }

  const uf = (formData.get("uf") as string | null)?.trim() ?? ""
  const hora = (formData.get("hora") as string | null)?.trim() || undefined
  const venue = (formData.get("venue") as string | null)?.trim() || undefined
  const teaser = (formData.get("teaser") as string | null)?.trim() || undefined
  const coverUrl = (formData.get("coverUrl") as string | null)?.trim() || undefined
  const ticketUrl = (formData.get("ticketUrl") as string | null)?.trim() || undefined
  const destaque = formData.get("destaque") === "true"
  const slug = (formData.get("slug") as string | null)?.trim() || undefined

  return {
    nome,
    categoria: categoria as EventCategoria,
    cidade,
    uf,
    data,
    dataFim,
    hora,
    venue,
    teaser,
    coverUrl,
    ticketUrl,
    destaque,
    slug,
  }
}

/** Generates a slug that doesn't conflict with existing rows.
 *  Strategy: try `base`, then `base-<timestamp-hex>` once if taken. */
async function resolveSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const supabase = await createSupabaseServerClient()

  let query = supabase.from("events").select("id").eq("slug", base)
  if (excludeId) query = query.neq("id", excludeId)

  const { data } = await query.maybeSingle()

  if (!data) return base

  // Collision: append timestamp in hex to guarantee uniqueness without a loop.
  return `${base}-${Date.now().toString(16)}`
}

// ─── Paths that need to be revalidated on any mutation ───────────────────────

function revalidateAll() {
  revalidatePath("/eventos")
  revalidatePath("/dashboard/eventos")
  revalidatePath("/")
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createEvent(
  _prevState: EventActionResult,
  formData: FormData,
): Promise<EventActionResult> {
  await requireUser()

  const fields = extractFields(formData)
  if ("validationError" in fields) {
    return { ok: false, error: fields.validationError }
  }

  const base = fields.slug ? slugify(fields.slug) : slugify(fields.nome)
  const resolvedSlug = await resolveSlug(`${base}-${fields.data}`)

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .insert({
      slug: resolvedSlug,
      nome: fields.nome,
      categoria: fields.categoria,
      cidade: fields.cidade,
      uf: fields.uf,
      data: fields.data,
      data_fim: fields.dataFim ?? null,
      hora: fields.hora ?? null,
      venue: fields.venue ?? null,
      teaser: fields.teaser ?? null,
      cover_url: fields.coverUrl ?? null,
      ticket_url: fields.ticketUrl ?? null,
      destaque: fields.destaque,
    })
    .select()
    .single()

  if (error) {
    console.error("[events/actions] createEvent:", error.message)
    return { ok: false, error: "Erro ao criar evento. Tente novamente." }
  }

  revalidateAll()
  return { ok: true, error: null, event: rowToEvent(data as EventRow) }
}

export async function updateEvent(
  id: string,
  _prevState: EventActionResult,
  formData: FormData,
): Promise<EventActionResult> {
  await requireUser()

  const fields = extractFields(formData)
  if ("validationError" in fields) {
    return { ok: false, error: fields.validationError }
  }

  // Re-slugify only if the slug field was explicitly provided and changed.
  const base = fields.slug ? slugify(fields.slug) : slugify(fields.nome)
  const resolvedSlug = await resolveSlug(`${base}-${fields.data}`, id)

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .update({
      slug: resolvedSlug,
      nome: fields.nome,
      categoria: fields.categoria,
      cidade: fields.cidade,
      uf: fields.uf,
      data: fields.data,
      data_fim: fields.dataFim ?? null,
      hora: fields.hora ?? null,
      venue: fields.venue ?? null,
      teaser: fields.teaser ?? null,
      cover_url: fields.coverUrl ?? null,
      ticket_url: fields.ticketUrl ?? null,
      destaque: fields.destaque,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[events/actions] updateEvent:", error.message)
    return { ok: false, error: "Erro ao atualizar evento. Tente novamente." }
  }

  revalidateAll()
  return { ok: true, error: null, event: rowToEvent(data as EventRow) }
}

export async function deleteEvent(id: string): Promise<EventActionResult> {
  await requireUser()

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("[events/actions] deleteEvent:", error.message)
    return { ok: false, error: "Erro ao remover evento. Tente novamente." }
  }

  revalidateAll()
  return { ok: true, error: null }
}

/** Convenience action for toggling destaque without a full form round-trip. */
export async function toggleEventDestaque(id: string, destaque: boolean): Promise<EventActionResult> {
  await requireUser()

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .update({ destaque })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[events/actions] toggleEventDestaque:", error.message)
    return { ok: false, error: "Erro ao atualizar destaque." }
  }

  revalidateAll()
  return { ok: true, error: null, event: rowToEvent(data as EventRow) }
}
