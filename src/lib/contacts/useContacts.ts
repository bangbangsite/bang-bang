"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  CONTACTS_STORAGE_KEY,
  DEFAULT_CONTACTS,
  readContacts,
  writeContacts,
  resetContacts,
  MSG_REVENDA,
  MSG_DISTRIBUIDOR,
  MSG_EVENTOS,
  type ContactsConfig,
} from "./config"

// External store so every component reading contacts stays in sync.
let snapshot: ContactsConfig | null = null
const listeners = new Set<() => void>()

function getSnapshot(): ContactsConfig {
  if (snapshot === null) snapshot = readContacts()
  return snapshot
}
function getServerSnapshot(): ContactsConfig {
  return DEFAULT_CONTACTS
}
function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  const storageListener = (e: StorageEvent) => {
    if (e.key === CONTACTS_STORAGE_KEY) {
      snapshot = readContacts()
      for (const l of listeners) l()
    }
  }
  window.addEventListener("storage", storageListener)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", storageListener)
  }
}
function commit(next: ContactsConfig): void {
  snapshot = next
  writeContacts(next)
  for (const l of listeners) l()
}

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
  update: (patch: Partial<ContactsConfig>) => void
  reset: () => void
  /** Resolved URLs per category — already includes the default message. */
  urls: {
    revenda: string
    distribuidor: string
    eventos: string
  }
  hasAnyConfigured: boolean
}

export function useContacts(): UseContactsApi {
  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const update = useCallback((patch: Partial<ContactsConfig>) => {
    commit({ ...getSnapshot(), ...patch })
  }, [])

  const reset = useCallback(() => {
    resetContacts()
    snapshot = DEFAULT_CONTACTS
    for (const l of listeners) l()
  }, [])

  const urls = {
    revenda: resolveChannelUrl(config.linkRevenda, config.whatsappRevenda, MSG_REVENDA),
    distribuidor: resolveChannelUrl(config.linkDistribuidor, config.whatsappDistribuidor, MSG_DISTRIBUIDOR),
    eventos: resolveChannelUrl(config.linkEventos, config.whatsappEventos, MSG_EVENTOS),
  }

  const hasAnyConfigured = Boolean(
    urls.revenda || urls.distribuidor || urls.eventos,
  )

  return { config, update, reset, urls, hasAnyConfigured }
}
