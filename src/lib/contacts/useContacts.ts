"use client"

import { useCallback, useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  DEFAULT_CONTACTS,
  MSG_REVENDA,
  MSG_DISTRIBUIDOR,
  MSG_EVENTOS,
  type ContactsConfig,
} from "./config"

// ----------------- URL builder -----------------

/**
 * Normalize a Brazilian phone input ("(31) 99999-9999", "31999999999",
 * "5531999999999") into the digits-only international form that wa.me wants.
 */
export function normalizeWhatsApp(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "")
  if (!digits) return ""
  if (digits.length === 10 || digits.length === 11) return "55" + digits
  return digits
}

/** Build a wa.me URL, or empty string if the phone is missing. */
export function whatsappUrl(phone: string, message = ""): string {
  const num = normalizeWhatsApp(phone)
  if (!num) return ""
  const qs = message ? `?text=${encodeURIComponent(message)}` : ""
  return `https://wa.me/${num}${qs}`
}

/**
 * Sanitize a user-provided custom link. Accepts http(s) URLs only (covers wa.me,
 * api.whatsapp.com, chat.whatsapp.com, and vanity short links). Empty/invalid → "".
 */
export function normalizeCustomLink(raw: string): string {
  const s = (raw ?? "").trim()
  if (!s) return ""
  if (/^https?:\/\//i.test(s)) return s
  return ""
}

/** Resolve category URL: custom link wins if set, otherwise number-derived wa.me. */
export function resolveChannelUrl(customLink: string, phone: string, message = ""): string {
  const custom = normalizeCustomLink(customLink)
  if (custom) return custom
  return whatsappUrl(phone, message)
}

// ----------------- hook -----------------

export interface UseContactsApi {
  config: ContactsConfig
  /** Whether a fetch is in progress (initial load). */
  loading: boolean
  /** Resolved URLs per category — already includes the default message. */
  urls: {
    revenda: string
    distribuidor: string
    eventos: string
  }
  hasAnyConfigured: boolean
}

/** Fetch contact_channels once on mount. RLS allows anonymous SELECT. */
export function useContacts(): UseContactsApi {
  const [config, setConfig] = useState<ContactsConfig>(DEFAULT_CONTACTS)
  const [loading, setLoading] = useState(true)

  const fetchChannels = useCallback(async () => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("contact_channels")
      .select(
        "whatsapp_revenda, whatsapp_distribuidor, whatsapp_eventos, link_revenda, link_distribuidor, link_eventos",
      )
      .single()

    if (!error && data) {
      setConfig({
        whatsappRevenda: data.whatsapp_revenda,
        whatsappDistribuidor: data.whatsapp_distribuidor,
        whatsappEventos: data.whatsapp_eventos,
        linkRevenda: data.link_revenda,
        linkDistribuidor: data.link_distribuidor,
        linkEventos: data.link_eventos,
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Fetch the singleton row on mount. setState inside an async chain is
    // legit here — we're syncing external (Supabase) state into React state,
    // which is exactly what useEffect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchChannels()
  }, [fetchChannels])

  const urls = {
    revenda: resolveChannelUrl(config.linkRevenda, config.whatsappRevenda, MSG_REVENDA),
    distribuidor: resolveChannelUrl(config.linkDistribuidor, config.whatsappDistribuidor, MSG_DISTRIBUIDOR),
    eventos: resolveChannelUrl(config.linkEventos, config.whatsappEventos, MSG_EVENTOS),
  }

  const hasAnyConfigured = Boolean(urls.revenda || urls.distribuidor || urls.eventos)

  return { config, loading, urls, hasAnyConfigured }
}
