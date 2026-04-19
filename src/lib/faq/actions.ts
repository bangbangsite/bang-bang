"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/supabase-auth"
import { DEFAULT_FAQ, MAX_FAQ_ITEMS, type FAQItem } from "./config"

export interface FAQActionResult {
  ok: boolean
  error?: string
}

function revalidate() {
  revalidatePath("/")
  revalidatePath("/dashboard/faq")
}

/** Add a new FAQ item at the end of the list. Admin-only. */
export async function addFaqItem(
  input: Pick<FAQItem, "question" | "answer">,
): Promise<FAQActionResult> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  // Count current items to enforce app-layer max.
  const { count } = await supabase
    .from("faq_items")
    .select("id", { count: "exact", head: true })

  if ((count ?? 0) >= MAX_FAQ_ITEMS) {
    return { ok: false, error: `Limite de ${MAX_FAQ_ITEMS} perguntas atingido.` }
  }

  // Position = current max + 1 so the new item goes to the end.
  const { data: maxRow } = await supabase
    .from("faq_items")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single()

  const nextPosition = maxRow ? (maxRow.position as number) + 1 : 0

  const { error } = await supabase.from("faq_items").insert({
    question: input.question,
    answer: input.answer,
    position: nextPosition,
  })

  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}

/** Update question/answer of an existing FAQ item. Admin-only. */
export async function updateFaqItem(
  id: string,
  patch: Partial<Pick<FAQItem, "question" | "answer">>,
): Promise<FAQActionResult> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("faq_items")
    .update(patch)
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}

/** Delete a FAQ item by id. Admin-only. */
export async function removeFaqItem(id: string): Promise<FAQActionResult> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("faq_items").delete().eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}

/**
 * Swap positions of two adjacent items. Admin-only.
 * Fetches all items, swaps position values, and batch-updates.
 */
export async function swapFaqPositions(
  idA: string,
  idB: string,
): Promise<FAQActionResult> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { data, error: fetchError } = await supabase
    .from("faq_items")
    .select("id, position")
    .in("id", [idA, idB])

  if (fetchError || !data || data.length !== 2) {
    return { ok: false, error: "Não foi possível buscar os itens para reordenar." }
  }

  const [a, b] = data as { id: string; position: number }[]

  const { error: errA } = await supabase
    .from("faq_items")
    .update({ position: b.position })
    .eq("id", a.id)

  if (errA) return { ok: false, error: errA.message }

  const { error: errB } = await supabase
    .from("faq_items")
    .update({ position: a.position })
    .eq("id", b.id)

  if (errB) return { ok: false, error: errB.message }

  revalidate()
  return { ok: true }
}

/**
 * Reset FAQ back to the seeded defaults: delete all current rows and
 * re-insert the default set. Admin-only.
 */
export async function resetFaqToDefaults(): Promise<FAQActionResult> {
  await requireUser()
  const supabase = await createSupabaseServerClient()

  const { error: delError } = await supabase
    .from("faq_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000") // delete all rows

  if (delError) return { ok: false, error: delError.message }

  const rows = DEFAULT_FAQ.map((item) => ({
    question: item.question,
    answer: item.answer,
    position: item.position,
  }))

  const { error: insertError } = await supabase.from("faq_items").insert(rows)

  if (insertError) return { ok: false, error: insertError.message }

  revalidate()
  return { ok: true }
}
