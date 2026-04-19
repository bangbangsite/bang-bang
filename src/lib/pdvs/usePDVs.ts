"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import basePDVsJson from "@/data/pdvs.json"
import type { PDV } from "@/lib/types/pdv"
import { EMPTY_OVERRIDES, type PDVOverrides } from "./overrides"
import {
  addPDVOverride,
  editPDVOverride,
  deletePDVOverride,
  resetPDVOverrides,
} from "./actions"

const BASE = basePDVsJson as PDV[]

// ─── DB row shape (snake_case from Supabase) ──────────────────────────────────

interface DBRow {
  added: PDV[]
  edited: Record<string, Partial<PDV>>
  deleted_ids: string[]
  created_at_map: Record<string, string>
}

function rowToOverrides(row: DBRow): PDVOverrides {
  return {
    added: Array.isArray(row.added) ? row.added : [],
    edited:
      row.edited && typeof row.edited === "object"
        ? (row.edited as Record<string, Partial<PDV>>)
        : {},
    deletedIds: Array.isArray(row.deleted_ids) ? row.deleted_ids : [],
    createdAt:
      row.created_at_map && typeof row.created_at_map === "object"
        ? (row.created_at_map as Record<string, string>)
        : {},
  }
}

// ─── Public hook API ──────────────────────────────────────────────────────────

export interface UsePDVsApi {
  /** Full merged list (base ∪ added, minus deletedIds, with edits applied). */
  pdvs: readonly PDV[]
  overrides: PDVOverrides
  loading: boolean
  addPDV: (pdv: PDV) => Promise<void>
  updatePDV: (id: string, patch: Partial<PDV>) => Promise<void>
  deletePDV: (id: string) => Promise<void>
  /** Wipes all staff edits — everything reverts to the base dataset. */
  resetAll: () => Promise<void>
  /** Refreshes overrides from Supabase. */
  refresh: () => Promise<void>
  /** Whether a PDV originated from the staff dashboard (not the base xlsx). */
  isAdded: (id: string) => boolean
  /** Whether a base PDV has been edited in the dashboard. */
  isEdited: (id: string) => boolean
}

export function usePDVs(): UsePDVsApi {
  const [overrides, setOverrides] = useState<PDVOverrides>(EMPTY_OVERRIDES)
  const [loading, setLoading] = useState(true)

  const fetchOverrides = useCallback(async () => {
    // Dynamic import keeps the Supabase browser client out of the initial
    // bundle for pages that don't use this hook (e.g. public site).
    const { createSupabaseBrowserClient } = await import(
      "@/lib/supabase/client"
    )
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("pdv_overrides")
      .select("added, edited, deleted_ids, created_at_map")
      .eq("id", true)
      .single<DBRow>()

    if (error || !data) {
      setOverrides({ ...EMPTY_OVERRIDES })
    } else {
      setOverrides(rowToOverrides(data))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOverrides()
  }, [fetchOverrides])

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

  // Optimistic helper: applies a transformation locally before the server
  // action resolves, then re-fetches to get the authoritative state.
  const optimistic = useCallback(
    async (
      localUpdate: (curr: PDVOverrides) => PDVOverrides,
      action: () => Promise<void>,
    ) => {
      setOverrides((curr) => localUpdate(curr))
      try {
        await action()
      } finally {
        // Re-sync from DB regardless of success/failure so the UI is correct.
        await fetchOverrides()
      }
    },
    [fetchOverrides],
  )

  const addPDV = useCallback(
    (pdv: PDV) =>
      optimistic(
        (curr) => ({
          ...curr,
          added: [...curr.added, pdv],
          createdAt: { ...curr.createdAt, [pdv.id]: new Date().toISOString() },
        }),
        () => addPDVOverride(pdv),
      ),
    [optimistic],
  )

  const updatePDV = useCallback(
    (id: string, patch: Partial<PDV>) =>
      optimistic(
        (curr) => {
          const addedIdx = curr.added.findIndex((p) => p.id === id)
          if (addedIdx !== -1) {
            const nextAdded = [...curr.added]
            nextAdded[addedIdx] = { ...nextAdded[addedIdx], ...patch }
            return {
              ...curr,
              added: nextAdded,
              createdAt: {
                ...curr.createdAt,
                [id]: new Date().toISOString(),
              },
            }
          }
          return {
            ...curr,
            edited: {
              ...curr.edited,
              [id]: { ...(curr.edited[id] ?? {}), ...patch },
            },
            createdAt: { ...curr.createdAt, [id]: new Date().toISOString() },
          }
        },
        () => editPDVOverride(id, patch),
      ),
    [optimistic],
  )

  const deletePDV = useCallback(
    (id: string) =>
      optimistic(
        (curr) => {
          const addedIdx = curr.added.findIndex((p) => p.id === id)
          if (addedIdx !== -1) {
            const nextCreatedAt = { ...curr.createdAt }
            delete nextCreatedAt[id]
            return {
              ...curr,
              added: curr.added.filter((_, i) => i !== addedIdx),
              createdAt: nextCreatedAt,
            }
          }
          return {
            ...curr,
            deletedIds: curr.deletedIds.includes(id)
              ? curr.deletedIds
              : [...curr.deletedIds, id],
          }
        },
        () => deletePDVOverride(id),
      ),
    [optimistic],
  )

  const resetAll = useCallback(
    () =>
      optimistic(
        () => ({ ...EMPTY_OVERRIDES }),
        () => resetPDVOverrides(),
      ),
    [optimistic],
  )

  const refresh = useCallback(() => fetchOverrides(), [fetchOverrides])

  const isAdded = useCallback(
    (id: string) => overrides.added.some((p) => p.id === id),
    [overrides.added],
  )

  const isEdited = useCallback(
    (id: string) => Object.hasOwn(overrides.edited, id),
    [overrides.edited],
  )

  return {
    pdvs,
    overrides,
    loading,
    addPDV,
    updatePDV,
    deletePDV,
    resetAll,
    refresh,
    isAdded,
    isEdited,
  }
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
