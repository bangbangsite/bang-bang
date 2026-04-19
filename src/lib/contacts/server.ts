import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DEFAULT_CONTACTS, type ContactsConfig } from "./config"

/** Fetch the singleton contact_channels row. Falls back to defaults on error. */
export async function getContactChannels(): Promise<ContactsConfig> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("contact_channels")
    .select(
      "whatsapp_revenda, whatsapp_distribuidor, whatsapp_eventos, link_revenda, link_distribuidor, link_eventos",
    )
    .single()

  if (error || !data) return DEFAULT_CONTACTS

  return {
    whatsappRevenda: data.whatsapp_revenda,
    whatsappDistribuidor: data.whatsapp_distribuidor,
    whatsappEventos: data.whatsapp_eventos,
    linkRevenda: data.link_revenda,
    linkDistribuidor: data.link_distribuidor,
    linkEventos: data.link_eventos,
  }
}
