"use client"

import { Search, X, RotateCcw, MapPin, Tag, Building2, Truck } from "lucide-react"
import type { PDVTipo, UF } from "@/lib/types/pdv"
import { cn } from "@/lib/utils"

const PDV_TIPOS: PDVTipo[] = [
  "Bar",
  "Restaurante",
  "Casa Noturna",
  "Mercado",
  "Conveniência",
  "Distribuidora",
  "Rooftop",
  "Outros",
]

export interface OEFilterState {
  query: string
  ufs: UF[]
  cidades: string[]
  tipos: PDVTipo[]
  comDelivery: boolean
}

export const EMPTY_OE_FILTER: OEFilterState = {
  query: "",
  ufs: [],
  cidades: [],
  tipos: [],
  comDelivery: false,
}

export interface UFOption {
  uf: UF
  count: number
}

export interface CidadeOption {
  cidade: string
  uf: UF
  count: number
}

interface SidebarProps {
  value: OEFilterState
  onChange: (next: OEFilterState) => void
  ufOptions: UFOption[]
  cidadeOptions: CidadeOption[]
  tipoCounts: Record<PDVTipo, number>
  totalResults: number
  /** True while a CEP lookup is in flight (sidebar shows a hint under the search). */
  cepLoading?: boolean
  cepError?: string | null
}

export function OndeEncontrarFilterSidebar({
  value,
  onChange,
  ufOptions,
  cidadeOptions,
  tipoCounts,
  totalResults,
  cepLoading,
  cepError,
}: SidebarProps) {
  const activeCount =
    (value.query.trim() ? 1 : 0) +
    value.ufs.length +
    value.cidades.length +
    value.tipos.length +
    (value.comDelivery ? 1 : 0)

  const toggleUF = (uf: UF) => {
    const has = value.ufs.includes(uf)
    onChange({
      ...value,
      ufs: has ? value.ufs.filter((u) => u !== uf) : [...value.ufs, uf],
      // Clearing a UF wipes any city selections that no longer make sense.
      cidades: has
        ? value.cidades.filter((c) =>
            cidadeOptions.some((o) => o.cidade === c && o.uf !== uf),
          )
        : value.cidades,
    })
  }

  const toggleCidade = (cidade: string) => {
    const has = value.cidades.includes(cidade)
    onChange({
      ...value,
      cidades: has ? value.cidades.filter((c) => c !== cidade) : [...value.cidades, cidade],
    })
  }

  const toggleTipo = (t: PDVTipo) => {
    const has = value.tipos.includes(t)
    onChange({
      ...value,
      tipos: has ? value.tipos.filter((x) => x !== t) : [...value.tipos, t],
    })
  }

  const clearAll = () => onChange(EMPTY_OE_FILTER)

  return (
    <aside
      aria-label="Filtros de PDVs"
      className="w-full lg:w-[260px] lg:shrink-0"
    >
      <div className="lg:sticky lg:top-24 rounded-2xl bg-white border border-[#4A2C1A]/10 shadow-[0_4px_14px_-4px_rgba(45,24,16,0.06)] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 px-5 pt-5 pb-4">
          <div>
            <h2
              className="font-black uppercase text-[#2D1810] text-sm tracking-[0.18em]"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Filtrar
            </h2>
            <p className="text-[11px] text-[#4A2C1A]/55 mt-0.5">
              {totalResults.toLocaleString("pt-BR")} {totalResults === 1 ? "PDV" : "PDVs"}
            </p>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#E87A1E] hover:text-[#C4650F]"
            >
              <RotateCcw size={11} strokeWidth={2.5} />
              Limpar ({activeCount})
            </button>
          )}
        </header>

        {/* Search — text + CEP. The browser detects 8-digit CEP on submit and
            pings ViaCEP; status flags below render any in-flight/error state. */}
        <div className="px-5 pb-5">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A2C1A]/40"
              aria-hidden="true"
            />
            <label htmlFor="oe-filter-search" className="sr-only">
              Buscar PDV ou CEP
            </label>
            <input
              id="oe-filter-search"
              type="search"
              inputMode="search"
              value={value.query}
              onChange={(e) => onChange({ ...value, query: e.target.value })}
              placeholder="Nome, bairro, cidade ou CEP…"
              className="w-full h-10 pl-9 pr-8 rounded-xl border border-[#4A2C1A]/15 bg-[#FDF7EB]/60 text-[13px] text-[#2D1810] placeholder:text-[#4A2C1A]/40 focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"
            />
            {value.query && (
              <button
                type="button"
                onClick={() => onChange({ ...value, query: "" })}
                aria-label="Limpar busca"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#2D1810]/5"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {cepLoading && (
            <p className="mt-1.5 text-[11px] text-[#4A2C1A]/60">Consultando CEP…</p>
          )}
          {cepError && (
            <p className="mt-1.5 text-[11px] text-[#D32F2F]">{cepError}</p>
          )}
        </div>

        {/* UF — pill chips, only states with PDVs */}
        <FilterSection
          icon={<MapPin size={12} strokeWidth={2.5} />}
          label={`Estado${ufOptions.length > 0 ? ` (${ufOptions.length})` : ""}`}
        >
          {ufOptions.length === 0 ? (
            <p className="text-[11px] text-[#4A2C1A]/45 italic">Nenhum estado disponível.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {ufOptions.map((u) => {
                const active = value.ufs.includes(u.uf)
                return (
                  <button
                    key={u.uf}
                    type="button"
                    onClick={() => toggleUF(u.uf)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
                      active
                        ? "bg-[#E87A1E] text-white border border-[#E87A1E] shadow-[0_4px_10px_-3px_rgba(232,122,30,0.5)]"
                        : "bg-white text-[#2D1810] border border-[#4A2C1A]/15 hover:border-[#E87A1E]/60 hover:text-[#C4650F]",
                    )}
                  >
                    {u.uf}
                    <span
                      className={cn(
                        "text-[10px]",
                        active ? "text-white/80" : "text-[#4A2C1A]/45",
                      )}
                    >
                      {u.count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </FilterSection>

        {/* Cidade — scrollable checkbox list. If a UF filter is active, show
            only cities from those UFs (less noise, more relevant). */}
        <FilterSection
          icon={<Building2 size={12} strokeWidth={2.5} />}
          label={`Cidade${cidadeOptions.length > 0 ? ` (${cidadeOptions.length})` : ""}`}
        >
          {cidadeOptions.length === 0 ? (
            <p className="text-[11px] text-[#4A2C1A]/45 italic">Nenhuma cidade.</p>
          ) : (
            <ul className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-1 -mr-1">
              {cidadeOptions.map((c) => {
                const active = value.cidades.includes(c.cidade)
                return (
                  <li key={`${c.cidade}-${c.uf}`}>
                    <button
                      type="button"
                      onClick={() => toggleCidade(c.cidade)}
                      aria-pressed={active}
                      className={cn(
                        "group w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded-md text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
                        active
                          ? "bg-[#E87A1E]/10 text-[#C4650F] font-semibold"
                          : "text-[#2D1810] hover:bg-[#FDF7EB]",
                      )}
                    >
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                            active
                              ? "bg-[#E87A1E] border-[#E87A1E]"
                              : "border-[#4A2C1A]/25 group-hover:border-[#E87A1E]/60",
                          )}
                          aria-hidden="true"
                        >
                          {active && (
                            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2.5 6.5L5 9L10 3.5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">
                          {c.cidade}
                          <span className="text-[#4A2C1A]/45 font-normal"> /{c.uf}</span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          "text-[10px] tabular-nums shrink-0",
                          active ? "text-[#C4650F]" : "text-[#4A2C1A]/45",
                        )}
                      >
                        {c.count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </FilterSection>

        {/* Tipo — pill chips, disabled when no PDV of that type is in the
            currently visible set. */}
        <FilterSection icon={<Tag size={12} strokeWidth={2.5} />} label="Tipo">
          <div className="flex flex-wrap gap-1.5">
            {PDV_TIPOS.map((t) => {
              const count = tipoCounts[t] ?? 0
              const disabled = count === 0
              const active = value.tipos.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => !disabled && toggleTipo(t)}
                  disabled={disabled}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
                    disabled
                      ? "bg-[#F5E6D0]/40 text-[#4A2C1A]/30 cursor-not-allowed border border-transparent"
                      : active
                        ? "bg-[#E87A1E] text-white border border-[#E87A1E] shadow-[0_4px_10px_-3px_rgba(232,122,30,0.5)]"
                        : "bg-white text-[#2D1810] border border-[#4A2C1A]/15 hover:border-[#E87A1E]/60 hover:text-[#C4650F]",
                  )}
                >
                  {t}
                  {!disabled && (
                    <span
                      className={cn(
                        "text-[10px] tabular-nums",
                        active ? "text-white/80" : "text-[#4A2C1A]/45",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Delivery — single toggle */}
        <FilterSection icon={<Truck size={12} strokeWidth={2.5} />} label="Delivery" last>
          <button
            type="button"
            onClick={() => onChange({ ...value, comDelivery: !value.comDelivery })}
            aria-pressed={value.comDelivery}
            className="flex w-full items-center justify-between gap-2 py-2 px-2 rounded-md text-left text-[13px] hover:bg-[#FDF7EB] transition-colors"
          >
            <span className="text-[#2D1810]">Só com delivery</span>
            <span
              className={cn(
                "relative inline-flex w-9 h-5 rounded-full transition-colors shrink-0",
                value.comDelivery ? "bg-[#E87A1E]" : "bg-[#4A2C1A]/20",
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                  value.comDelivery ? "translate-x-[18px]" : "translate-x-0.5",
                )}
              />
            </span>
          </button>
        </FilterSection>
      </div>
    </aside>
  )
}

function FilterSection({
  icon,
  label,
  last,
  children,
}: {
  icon: React.ReactNode
  label: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={cn("px-5 py-4", !last && "border-t border-[#4A2C1A]/8")}>
      <h3 className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.22em] uppercase text-[#4A2C1A]/60 mb-3">
        <span className="text-[#E87A1E]">{icon}</span>
        {label}
      </h3>
      {children}
    </section>
  )
}
