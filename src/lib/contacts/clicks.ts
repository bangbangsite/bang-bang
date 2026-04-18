"use client"

/**
 * Click counter for the 3 CTA categories. All tracking is client-side in
 * localStorage — no backend. A real production rollout would swap this module
 * out for an analytics call (plausible / gtag / internal API).
 *
 * What's recorded, per category:
 *   - total clicks
 *   - timestamp of the most recent click
 *   - timestamp of the very first recorded click (used for "since X" context)
 */
import { useCallback, useSyncExternalStore } from "react"

const KEY = "bb_cta_clicks_v1"

export type CTACategory = "revenda" | "distribuidor" | "eventos"

export interface ClicksState {
  revenda: number
  distribuidor: number
  eventos: number
  lastRevenda: string | null
  lastDistribuidor: string | null
  lastEventos: string | null
  /** When the counter was first touched — anchor for "registrando desde" label. */
  firstAt: string | null
}

export const EMPTY_CLICKS: ClicksState = {
  revenda: 0,
  distribuidor: 0,
  eventos: 0,
  lastRevenda: null,
  lastDistribuidor: null,
  lastEventos: null,
  firstAt: null,
}

// ---------------- storage ----------------
function readStorage(): ClicksState {
  if (typeof window === "undefined") return EMPTY_CLICKS
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY_CLICKS
    const parsed = JSON.parse(raw) as Partial<ClicksState>
    return { ...EMPTY_CLICKS, ...parsed }
  } catch {
    return EMPTY_CLICKS
  }
}

function writeStorage(next: ClicksState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

// ---------------- external store (reactive for dashboard) ----------------
let snapshot: ClicksState | null = null
const listeners = new Set<() => void>()

function getSnapshot(): ClicksState {
  if (snapshot === null) snapshot = readStorage()
  return snapshot
}
function getServerSnapshot(): ClicksState {
  return EMPTY_CLICKS
}
function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  const storageListener = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = readStorage()
      for (const l of listeners) l()
    }
  }
  window.addEventListener("storage", storageListener)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", storageListener)
  }
}
function commit(next: ClicksState): void {
  snapshot = next
  writeStorage(next)
  for (const l of listeners) l()
}

// ---------------- public API ----------------

/** Fire-and-forget click increment. Call this in CTA onClick handlers. */
export function trackClick(category: CTACategory): void {
  if (typeof window === "undefined") return
  const curr = getSnapshot()
  const now = new Date().toISOString()
  const next: ClicksState = {
    ...curr,
    [category]: curr[category] + 1,
    [`last${category.charAt(0).toUpperCase()}${category.slice(1)}`]: now,
    firstAt: curr.firstAt ?? now,
  } as ClicksState
  commit(next)
}

/** Reset everything back to zero. */
export function resetClicks(): void {
  commit(EMPTY_CLICKS)
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }
}

export interface UseClicksApi {
  clicks: ClicksState
  total: number
  /** The category with the highest count (null if all zero). */
  topCategory: CTACategory | null
  reset: () => void
}

export function useClickStats(): UseClicksApi {
  const clicks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const total = clicks.revenda + clicks.distribuidor + clicks.eventos

  const reset = useCallback(() => {
    resetClicks()
  }, [])

  let topCategory: CTACategory | null = null
  if (total > 0) {
    topCategory = (
      [
        ["revenda", clicks.revenda],
        ["distribuidor", clicks.distribuidor],
        ["eventos", clicks.eventos],
      ] as const
    )
      .toSorted((a, b) => b[1] - a[1])[0][0] as CTACategory
  }

  return { clicks, total, topCategory, reset }
}
