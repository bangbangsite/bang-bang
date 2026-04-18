"use client"

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import {
  BANGERS_STORAGE_KEY,
  readBangers,
  writeBangers,
  resetBangers,
  newApplicationId,
  type BangerApplication,
  type BangerStatus,
} from "./config"
import {
  buildDemoBangers,
  hasSeededDemoBangers,
  markBangersSeeded,
} from "./demo"

// External store — keeps every mounted component in sync, including across tabs.
let snapshot: BangerApplication[] | null = null
const listeners = new Set<() => void>()

function getSnapshot(): BangerApplication[] {
  if (snapshot === null) snapshot = readBangers()
  return snapshot
}
function getServerSnapshot(): BangerApplication[] {
  return []
}
function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  const storageListener = (e: StorageEvent) => {
    if (e.key === BANGERS_STORAGE_KEY) {
      snapshot = readBangers()
      for (const l of listeners) l()
    }
  }
  window.addEventListener("storage", storageListener)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", storageListener)
  }
}
function commit(next: BangerApplication[]): void {
  snapshot = next
  writeBangers(next)
  for (const l of listeners) l()
}

export interface UseBangersApi {
  applications: readonly BangerApplication[]
  total: number
  /** Count of applications with status === "novo". Drives the sidebar badge. */
  novosCount: number
  addApplication: (
    input: Omit<BangerApplication, "id" | "createdAt" | "updatedAt" | "status" | "favorito" | "notas"> &
      Partial<Pick<BangerApplication, "status" | "favorito" | "notas">>,
  ) => BangerApplication
  updateApplication: (id: string, patch: Partial<BangerApplication>) => void
  setStatus: (id: string, status: BangerStatus) => void
  toggleFavorite: (id: string) => void
  removeApplication: (id: string) => void
  resetAll: () => void
  seedDemo: () => void
}

export function useBangers(): UseBangersApi {
  const applications = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const seedDemo = useCallback(() => {
    const demo = buildDemoBangers()
    commit([...demo, ...getSnapshot()])
    markBangersSeeded()
  }, [])

  // One-time auto-seed so the dashboard has content on first load.
  useEffect(() => {
    if (hasSeededDemoBangers()) return
    if (getSnapshot().length > 0) {
      markBangersSeeded()
      return
    }
    commit(buildDemoBangers())
    markBangersSeeded()
  }, [])

  const addApplication = useCallback(
    (input: Parameters<UseBangersApi["addApplication"]>[0]): BangerApplication => {
      const next: BangerApplication = {
        nome: input.nome,
        email: input.email,
        whatsapp: input.whatsapp,
        cidade: input.cidade,
        uf: input.uf,
        nicho: input.nicho,
        redes: input.redes,
        motivacao: input.motivacao,
        status: input.status ?? "novo",
        favorito: input.favorito ?? false,
        notas: input.notas ?? "",
        id: newApplicationId(),
        createdAt: new Date().toISOString(),
        updatedAt: null,
      }
      commit([next, ...getSnapshot()])
      return next
    },
    [],
  )

  const updateApplication = useCallback((id: string, patch: Partial<BangerApplication>) => {
    commit(
      getSnapshot().map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
      ),
    )
  }, [])

  const setStatus = useCallback(
    (id: string, status: BangerStatus) => updateApplication(id, { status }),
    [updateApplication],
  )

  const toggleFavorite = useCallback((id: string) => {
    commit(
      getSnapshot().map((a) =>
        a.id === id ? { ...a, favorito: !a.favorito, updatedAt: new Date().toISOString() } : a,
      ),
    )
  }, [])

  const removeApplication = useCallback((id: string) => {
    commit(getSnapshot().filter((a) => a.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    resetBangers()
    snapshot = []
    for (const l of listeners) l()
  }, [])

  const novosCount = useMemo(
    () => applications.filter((a) => a.status === "novo").length,
    [applications],
  )

  return {
    applications,
    total: applications.length,
    novosCount,
    addApplication,
    updateApplication,
    setStatus,
    toggleFavorite,
    removeApplication,
    resetAll,
    seedDemo,
  }
}
