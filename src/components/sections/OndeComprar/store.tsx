"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { PDV, PDVsByUF, UF } from "@/lib/types/pdv"

export type FilterKind = "uf" | "cidade" | "cep" | null

export interface Filter {
  kind: FilterKind
  /** For uf: UF code. For cidade: city name. For cep: 8-digit string. */
  value: string
  /** Human label for UI chips (e.g. "São Paulo/SP"). Optional. */
  label?: string
}

interface OndeComprarContext {
  allPdvs: readonly PDV[]
  activeUfs: readonly PDVsByUF[]
  activeUfSet: ReadonlySet<UF>
  filter: Filter
  setFilter: (next: Filter) => void
  clearFilter: () => void
  filteredPdvs: readonly PDV[]
  /** Distinct city names in active PDVs (for autocomplete). */
  cityIndex: readonly { cidade: string; uf: UF; count: number }[]
}

const EMPTY_FILTER: Filter = { kind: null, value: "" }

const Ctx = createContext<OndeComprarContext | null>(null)

interface ProviderProps {
  pdvs: PDV[]
  activeUfs: PDVsByUF[]
  children: ReactNode
}

export function OndeComprarProvider({ pdvs, activeUfs, children }: ProviderProps) {
  const [filter, setFilterRaw] = useState<Filter>(EMPTY_FILTER)

  const activeUfSet = useMemo(
    () => new Set<UF>(activeUfs.map((u) => u.uf)),
    [activeUfs],
  )

  const cityIndex = useMemo(() => {
    const map = new Map<string, { cidade: string; uf: UF; count: number }>()
    for (const p of pdvs) {
      const key = `${p.cidade}|${p.uf}`
      const prev = map.get(key)
      if (prev) prev.count += 1
      else map.set(key, { cidade: p.cidade, uf: p.uf, count: 1 })
    }
    return [...map.values()].sort((a, b) =>
      a.cidade.localeCompare(b.cidade, "pt-BR"),
    )
  }, [pdvs])

  const filteredPdvs = useMemo(() => {
    if (filter.kind === null || filter.value === "") return pdvs
    if (filter.kind === "uf") {
      return pdvs.filter((p) => p.uf === filter.value)
    }
    if (filter.kind === "cidade") {
      const target = filter.value.toLowerCase()
      return pdvs.filter((p) => p.cidade.toLowerCase() === target)
    }
    if (filter.kind === "cep") {
      const prefix = filter.value.slice(0, 5)
      return pdvs.filter((p) => p.cep.startsWith(prefix))
    }
    return pdvs
  }, [pdvs, filter])

  const setFilter = useCallback((next: Filter) => setFilterRaw(next), [])
  const clearFilter = useCallback(() => setFilterRaw(EMPTY_FILTER), [])

  const value = useMemo<OndeComprarContext>(
    () => ({
      allPdvs: pdvs,
      activeUfs,
      activeUfSet,
      filter,
      setFilter,
      clearFilter,
      filteredPdvs,
      cityIndex,
    }),
    [pdvs, activeUfs, activeUfSet, filter, setFilter, clearFilter, filteredPdvs, cityIndex],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useOndeComprar(): OndeComprarContext {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error("useOndeComprar must be used inside <OndeComprarProvider>")
  }
  return ctx
}
