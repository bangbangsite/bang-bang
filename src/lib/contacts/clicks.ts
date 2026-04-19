/**
 * Client-side CTA click tracking.
 *
 * Public API surface is unchanged so all call-sites (Header, Footer,
 * CTASection, RevendaSection, EventosSection) work without modification.
 *
 * Implementation swapped from localStorage to a fire-and-forget POST to
 * /api/clicks, which inserts a row into Supabase `click_events`.
 * `keepalive: true` keeps the request alive through page navigations,
 * equivalent to navigator.sendBeacon() but with a JSON body.
 */

export type CTACategory = "revenda" | "distribuidor" | "eventos"

const VALID_CATEGORIES = new Set<string>(["revenda", "distribuidor", "eventos"])

/**
 * Fire-and-forget click tracker. Call in CTA onClick handlers.
 * Never throws, never awaits — best-effort only.
 */
export function trackClick(category: CTACategory): void {
  if (typeof window === "undefined") return
  if (!VALID_CATEGORIES.has(category)) return

  const page = window.location.pathname

  // keepalive ensures the request completes even if the user navigates away
  // immediately after clicking (common for WhatsApp deep-link CTAs).
  // Errors are intentionally swallowed — this is best-effort telemetry.
  fetch("/api/clicks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, page }),
    keepalive: true,
  }).catch(() => {
    // Silently ignore network errors — never pollute the console.
  })
}
