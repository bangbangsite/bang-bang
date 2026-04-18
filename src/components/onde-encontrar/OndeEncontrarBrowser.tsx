"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapPinOff,
  X,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { PDV, PDVTipo, UF } from "@/lib/types/pdv"
import { CardPDV } from "@/components/sections/OndeComprar/CardPDV"
import { OndeEncontrarMap } from "./OndeEncontrarMap"
import {
  OndeEncontrarFilterSidebar,
  EMPTY_OE_FILTER,
  type OEFilterState,
  type UFOption,
  type CidadeOption,
} from "./OndeEncontrarFilterSidebar"
import { cn } from "@/lib/utils"

type ViewMode = "lista" | "mapa"

const PAGE_SIZE = 12
const PDV_TIPOS_LIST: PDVTipo[] = [
  "Bar",
  "Restaurante",
  "Casa Noturna",
  "Mercado",
  "Conveniência",
  "Distribuidora",
  "Rooftop",
  "Outros",
]

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function isCepDigits(s: string): boolean {
  return /^\d{8}$/.test(s.replace(/\D/g, ""))
}

interface OndeEncontrarBrowserProps {
  pdvs: readonly PDV[]
  /** Called when the empty state CTA is tapped — page scrolls to wishlist. */
  onRequestHere: () => void
}

export function OndeEncontrarBrowser({ pdvs, onRequestHere }: OndeEncontrarBrowserProps) {
  const [filter, setFilter] = useState<OEFilterState>(EMPTY_OE_FILTER)
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [view, setView] = useState<ViewMode>("lista")
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  // ---- aggregates off the full list (counts stay stable as user filters) ----
  const ufOptions = useMemo<UFOption[]>(() => {
    const m = new Map<UF, number>()
    for (const p of pdvs) m.set(p.uf, (m.get(p.uf) ?? 0) + 1)
    return [...m.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([uf, count]) => ({ uf, count }))
  }, [pdvs])

  const availableUfSet = useMemo<ReadonlySet<UF>>(
    () => new Set(ufOptions.map((u) => u.uf)),
    [ufOptions],
  )

  const cidadeOptions = useMemo<CidadeOption[]>(() => {
    // If UF filter is active, narrow city list to those UFs (less noise).
    const ufFilter = new Set(filter.ufs)
    const useUfFilter = ufFilter.size > 0
    const m = new Map<string, CidadeOption>()
    for (const p of pdvs) {
      if (useUfFilter && !ufFilter.has(p.uf)) continue
      const key = `${p.cidade}|${p.uf}`
      const prev = m.get(key)
      if (prev) prev.count += 1
      else m.set(key, { cidade: p.cidade, uf: p.uf, count: 1 })
    }
    return [...m.values()].sort((a, b) =>
      a.cidade.localeCompare(b.cidade, "pt-BR"),
    )
  }, [pdvs, filter.ufs])

  // Tipo counts re-computed against the partial filter (UF/cidade/delivery)
  // so disabled chips reflect the *currently visible* set, not the whole DB.
  const tipoCounts = useMemo(() => {
    const base = {} as Record<PDVTipo, number>
    for (const t of PDV_TIPOS_LIST) base[t] = 0
    const ufFilter = new Set(filter.ufs)
    const cidFilter = new Set(filter.cidades)
    for (const p of pdvs) {
      if (ufFilter.size > 0 && !ufFilter.has(p.uf)) continue
      if (cidFilter.size > 0 && !cidFilter.has(p.cidade)) continue
      if (filter.comDelivery && !p.deliveryUrl) continue
      base[p.tipo] = (base[p.tipo] ?? 0) + 1
    }
    return base
  }, [pdvs, filter.ufs, filter.cidades, filter.comDelivery])

  // ---- main filter pipeline ----
  const filtered = useMemo(() => {
    const q = normalize(filter.query)
    const isCep = isCepDigits(filter.query)
    const cepDigits = filter.query.replace(/\D/g, "")
    return pdvs.filter((p) => {
      if (filter.ufs.length > 0 && !filter.ufs.includes(p.uf)) return false
      if (filter.cidades.length > 0 && !filter.cidades.includes(p.cidade)) return false
      if (filter.tipos.length > 0 && !filter.tipos.includes(p.tipo)) return false
      if (filter.comDelivery && !p.deliveryUrl) return false
      if (!q) return true
      if (isCep) return p.cep.replace(/\D/g, "").startsWith(cepDigits.slice(0, 5))
      const hay = normalize(
        [p.nome, p.bairro, p.cidade, p.uf, p.endereco, p.tipo].filter(Boolean).join(" "),
      )
      return hay.includes(q)
    })
  }, [pdvs, filter])

  // Reset to page 1 whenever filter shifts
  const key = JSON.stringify(filter)
  const [trackedKey, setTrackedKey] = useState(key)
  if (key !== trackedKey) {
    setTrackedKey(key)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const activeFilterCount =
    (filter.query.trim() ? 1 : 0) +
    filter.ufs.length +
    filter.cidades.length +
    filter.tipos.length +
    (filter.comDelivery ? 1 : 0)

  // ---- CEP autodetection: if user types 8 digits in the search, fire ViaCEP
  // and try to map the result to one of our existing cities. Debounced via
  // typing pause; cancellable across keystrokes. ----
  const inflightCepRef = useRef<string | null>(null)
  useEffect(() => {
    const raw = filter.query.replace(/\D/g, "")
    if (raw.length !== 8) {
      setCepLoading(false)
      setCepError(null)
      return
    }
    if (inflightCepRef.current === raw) return
    inflightCepRef.current = raw

    const controller = new AbortController()
    setCepLoading(true)
    setCepError(null)

    ;(async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("network")
        const data: { localidade?: string; uf?: string; erro?: boolean } =
          await res.json()
        if (data.erro) {
          setCepError("CEP não encontrado.")
          return
        }
        const cidade = data.localidade ?? ""
        const uf = (data.uf ?? "").toUpperCase() as UF
        const match = pdvs.find(
          (p) => p.uf === uf && normalize(p.cidade) === normalize(cidade),
        )
        if (match) {
          setFilter((prev) => ({
            ...prev,
            query: "",
            ufs: prev.ufs.includes(uf) ? prev.ufs : [...prev.ufs, uf],
            cidades: prev.cidades.includes(match.cidade)
              ? prev.cidades
              : [...prev.cidades, match.cidade],
          }))
        } else {
          // No PDV in that city — keep the query so user sees zero results
          // and the empty state nudges them to the wishlist form.
          setCepError(
            `Sem PDV em ${cidade}/${uf} ainda. Cadastra sua cidade pra ser avisado.`,
          )
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return
        setCepError("Não consegui consultar o CEP. Tenta de novo em instantes.")
      } finally {
        setCepLoading(false)
      }
    })()

    return () => controller.abort()
  }, [filter.query, pdvs])

  // ---- URL ?cep= handoff from the homepage. Consume once. ----
  const urlCepConsumed = useRef(false)
  useEffect(() => {
    if (urlCepConsumed.current) return
    urlCepConsumed.current = true
    const params = new URLSearchParams(window.location.search)
    const cep = (params.get("cep") ?? "").replace(/\D/g, "")
    if (cep.length !== 8) return
    const url = new URL(window.location.href)
    url.searchParams.delete("cep")
    window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash)
    setFilter((prev) => ({ ...prev, query: cep }))
  }, [])

  const handleToggleUF = (uf: UF) => {
    setFilter((prev) => ({
      ...prev,
      ufs: prev.ufs.includes(uf)
        ? prev.ufs.filter((u) => u !== uf)
        : [...prev.ufs, uf],
      cidades: prev.ufs.includes(uf)
        ? prev.cidades.filter((c) => {
            const cityUFs = pdvs.filter((p) => p.cidade === c).map((p) => p.uf)
            return cityUFs.some((u) => u !== uf && prev.ufs.includes(u))
          })
        : prev.cidades,
    }))
  }

  return (
    <section aria-labelledby="oe-list-title" className="scroll-mt-24">
      {/* Mobile header: title + view toggle + filter trigger */}
      <div className="lg:hidden mb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="oe-list-title"
            className="font-black uppercase text-[#2D1810] text-xl tracking-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {filtered.length === 0
              ? "Nenhum PDV"
              : `${filtered.length} ${filtered.length === 1 ? "PDV" : "PDVs"}`}
          </h2>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#4A2C1A]/15 bg-white text-sm font-bold text-[#2D1810] hover:border-[#E87A1E]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
          >
            <SlidersHorizontal size={14} strokeWidth={2.4} />
            Filtrar
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E87A1E] text-white text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <OndeEncontrarFilterSidebar
            value={filter}
            onChange={setFilter}
            ufOptions={ufOptions}
            cidadeOptions={cidadeOptions}
            tipoCounts={tipoCounts}
            totalResults={filtered.length}
            cepLoading={cepLoading}
            cepError={cepError}
          />
        </div>

        {/* Mobile drawer */}
        {mobileFiltersOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            className="lg:hidden fixed inset-0 z-50 flex"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />
            <div className="relative ml-auto w-[300px] max-w-[85%] bg-[#FAFAF8] h-full overflow-y-auto p-4 shadow-[0_0_40px_-5px_rgba(0,0,0,0.4)]">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Fechar filtros"
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-[#4A2C1A]/60 hover:text-[#2D1810] hover:bg-[#2D1810]/5 z-10"
              >
                <X size={16} />
              </button>
              <div className="pt-10">
                <OndeEncontrarFilterSidebar
                  value={filter}
                  onChange={setFilter}
                  ufOptions={ufOptions}
                  cidadeOptions={cidadeOptions}
                  tipoCounts={tipoCounts}
                  totalResults={filtered.length}
                  cepLoading={cepLoading}
                  cepError={cepError}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 min-w-0">
          {/* Desktop header: title + view toggle */}
          <header className="hidden lg:flex items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="oe-list-title"
                className="font-black uppercase text-[#2D1810] text-2xl md:text-3xl tracking-tight"
                style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
              >
                {filtered.length === 0
                  ? "Nenhum PDV encontrado"
                  : `${filtered.length} ${filtered.length === 1 ? "PDV" : "PDVs"}`}
              </h2>
              {filtered.length > 0 && view === "lista" && totalPages > 1 && (
                <p className="text-sm text-[#4A2C1A]/60 mt-1">
                  Página {safePage} de {totalPages}
                </p>
              )}
            </div>
            <ViewToggle value={view} onChange={setView} />
          </header>

          {filtered.length === 0 ? (
            <EmptyState
              hasFilters={activeFilterCount > 0}
              onClear={() => setFilter(EMPTY_OE_FILTER)}
              onRequestHere={onRequestHere}
            />
          ) : view === "mapa" ? (
            <OndeEncontrarMap
              pdvs={filtered}
              availableUfs={availableUfSet}
              selectedUfs={filter.ufs}
              onToggleUF={handleToggleUF}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 items-stretch">
                {pageItems.map((pdv) => (
                  <CardPDV key={pdv.id} pdv={pdv} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="Paginação"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label="Página anterior"
                    className="inline-flex items-center gap-1 h-10 px-4 rounded-lg border border-[#4A2C1A]/15 text-sm font-semibold text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                    Anterior
                  </button>
                  <span className="text-sm font-semibold text-[#4A2C1A]/70 tabular-nums px-3">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    aria-label="Próxima página"
                    className="inline-flex items-center gap-1 h-10 px-4 rounded-lg border border-[#4A2C1A]/15 text-sm font-semibold text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Próxima
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (v: ViewMode) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Modo de visualização"
      className="inline-flex items-center p-1 rounded-full bg-white border border-[#4A2C1A]/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] self-start"
    >
      <ToggleOption
        active={value === "lista"}
        onClick={() => onChange("lista")}
        icon={<LayoutGrid size={14} strokeWidth={2.4} />}
        label="Lista"
      />
      <ToggleOption
        active={value === "mapa"}
        onClick={() => onChange("mapa")}
        icon={<MapIcon size={14} strokeWidth={2.4} />}
        label="Mapa"
      />
    </div>
  )
}

function ToggleOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/50",
        active
          ? "bg-[#E87A1E] text-white shadow-[0_6px_14px_-6px_rgba(232,122,30,0.6)]"
          : "text-[#4A2C1A]/70 hover:text-[#2D1810]",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyState({
  hasFilters,
  onClear,
  onRequestHere,
}: {
  hasFilters: boolean
  onClear: () => void
  onRequestHere: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-14 px-6 rounded-3xl bg-white border border-dashed border-[#4A2C1A]/15">
      <div className="w-14 h-14 rounded-full bg-[#F5E6D0] flex items-center justify-center text-[#E87A1E]">
        <MapPinOff size={24} strokeWidth={2.1} />
      </div>
      <h3
        className="font-black uppercase text-[#2D1810] text-xl tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        {hasFilters ? "Nada bate com esses filtros." : "Bang Bang ainda não chegou aqui."}
      </h3>
      <p className="text-sm text-[#4A2C1A]/65 max-w-md">
        {hasFilters
          ? "Tenta afrouxar — ou limpa tudo pra ver todos os PDVs."
          : "Cadastra sua cidade abaixo e a gente avisa assim que abrir um PDV na sua região."}
      </p>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#E87A1E] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#C4650F]"
        >
          <X size={14} strokeWidth={2.5} />
          Limpar filtros
        </button>
      ) : (
        <button
          type="button"
          onClick={onRequestHere}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#E87A1E] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#C4650F]"
        >
          Quero Bang Bang aqui
        </button>
      )}
    </div>
  )
}
