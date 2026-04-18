// Single source of truth for every localStorage key the site owns while the
// Supabase migration isn't done. Keeping them centralized means the reset
// button and any future audit tool don't drift from the actual storage.
//
// `bb_staff_session_v1` is intentionally NOT listed — zeroing the data
// shouldn't kick the admin out of the dashboard. When auth moves to
// Supabase this file only needs its post-clear reload behavior updated.

export const DEMO_STORAGE_KEYS = [
  // Wishlist (pedidos de cidade) + demo seed flag
  "bb_wishlist_v1",
  "bb_wishlist_demo_seeded",

  // Contacts (canais de WhatsApp)
  "bb_contacts_v1",

  // CTA click counters
  "bb_cta_clicks_v1",

  // Eventos
  "bb_events_v1",
  "bb_events_demo_seeded_v2",

  // Bangers (lista interna de candidatos)
  "bb_bangers_v1",
  "bb_bangers_demo_seeded",

  // PDV overrides + IO log
  "bb_pdv_overrides_v1",
  "bb_pdv_io_log_v1",

  // FAQ
  "bb_faq_v1",
] as const

export function clearAllDemoData(): void {
  if (typeof window === "undefined") return
  for (const key of DEMO_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // localStorage may throw in private mode / quota — swallow and keep
      // clearing the others so the reset is partially successful.
    }
  }
}
