"use client"

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import {
  EVENTS_STORAGE_KEY,
  readEvents,
  writeEvents,
  resetEvents,
  newEventId,
  slugify,
  isUpcoming,
  sortForListing,
  type BangEvent,
} from "./config"
import { buildDemoEvents, hasSeededDemoEvents, markEventsSeeded } from "./demo"

// External store — lets every component stay in sync across tabs and in-page.
let snapshot: BangEvent[] | null = null
const listeners = new Set<() => void>()

function getSnapshot(): BangEvent[] {
  if (snapshot === null) snapshot = readEvents()
  return snapshot
}
function getServerSnapshot(): BangEvent[] {
  return []
}
function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  const storageListener = (e: StorageEvent) => {
    if (e.key === EVENTS_STORAGE_KEY) {
      snapshot = readEvents()
      for (const l of listeners) l()
    }
  }
  window.addEventListener("storage", storageListener)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", storageListener)
  }
}
function commit(next: BangEvent[]): void {
  snapshot = next
  writeEvents(next)
  for (const l of listeners) l()
}

export interface UseEventsApi {
  /** Full list (all events, any date). */
  events: readonly BangEvent[]
  /** Filtered to today+future, sorted for the listing page. */
  upcoming: BangEvent[]
  addEvent: (input: Omit<BangEvent, "id" | "createdAt" | "slug"> & { slug?: string }) => BangEvent
  updateEvent: (id: string, patch: Partial<BangEvent>) => void
  removeEvent: (id: string) => void
  resetAll: () => void
  seedDemo: () => void
}

export function useEvents(): UseEventsApi {
  const events = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addEvent = useCallback(
    (input: Omit<BangEvent, "id" | "createdAt" | "slug"> & { slug?: string }): BangEvent => {
      const slug = input.slug?.trim() || slugify(input.nome)
      const next: BangEvent = {
        ...input,
        slug,
        id: newEventId(),
        createdAt: new Date().toISOString(),
      }
      commit([next, ...getSnapshot()])
      return next
    },
    [],
  )

  const updateEvent = useCallback((id: string, patch: Partial<BangEvent>) => {
    commit(getSnapshot().map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])

  const removeEvent = useCallback((id: string) => {
    commit(getSnapshot().filter((e) => e.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    resetEvents()
    snapshot = []
    for (const l of listeners) l()
  }, [])

  const seedDemo = useCallback(() => {
    const demo = buildDemoEvents()
    commit([...demo, ...getSnapshot()])
    markEventsSeeded()
  }, [])

  // Auto-seed once per demo version. We bump DEMO_SEED_FLAG when the demo set
  // grows so existing dev/staff browsers pick up the new fixtures without
  // wiping anything they've added manually. Strategy: if the only events
  // present are stale demo entries, replace them; if real entries exist, just
  // mark this version seeded and leave the data alone.
  useEffect(() => {
    if (hasSeededDemoEvents()) return
    const cur = getSnapshot()
    const onlyDemo = cur.length === 0 || cur.every((e) => e.id.startsWith("evt-demo-"))
    if (!onlyDemo) {
      markEventsSeeded()
      return
    }
    commit(buildDemoEvents())
    markEventsSeeded()
  }, [])

  const upcoming = useMemo(
    () => sortForListing(events.filter((e) => isUpcoming(e))),
    [events],
  )

  return { events, upcoming, addEvent, updateEvent, removeEvent, resetAll, seedDemo }
}
