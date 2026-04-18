"use client"

import { Search, X, RotateCcw, Tag, MapPin, Ticket, CalendarRange } from "lucide-react"
import { EVENT_CATEGORIAS, type EventCategoria } from "@/lib/events/config"
import { cn } from "@/lib/utils"

export interface EventsFilterState {
  query: string
  cidades: string[]
  categorias: EventCategoria[]
  /** YYYY-MM buckets. Empty = no month filter. */
  meses: string[]
  /** Only show events with ticket URL when true. */
  comIngresso: boolean
}

export const EMPTY_FILTER: EventsFilterState = {
  query: "",
  cidades: [],
  categorias: [],
  meses: [],
  comIngresso: false,
}

export interface MonthOption {
  /** YYYY-MM */
  iso: string
  /** Display label, e.g. "ABR/26". */
  label: string
  count: number
}

interface FilterSidebarProps {
  value: EventsFilterState
  onChange: (next: EventsFilterState) => void
  /** Cities present in the upcoming list + their event counts. */
  cityOptions: { cidade: string; count: number }[]
  /** Category counts in the upcoming list. */
  categoryCounts: Record<EventCategoria, number>
  /** Month buckets (YYYY-MM) present in the upcoming list. */
  monthOptions: MonthOption[]
  totalResults: number
}

export function EventsFilterSidebar({
  value,
  onChange,
  cityOptions,
  categoryCounts,
  monthOptions,
  totalResults,
}: FilterSidebarProps) {
  const activeCount =
    (value.query.trim() ? 1 : 0) +
    value.cidades.length +
    value.categorias.length +
    value.meses.length +
    (value.comIngresso ? 1 : 0)

  const toggleCidade = (cidade: string) => {
    const has = value.cidades.includes(cidade)
    onChange({
      ...value,
      cidades: has ? value.cidades.filter((c) => c !== cidade) : [...value.cidades, cidade],
    })
  }

  const toggleCategoria = (c: EventCategoria) => {
    const has = value.categorias.includes(c)
    onChange({
      ...value,
      categorias: has ? value.categorias.filter((x) => x !== c) : [...value.categorias, c],
    })
  }

  const toggleMes = (iso: string) => {
    const has = value.meses.includes(iso)
    onChange({
      ...value,
      meses: has ? value.meses.filter((m) => m !== iso) : [...value.meses, iso],
    })
  }

  const clearAll = () => onChange(EMPTY_FILTER)

  return (
    <aside
      aria-label="Filtros de eventos"
      className="w-full lg:w-[260px] lg:shrink-0"
    >
      <div className="lg:sticky lg:top-24 rounded-2xl bg-white border border-[#4A2C1A]/10 shadow-[0_4px_14px_-4px_rgba(45,24,16,0.06)] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 px-5 pt-5 pb-4">
          <div>
            <h2 className="font-black uppercase text-[#2D1810] text-sm tracking-[0.18em]" style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}>
              Filtrar
            </h2>
            <p className="text-[11px] text-[#4A2C1A]/55 mt-0.5">
              {totalResults.toLocaleString("pt-BR")} {totalResults === 1 ? "evento" : "eventos"}
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

        {/* Search */}
        <div className="px-5 pb-5">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A2C1A]/40"
              aria-hidden="true"
            />
            <label htmlFor="ev-filter-search" className="sr-only">Buscar evento</label>
            <input
              id="ev-filter-search"
              type="search"
              value={value.query}
              onChange={(e) => onChange({ ...value, query: e.target.value })}
              placeholder="Buscar evento…"
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
        </div>

        {/* Categorias — pill toggles */}
        <FilterSection icon={<Tag size={12} strokeWidth={2.5} />} label="Categoria">
          <div className="flex flex-wrap gap-1.5">
            {EVENT_CATEGORIAS.map((c) => {
              const count = categoryCounts[c] ?? 0
              const disabled = count === 0
              const active = value.categorias.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => !disabled && toggleCategoria(c)}
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
                  {c}
                  {!disabled && (
                    <span className={cn(
                      "text-[10px] tabular-nums",
                      active ? "text-white/80" : "text-[#4A2C1A]/45",
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Quando — month chips, only the buckets that actually have events */}
        <FilterSection
          icon={<CalendarRange size={12} strokeWidth={2.5} />}
          label={`Quando${monthOptions.length > 0 ? ` (${monthOptions.length})` : ""}`}
        >
          {monthOptions.length === 0 ? (
            <p className="text-[11px] text-[#4A2C1A]/45 italic">Sem datas confirmadas.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {monthOptions.map((m) => {
                const active = value.meses.includes(m.iso)
                return (
                  <button
                    key={m.iso}
                    type="button"
                    onClick={() => toggleMes(m.iso)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
                      active
                        ? "bg-[#E87A1E] text-white border border-[#E87A1E] shadow-[0_4px_10px_-3px_rgba(232,122,30,0.5)]"
                        : "bg-white text-[#2D1810] border border-[#4A2C1A]/15 hover:border-[#E87A1E]/60 hover:text-[#C4650F]",
                    )}
                  >
                    {m.label}
                    <span
                      className={cn(
                        "text-[10px]",
                        active ? "text-white/80" : "text-[#4A2C1A]/45",
                      )}
                    >
                      {m.count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </FilterSection>

        {/* Cidades — scrollable checkbox list */}
        <FilterSection icon={<MapPin size={12} strokeWidth={2.5} />} label={`Cidade${cityOptions.length > 0 ? ` (${cityOptions.length})` : ""}`}>
          {cityOptions.length === 0 ? (
            <p className="text-[11px] text-[#4A2C1A]/45 italic">Nenhuma cidade disponível.</p>
          ) : (
            <ul className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-1 -mr-1">
              {cityOptions.map((c) => {
                const active = value.cidades.includes(c.cidade)
                return (
                  <li key={c.cidade}>
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
                              <path d="M2.5 6.5L5 9L10 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{c.cidade}</span>
                      </span>
                      <span className={cn(
                        "text-[10px] tabular-nums shrink-0",
                        active ? "text-[#C4650F]" : "text-[#4A2C1A]/45",
                      )}>
                        {c.count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </FilterSection>

        {/* Com ingresso — single toggle */}
        <FilterSection icon={<Ticket size={12} strokeWidth={2.5} />} label="Ingresso" last>
          <button
            type="button"
            onClick={() => onChange({ ...value, comIngresso: !value.comIngresso })}
            aria-pressed={value.comIngresso}
            className="flex w-full items-center justify-between gap-2 py-2 px-2 rounded-md text-left text-[13px] hover:bg-[#FDF7EB] transition-colors"
          >
            <span className="text-[#2D1810]">Só com ingresso à venda</span>
            <span
              className={cn(
                "relative inline-flex w-9 h-5 rounded-full transition-colors shrink-0",
                value.comIngresso ? "bg-[#E87A1E]" : "bg-[#4A2C1A]/20",
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                  value.comIngresso ? "translate-x-[18px]" : "translate-x-0.5",
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
