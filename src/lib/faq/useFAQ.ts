"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import {
  DEFAULT_FAQ_STATE,
  FAQ_STORAGE_KEY,
  MAX_FAQ_ITEMS,
  readFAQ,
  writeFAQ,
  resetFAQ,
  genFAQId,
  type FAQItem,
  type FAQState,
} from "./config"

let snapshot: FAQState | null = null
const listeners = new Set<() => void>()

function getSnapshot(): FAQState {
  if (snapshot === null) snapshot = readFAQ()
  return snapshot
}
function getServerSnapshot(): FAQState {
  return DEFAULT_FAQ_STATE
}
function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  const storageListener = (e: StorageEvent) => {
    if (e.key === FAQ_STORAGE_KEY) {
      snapshot = readFAQ()
      for (const l of listeners) l()
    }
  }
  window.addEventListener("storage", storageListener)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", storageListener)
  }
}
function commit(items: FAQItem[]): void {
  const trimmed = items.slice(0, MAX_FAQ_ITEMS)
  const next: FAQState = { items: trimmed, updatedAt: new Date().toISOString() }
  snapshot = next
  writeFAQ(next)
  for (const l of listeners) l()
}

export interface UseFAQApi {
  items: FAQItem[]
  updatedAt: string | null
  count: number
  max: number
  canAdd: boolean
  addItem: (input: Omit<FAQItem, "id">) => void
  updateItem: (id: string, patch: Partial<Omit<FAQItem, "id">>) => void
  removeItem: (id: string) => void
  moveUp: (id: string) => void
  moveDown: (id: string) => void
  reset: () => void
}

export function useFAQ(): UseFAQApi {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const items = useMemo(() => state.items, [state.items])

  const addItem = useCallback((input: Omit<FAQItem, "id">) => {
    const curr = getSnapshot().items
    if (curr.length >= MAX_FAQ_ITEMS) return
    commit([...curr, { ...input, id: genFAQId() }])
  }, [])

  const updateItem = useCallback(
    (id: string, patch: Partial<Omit<FAQItem, "id">>) => {
      const curr = getSnapshot().items
      commit(curr.map((it) => (it.id === id ? { ...it, ...patch } : it)))
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    const curr = getSnapshot().items
    commit(curr.filter((it) => it.id !== id))
  }, [])

  const moveUp = useCallback((id: string) => {
    const curr = getSnapshot().items
    const i = curr.findIndex((it) => it.id === id)
    if (i <= 0) return
    const next = [...curr]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    commit(next)
  }, [])

  const moveDown = useCallback((id: string) => {
    const curr = getSnapshot().items
    const i = curr.findIndex((it) => it.id === id)
    if (i < 0 || i >= curr.length - 1) return
    const next = [...curr]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    commit(next)
  }, [])

  const reset = useCallback(() => {
    resetFAQ()
    snapshot = DEFAULT_FAQ_STATE
    for (const l of listeners) l()
  }, [])

  return {
    items,
    updatedAt: state.updatedAt,
    count: items.length,
    max: MAX_FAQ_ITEMS,
    canAdd: items.length < MAX_FAQ_ITEMS,
    addItem,
    updateItem,
    removeItem,
    moveUp,
    moveDown,
    reset,
  }
}
