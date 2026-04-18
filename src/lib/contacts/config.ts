/**
 * Single WhatsApp channel per CTA category. One number = one link, reused
 * across every button in that category (Header, Revenda section, Eventos
 * section, Footer, CTA section cards).
 *
 * Stored in localStorage via the dashboard "Contatos" tab. No backend yet —
 * staff edits are per-browser previews until the API is plugged in.
 */

const KEY = "bb_contacts_v1"

export interface ContactsConfig {
  /** Bares, restaurantes, mercados, conveniências, etc. */
  whatsappRevenda: string
  /** Distribuição regional — comercial / logística / exclusividade. */
  whatsappDistribuidor: string
  /** Produtores de evento, ativação de marca. */
  whatsappEventos: string
  /** Optional custom WhatsApp link — when set, overrides the number-derived wa.me URL. */
  linkRevenda: string
  linkDistribuidor: string
  linkEventos: string
}

export const DEFAULT_CONTACTS: ContactsConfig = {
  whatsappRevenda: "",
  whatsappDistribuidor: "",
  whatsappEventos: "",
  linkRevenda: "",
  linkDistribuidor: "",
  linkEventos: "",
}

// Pre-fill messages live in code — staff doesn't need to edit these.
export const MSG_REVENDA = "Olá! Quero revender Bang Bang."
export const MSG_DISTRIBUIDOR = "Olá! Quero conversar sobre distribuição Bang Bang."
export const MSG_EVENTOS = "Olá! Quero Bang Bang no meu evento."

// ----------------- storage -----------------
export function readContacts(): ContactsConfig {
  if (typeof window === "undefined") return DEFAULT_CONTACTS
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return DEFAULT_CONTACTS
    const parsed = JSON.parse(raw) as Partial<ContactsConfig>
    return { ...DEFAULT_CONTACTS, ...parsed }
  } catch {
    return DEFAULT_CONTACTS
  }
}

export function writeContacts(next: ContactsConfig): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function resetContacts(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export const CONTACTS_STORAGE_KEY = KEY
