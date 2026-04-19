"use client"

import { useMemo, useState } from "react"
import { CalendarOff, X, SlidersHorizontal, LayoutGrid, Map as MapIcon } from "lucide-react"
import { type EventCategoria, EVENT_CATEGORIAS, type BangEvent } from "@/lib/events/config"
import { EventCard } from "./EventCard"
import { EventsMap } from "./EventsMap"
import {
  EventsFilterSidebar,
  EMPTY_FILTER,
  type EventsFilterState,
} from "./EventsFilterSidebar"
import { cn } from "@/lib/utils"

type ViewMode = "list" | "map"

const PAGE_SIZE = 12

const MONTH_ABBR_UPPER = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
]

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function formatMonthLabel(iso: string): string {
  const [y, m] = iso.split("-")
  const idx = Number(m) - 1
  if (idx < 0 || idx > 11) return iso
  return `${MONTH_ABBR_UPPER[idx]}/${y.slice(2)}`
}

/** Returns every YYYY-MM bucket the event spans (1 for single-day, 1+ for multi). */
function eventMonthBuckets(data: string, dataFim?: string): string[] {
  const start = data.slice(0, 7)
  const end = (dataFim ?? data).slice(0, 7)
  if (start === end) return [start]
  const out: string[] = []
  const [sy, sm] = start.split("-").map(Number)
  const [ey, em] = end.split("-").map(Number)
  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${`${m}`.padStart(2, "0")}`)
    m += 1
    if (m > 12) { m = 1; y += 1 }
  }
  return out
}

interface EventsBrowserProps {
  /** Upcoming events fetched server-side. Already filtered to today+future. */
  events: readonly BangEvent[]
}

export function EventsBrowser({ events }: EventsBrowserProps) {
  const [filter, setFilter] = useState<EventsFilterState>(EMPTY_FILTER)
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [view, setView] = useState<ViewMode>("list")

  // Aggregates off the full upcoming list — counts stay stable as user filters.
  const cityOptions = useMemo(() => {
    const m = new Map<string, { cidade: string; count: number }>()
    for (const e of events) {
      if (!e.cidade) continue
      const prev = m.get(e.cidade)
      if (prev) prev.count += 1
      else m.set(e.cidade, { cidade: e.cidade, count: 1 })
    }
    return [...m.values()].sort((a, b) =>
      a.cidade.localeCompare(b.cidade, "pt-BR"),
    )
  }, [events])

  const categoryCounts = useMemo(() => {
    const base = {} as Record<EventCategoria, number>
    for (const c of EVENT_CATEGORIAS) base[c] = 0
    for (const e of events) base[e.categoria] = (base[e.categoria] ?? 0) + 1
    return base
  }, [events])

  const monthOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of events) {
      for (const bucket of eventMonthBuckets(e.data, e.dataFim)) {
        counts.set(bucket, (counts.get(bucket) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, count]) => ({ iso, label: formatMonthLabel(iso), count }))
  }, [events])

  const filtered = useMemo(() => {
    const q = normalize(filter.query)
    return events.filter((e) => {
      if (filter.cidades.length > 0 && !filter.cidades.includes(e.cidade)) return false
      if (filter.categorias.length > 0 && !filter.categorias.includes(e.categoria)) return false
      if (filter.meses.length > 0) {
        const buckets = eventMonthBuckets(e.data, e.dataFim)
        if (!buckets.some((b) => filter.meses.includes(b))) return false
      }
      if (filter.comIngresso && !(e.ticketUrl && e.ticketUrl.trim())) return false
      if (!q) return true
      const hay = normalize(
        [e.nome, e.cidade, e.uf, e.venue, e.teaser, e.categoria]
          .filter(Boolean)
          .join(" "),
      )
      return hay.includes(q)
    })
  }, [events, filter])

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
    filter.cidades.length +
    filter.categorias.length +
    filter.meses.length +
    (filter.comIngresso ? 1 : 0)

  return (
    <section aria-labelledby="eventos-list-title" className="scroll-mt-24">
      {/* Mobile header: title + view toggle + filter trigger */}
      <div className="lg:hidden mb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="eventos-list-title"
            className="font-black uppercase text-[#2D1810] text-xl tracking-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {filtered.length === 0
              ? "Nenhum evento"
              : `${filtered.length} ${filtered.length === 1 ? "evento" : "eventos"}`}
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
          <EventsFilterSidebar
            value={filter}
            onChange={setFilter}
            cityOptions={cityOptions}
            categoryCounts={categoryCounts}
            monthOptions={monthOptions}
            totalResults={filtered.length}
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
                <EventsFilterSidebar
                  value={filter}
                  onChange={setFilter}
                  cityOptions={cityOptions}
                  categoryCounts={categoryCounts}
                  monthOptions={monthOptions}
                  totalResults={filtered.length}
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
                id="eventos-list-title"
                className="font-black uppercase text-[#2D1810] text-2xl md:text-3xl tracking-tight"
                style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
              >
                {filtered.length === 0
                  ? "Nenhum evento encontrado"
                  : `${filtered.length} ${filtered.length === 1 ? "evento" : "eventos"}`}
              </h2>
              {filtered.length > 0 && view === "list" && totalPages > 1 && (
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
              onClear={() => setFilter(EMPTY_FILTER)}
            />
          ) : view === "map" ? (
            <EventsMap events={filtered} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 items-stretch">
                {pageItems.map((event) => (
                  <EventCard key={event.id} event={event} />
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
                    className="h-10 px-4 rounded-lg border border-[#4A2C1A]/15 text-sm font-semibold text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm font-semibold text-[#4A2C1A]/70 tabular-nums px-3">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="h-10 px-4 rounded-lg border border-[#4A2C1A]/15 text-sm font-semibold text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Próxima
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
        active={value === "list"}
        onClick={() => onChange("list")}
        icon={<LayoutGrid size={14} strokeWidth={2.4} />}
        label="Lista"
      />
      <ToggleOption
        active={value === "map"}
        onClick={() => onChange("map")}
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
}: {
  hasFilters: boolean
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-14 px-6 rounded-3xl bg-white border border-dashed border-[#4A2C1A]/15">
      <div className="w-14 h-14 rounded-full bg-[#F5E6D0] flex items-center justify-center text-[#E87A1E]">
        <CalendarOff size={24} strokeWidth={2.1} />
      </div>
      <h3
        className="font-black uppercase text-[#2D1810] text-xl tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        {hasFilters ? "Nada bate com esses filtros." : "Sem eventos na agenda."}
      </h3>
      <p className="text-sm text-[#4A2C1A]/65 max-w-md">
        {hasFilters
          ? "Tenta afrouxar ou limpa tudo pra ver a agenda completa."
          : "Assim que a próxima data for confirmada, aparece aqui."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#E87A1E] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#C4650F]"
        >
          <X size={14} strokeWidth={2.5} />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
