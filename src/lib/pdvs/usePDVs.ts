"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import basePDVsJson from "@/data/pdvs.json"
import type { PDV } from "@/lib/types/pdv"
import {
  EMPTY_OVERRIDES,
  readOverrides,
  writeOverrides,
  type PDVOverrides,
} from "./overrides"

const BASE = basePDVsJson as PDV[]

// -----------------------------------------------------------------------------
// External store so every dashboard component stays in sync when one mutates.
// -----------------------------------------------------------------------------
let snapshot: PDVOverrides | null = null
const listeners = new Set<() => void>()

function getSnapshot(): PDVOverrides {
  if (snapshot === null) snapshot = readOverrides()
  return snapshot
}

function getServerSnapshot(): PDVOverrides {
  return EMPTY_OVERRIDES
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  // React to changes made in another tab
  const storageListener = (e: StorageEvent) => {
    if (e.key && e.key.startsWith("bb_pdv_overrides")) {
      snapshot = readOverrides()
      for (const l of listeners) l()
    }
  }
  window.addEventListener("storage", storageListener)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", storageListener)
  }
}

function commit(next: PDVOverrides): void {
  snapshot = next
  writeOverrides(next)
  for (const l of listeners) l()
}

// -----------------------------------------------------------------------------
// Public hook
// -----------------------------------------------------------------------------
export interface UsePDVsApi {
  /** Full merged list (base ∪ added, minus deletedIds, with edits applied). */
  pdvs: readonly PDV[]
  overrides: PDVOverrides
  addPDV: (pdv: PDV) => void
  updatePDV: (id: string, patch: Partial<PDV>) => void
  deletePDV: (id: string) => void
  /** Wipes all staff edits — everything reverts to the base dataset. */
  resetAll: () => void
  /** Whether a PDV originated from the staff dashboard (not the base xlsx). */
  isAdded: (id: string) => boolean
  /** Whether a base PDV has been edited in the dashboard. */
  isEdited: (id: string) => boolean
}

export function usePDVs(): UsePDVsApi {
  const overrides = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const pdvs = useMemo<readonly PDV[]>(() => {
    const deleted = new Set(overrides.deletedIds)
    const merged: PDV[] = []
    for (const base of BASE) {
      if (deleted.has(base.id)) continue
      const patch = overrides.edited[base.id]
      merged.push(patch ? { ...base, ...patch } : base)
    }
    for (const added of overrides.added) {
      if (!deleted.has(added.id)) merged.push(added)
    }
    return merged
  }, [overrides])

  const addPDV = useCallback((pdv: PDV) => {
    const curr = getSnapshot()
    commit({
      ...curr,
      added: [...curr.added, pdv],
      createdAt: { ...curr.createdAt, [pdv.id]: new Date().toISOString() },
    })
  }, [])

  const updatePDV = useCallback((id: string, patch: Partial<PDV>) => {
    const curr = getSnapshot()
    // Edits to PDVs added in this session mutate the added record directly.
    const addedIdx = curr.added.findIndex((p) => p.id === id)
    if (addedIdx !== -1) {
      const nextAdded = [...curr.added]
      nextAdded[addedIdx] = { ...nextAdded[addedIdx], ...patch }
      commit({
        ...curr,
        added: nextAdded,
        createdAt: { ...curr.createdAt, [id]: new Date().toISOString() },
      })
      return
    }
    commit({
      ...curr,
      edited: {
        ...curr.edited,
        [id]: { ...(curr.edited[id] ?? {}), ...patch },
      },
      createdAt: { ...curr.createdAt, [id]: new Date().toISOString() },
    })
  }, [])

  const deletePDV = useCallback((id: string) => {
    const curr = getSnapshot()
    // Removing an added PDV actually removes it from the list; base PDVs are
    // soft-deleted so resetAll() can restore them.
    const addedIdx = curr.added.findIndex((p) => p.id === id)
    if (addedIdx !== -1) {
      commit({
        ...curr,
        added: curr.added.filter((_, i) => i !== addedIdx),
        createdAt: Object.fromEntries(
          Object.entries(curr.createdAt).filter(([k]) => k !== id),
        ),
      })
      return
    }
    commit({
      ...curr,
      deletedIds: curr.deletedIds.includes(id)
        ? curr.deletedIds
        : [...curr.deletedIds, id],
    })
  }, [])

  const resetAll = useCallback(() => {
    commit(EMPTY_OVERRIDES)
  }, [])

  const isAdded = useCallback(
    (id: string) => overrides.added.some((p) => p.id === id),
    [overrides.added],
  )
  const isEdited = useCallback(
    (id: string) => Object.hasOwn(overrides.edited, id),
    [overrides.edited],
  )

  return { pdvs, overrides, addPDV, updatePDV, deletePDV, resetAll, isAdded, isEdited }
}

/** Counts per UF, sorted descending (useful for the ranking bar chart). */
export function countsByUF(pdvs: readonly PDV[]): Array<{ uf: string; count: number }> {
  const map = new Map<string, number>()
  for (const p of pdvs) map.set(p.uf, (map.get(p.uf) ?? 0) + 1)
  return [...map.entries()]
    .map(([uf, count]) => ({ uf, count }))
    .sort((a, b) => b.count - a.count)
}

/** Last-N recently-touched PDVs, ordered by createdAt timestamp desc. */
export function recentPDVs(
  pdvs: readonly PDV[],
  overrides: PDVOverrides,
  limit: number,
): PDV[] {
  const timed = pdvs
    .map((p) => ({ pdv: p, at: overrides.createdAt[p.id] ?? "" }))
    .filter((x) => x.at !== "")
    .sort((a, b) => (a.at < b.at ? 1 : -1))
  return timed.slice(0, limit).map((x) => x.pdv)
}
