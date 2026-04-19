"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/supabase-auth"
import type { ContactsConfig } from "./config"

export interface SaveContactsResult {
  ok: boolean
  error?: string
}

/** Upsert the singleton contact_channels row. Admin-only. */
export async function saveContactChannels(
  config: ContactsConfig,
): Promise<SaveContactsResult> {
  await requireUser()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("contact_channels").upsert({
    id: true,
    whatsapp_revenda: config.whatsappRevenda,
    whatsapp_distribuidor: config.whatsappDistribuidor,
    whatsapp_eventos: config.whatsappEventos,
    link_revenda: config.linkRevenda,
    link_distribuidor: config.linkDistribuidor,
    link_eventos: config.linkEventos,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/")
  revalidatePath("/dashboard/contatos")

  return { ok: true }
}
