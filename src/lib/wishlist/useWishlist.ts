"use client"

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import {
  WISHLIST_STORAGE_KEY,
  readWishlist,
  writeWishlist,
  resetWishlist,
  newRequestId,
  rankCitiesByDemand,
  type CityRequest,
  type CityRankRow,
} from "./config"
import { buildDemoRequests, hasSeededDemo, markSeeded } from "./demo"

// External store — every component stays in sync (and follows storage events
// across tabs) without a global Provider.
let snapshot: CityRequest[] | null = null
const listeners = new Set<() => void>()

function getSnapshot(): CityRequest[] {
  if (snapshot === null) snapshot = readWishlist()
  return snapshot
}
function getServerSnapshot(): CityRequest[] {
  return []
}
function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  const storageListener = (e: StorageEvent) => {
    if (e.key === WISHLIST_STORAGE_KEY) {
      snapshot = readWishlist()
      for (const l of listeners) l()
    }
  }
  window.addEventListener("storage", storageListener)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", storageListener)
  }
}
function commit(next: CityRequest[]): void {
  snapshot = next
  writeWishlist(next)
  for (const l of listeners) l()
}

// ----------------- hook -----------------

export interface UseWishlistApi {
  requests: readonly CityRequest[]
  /** Total count (equivalent to requests.length). */
  total: number
  addRequest: (input: Omit<CityRequest, "id" | "createdAt">) => CityRequest
  removeRequest: (id: string) => void
  resetAll: () => void
  /** Top-N cities by demand. */
  topCities: (limit: number) => CityRankRow[]
  /** Full ranking. */
  ranking: CityRankRow[]
  /** Inject the 10-request demo seed (idempotent marker — won't rerun after reset). */
  seedDemo: () => void
}

export function useWishlist(): UseWishlistApi {
  const requests = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const seedDemo = useCallback(() => {
    const demo = buildDemoRequests()
    commit([...demo, ...getSnapshot()])
    markSeeded()
  }, [])

  // One-time auto-seed so the dashboard has something to show on first load.
  // Gated by a localStorage flag — clearing everything won't bring fakes back.
  useEffect(() => {
    if (hasSeededDemo()) return
    if (getSnapshot().length > 0) {
      markSeeded()
      return
    }
    const demo = buildDemoRequests()
    commit(demo)
    markSeeded()
  }, [])

  const addRequest = useCallback(
    (input: Omit<CityRequest, "id" | "createdAt">): CityRequest => {
      const next: CityRequest = {
        ...input,
        id: newRequestId(),
        createdAt: new Date().toISOString(),
      }
      commit([next, ...getSnapshot()])
      return next
    },
    [],
  )

  const removeRequest = useCallback((id: string) => {
    commit(getSnapshot().filter((r) => r.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    resetWishlist()
    snapshot = []
    for (const l of listeners) l()
  }, [])

  const ranking = useMemo(() => rankCitiesByDemand(requests), [requests])
  const topCities = useCallback(
    (limit: number) => ranking.slice(0, limit),
    [ranking],
  )

  return {
    requests,
    total: requests.length,
    addRequest,
    removeRequest,
    resetAll,
    topCities,
    ranking,
    seedDemo,
  }
}
