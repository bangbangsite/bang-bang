"use client"

/**
 * Persistent log of export/import events performed from the dashboard.
 * Stored in localStorage, capped at MAX_ENTRIES (oldest entries are dropped).
 */
import { useCallback, useSyncExternalStore } from "react"

const KEY = "bb_pdv_io_log_v1"
const MAX_ENTRIES = 50

export type IOEventKind = "export" | "import"

export interface IOEvent {
  id: string
  kind: IOEventKind
  at: string // ISO timestamp
  filename: string
  summary: string
}

// ---------- storage layer (pure) ----------
function readStorage(): IOEvent[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as IOEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(list: IOEvent[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* quota or blocked — silently give up */
  }
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ---------- external store (reactive) ----------
let snapshot: IOEvent[] | null = null
const listeners = new Set<() => void>()

function getSnapshot(): IOEvent[] {
  if (snapshot === null) snapshot = readStorage()
  return snapshot
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

function commit(next: IOEvent[]): void {
  snapshot = next
  writeStorage(next)
  for (const l of listeners) l()
}

// ---------- public API ----------
export function useIOLog() {
  const log = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => [] as IOEvent[],
  )

  const add = useCallback((ev: Omit<IOEvent, "id" | "at">) => {
    const full: IOEvent = {
      ...ev,
      id: genId(),
      at: new Date().toISOString(),
    }
    commit([full, ...getSnapshot()].slice(0, MAX_ENTRIES))
  }, [])

  const clear = useCallback(() => {
    commit([])
  }, [])

  return { log, add, clear }
}
