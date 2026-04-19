// Source of truth for the localStorage keys the site still owns after the
// Phase 4 migration. Most features (contacts, wishlist, events, bangers,
// FAQ, PDV overrides, click events) now live in Supabase and are
// deliberately absent from this list — their reset happens in the DB.
//
// Auth lives in Supabase (HTTP-only cookies) and is untouched by this reset.

export const DEMO_STORAGE_KEYS = [
  // PDV import/export audit log (still client-side until we have a telemetry
  // pipeline for it).
  "bb_pdv_io_log_v1",
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
