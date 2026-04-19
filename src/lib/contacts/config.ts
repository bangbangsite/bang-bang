/**
 * Single WhatsApp channel per CTA category. One number = one link, reused
 * across every button in that category (Header, Revenda section, Eventos
 * section, Footer, CTA section cards).
 *
 * Data is fetched from Supabase (contact_channels table, singleton row).
 */

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
