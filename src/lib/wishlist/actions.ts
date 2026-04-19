"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/supabase-auth"

export interface WishlistActionState {
  ok: boolean
  error: string | null
}

/**
 * Public Server Action — anyone can submit a city request (RLS allows anon INSERT).
 * Validates the minimum required fields before hitting the DB.
 */
export async function submitWishlistRequest(
  _prev: WishlistActionState,
  formData: FormData,
): Promise<WishlistActionState> {
  const nome = (formData.get("nome") as string | null)?.trim() ?? ""
  const whatsapp = (formData.get("whatsapp") as string | null) ?? ""
  const cep = ((formData.get("cep") as string | null) ?? "").replace(/\D/g, "")
  const endereco = (formData.get("endereco") as string | null) ?? ""
  const numero = (formData.get("numero") as string | null) ?? ""
  const complemento = (formData.get("complemento") as string | null) ?? ""
  const bairro = (formData.get("bairro") as string | null) ?? ""
  const cidade = (formData.get("cidade") as string | null) ?? ""
  const uf = (formData.get("uf") as string | null) ?? ""

  if (!nome) {
    return { ok: false, error: "Nome é obrigatório." }
  }

  if (uf && uf.length !== 2) {
    return { ok: false, error: "UF inválida — use a sigla com 2 letras." }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("wishlist_requests").insert({
    nome,
    whatsapp,
    cep,
    endereco,
    numero,
    complemento,
    bairro,
    cidade,
    uf: uf.toUpperCase(),
  })

  if (error) {
    console.error("[wishlist/actions] submitWishlistRequest error:", error.message)
    return {
      ok: false,
      error: "Não conseguimos registrar seu pedido agora. Tenta de novo em instantes.",
    }
  }

  return { ok: true, error: null }
}

// Admin Server Action — deletes a single wishlist request by id.
// requireUser() redirects to /login if there is no session; the RLS
// delete-admin policy then authorizes the actual delete.
export async function deleteWishlistRequest(id: string): Promise<WishlistActionState> {
  if (!id) {
    return { ok: false, error: "ID inválido." }
  }

  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("wishlist_requests")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[wishlist/actions] deleteWishlistRequest error:", error.message)
    return { ok: false, error: "Não foi possível remover a solicitação." }
  }

  revalidatePath("/dashboard/solicitacoes")
  revalidatePath("/dashboard")
  return { ok: true, error: null }
}
