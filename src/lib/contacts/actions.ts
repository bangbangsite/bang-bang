"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/supabase-auth"
import type { ContactsConfig } from "./config"

export interface SaveContactsResult {
  ok: boolean
  error?: string
}

// Update the singleton contact_channels row. Admin-only.
// We use .update() (not .upsert()) because the row is guaranteed to exist —
// migration 20260418000001 seeds id=true on every environment, and our RLS
// grants UPDATE but not INSERT on this table.
export async function saveContactChannels(
  config: ContactsConfig,
): Promise<SaveContactsResult> {
  await requireUser()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("contact_channels")
    .update({
      whatsapp_revenda: config.whatsappRevenda,
      whatsapp_distribuidor: config.whatsappDistribuidor,
      whatsapp_eventos: config.whatsappEventos,
      link_revenda: config.linkRevenda,
      link_distribuidor: config.linkDistribuidor,
      link_eventos: config.linkEventos,
    })
    .eq("id", true)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/")
  revalidatePath("/dashboard/contatos")

  return { ok: true }
}
