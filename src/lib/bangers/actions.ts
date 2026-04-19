"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/supabase-auth"
import type { BangerStatus } from "./config"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubmitBangerState {
  ok: boolean
  error?: string
  bangerId?: string
}

// ---------------------------------------------------------------------------
// Public — no auth required (RLS allows anon insert)
// ---------------------------------------------------------------------------

/**
 * Handles the /seja-um-banger public form submission.
 * Compatible with useActionState(submitBangerApplication, INITIAL_STATE).
 *
 * Redes are serialised as JSON in a hidden input because the form's complex
 * multi-platform UI is managed in React state client-side — we stringify
 * before submitting and parse here.
 */
export async function submitBangerApplication(
  _prev: SubmitBangerState,
  formData: FormData,
): Promise<SubmitBangerState> {
  const nome = (formData.get("nome") as string | null)?.trim() ?? ""
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const whatsapp = (formData.get("whatsapp") as string | null)?.trim() ?? ""
  const cidade = (formData.get("cidade") as string | null)?.trim() ?? ""
  const uf = (formData.get("uf") as string | null)?.trim().toUpperCase() ?? ""
  const nicho = (formData.get("nicho") as string | null)?.trim() ?? ""
  const motivacao = (formData.get("motivacao") as string | null)?.trim() ?? ""
  const redesRaw = (formData.get("redes") as string | null) ?? "[]"

  // Validate required fields
  if (!nome) return { ok: false, error: "Nome é obrigatório." }
  if (!email || !email.includes("@")) return { ok: false, error: "E-mail inválido." }
  if (!cidade) return { ok: false, error: "Cidade é obrigatória." }
  if (!nicho) return { ok: false, error: "Nicho é obrigatório." }

  // Parse and validate redes JSONB
  let redes: unknown
  try {
    redes = JSON.parse(redesRaw)
  } catch {
    return { ok: false, error: "Erro ao processar suas redes sociais." }
  }

  if (!Array.isArray(redes) || redes.length === 0) {
    return { ok: false, error: "Informe ao menos uma rede social." }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("bangers")
    .insert({
      nome,
      email,
      whatsapp,
      cidade,
      uf,
      nicho,
      redes,
      motivacao,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[bangers/actions] submitBangerApplication:", error.message)
    return { ok: false, error: "Erro ao salvar sua candidatura. Tente novamente." }
  }

  return { ok: true, bangerId: data.id }
}

// ---------------------------------------------------------------------------
// Admin mutations — require authenticated user + RLS via is_admin()
// ---------------------------------------------------------------------------

export async function updateBangerStatus(id: string, status: BangerStatus): Promise<void> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("bangers")
    .update({ status })
    .eq("id", id)

  if (error) console.error("[bangers/actions] updateBangerStatus:", error.message)

  revalidatePath("/dashboard/bangers")
  revalidatePath("/dashboard")
}

export async function toggleBangerFavorito(id: string, next: boolean): Promise<void> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("bangers")
    .update({ favorito: next })
    .eq("id", id)

  if (error) console.error("[bangers/actions] toggleBangerFavorito:", error.message)

  revalidatePath("/dashboard/bangers")
  revalidatePath("/dashboard")
}

export async function updateBangerNotas(id: string, notas: string): Promise<void> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("bangers")
    .update({ notas })
    .eq("id", id)

  if (error) console.error("[bangers/actions] updateBangerNotas:", error.message)

  revalidatePath("/dashboard/bangers")
  revalidatePath("/dashboard")
}

export async function deleteBanger(id: string): Promise<void> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("bangers")
    .delete()
    .eq("id", id)

  if (error) console.error("[bangers/actions] deleteBanger:", error.message)

  revalidatePath("/dashboard/bangers")
  revalidatePath("/dashboard")
}
