"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  X,
  Sparkles,
  PartyPopper,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { EventFormModal } from "@/components/dashboard/EventFormModal"
import { Select, type SelectOption } from "@/components/shared/Select"
import { useEvents } from "@/lib/events/useEvents"
import {
  EVENT_CATEGORIAS,
  isUpcoming,
  type BangEvent,
  type EventCategoria,
} from "@/lib/events/config"
import { useMobileMenu } from "../mobile-menu-context"
import { cn } from "@/lib/utils"

type Tab = "proximos" | "passados" | "todos"

const MONTH_ABBR = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
]

function parseISOLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

function formatDate(iso: string): string {
  if (!iso) return "—"
  const d = parseISOLocal(iso)
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH_ABBR[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
}

function formatHora(hora?: string): string {
  if (!hora) return ""
  return hora.replace(/^(\d{1,2}):(\d{2})$/, "$1h$2").replace(/h00$/, "h")
}

const CATEGORIA_COLORS: Record<EventCategoria, string> = {
  Festa: "#D12B72",
  Show: "#7EB619",
  Festival: "#E87A1E",
  Rooftop: "#C4650F",
  Ativação: "#2E8AB0",
}

export default function DashboardEventosPage() {
  const { events, addEvent, updateEvent, removeEvent, resetAll, seedDemo } = useEvents()
  const { open: openMobileMenu } = useMobileMenu()

  const [tab, setTab] = useState<Tab>("proximos")
  const [query, setQuery] = useState("")
  const [catFilter, setCatFilter] = useState<"all" | EventCategoria>("all")
  const [onlyDestaque, setOnlyDestaque] = useState(false)

  const [editing, setEditing] = useState<BangEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState<BangEvent | null>(null)

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const handleEdit = (event: BangEvent) => {
    setEditing(event)
    setModalOpen(true)
  }
  const handleSubmit = (event: BangEvent) => {
    if (editing) updateEvent(editing.id, event)
    else addEvent(event)
    setModalOpen(false)
  }
  const handleConfirmDelete = () => {
    if (!confirmingDelete) return
    removeEvent(confirmingDelete.id)
    setConfirmingDelete(null)
  }

  // Quick-action deep link from the sidebar/home: ?new=1 opens the create
  // modal. Dispatched via rAF so the open happens after this effect's body
  // returns — sidesteps the linter's "no setState in effect" rule and avoids
  // cascading renders.
  const autoTriggered = useRef(false)
  useEffect(() => {
    if (autoTriggered.current) return
    autoTriggered.current = true
    const params = new URLSearchParams(window.location.search)
    if (!params.get("new")) return
    const url = new URL(window.location.href)
    url.searchParams.delete("new")
    window.history.replaceState({}, "", url.pathname + (url.search || ""))
    requestAnimationFrame(() => handleCreate())
  }, [])

  // Aggregates — base list per tab (date scope), then local filters narrow it.
  const tabEvents = useMemo(() => {
    if (tab === "todos") return [...events].sort((a, b) => a.data.localeCompare(b.data))
    if (tab === "proximos") {
      return events
        .filter((e) => isUpcoming(e))
        .sort((a, b) => a.data.localeCompare(b.data))
    }
    return events
      .filter((e) => !isUpcoming(e))
      .sort((a, b) => b.data.localeCompare(a.data))
  }, [events, tab])

  const catCounts = useMemo(() => {
    const m = {} as Record<EventCategoria, number>
    for (const c of EVENT_CATEGORIAS) m[c] = 0
    for (const e of tabEvents) m[e.categoria] = (m[e.categoria] ?? 0) + 1
    return m
  }, [tabEvents])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tabEvents.filter((e) => {
      if (catFilter !== "all" && e.categoria !== catFilter) return false
      if (onlyDestaque && !e.destaque) return false
      if (!q) return true
      const hay = [e.nome, e.cidade, e.uf, e.venue, e.teaser, e.categoria]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [tabEvents, query, catFilter, onlyDestaque])

  const proximosCount = useMemo(() => events.filter((e) => isUpcoming(e)).length, [events])
  const passadosCount = events.length - proximosCount
  const destaquesCount = useMemo(
    () => events.filter((e) => e.destaque && isUpcoming(e)).length,
    [events],
  )

  const activeFilterCount =
    (catFilter !== "all" ? 1 : 0) + (onlyDestaque ? 1 : 0) + (query.trim() ? 1 : 0)

  const clearFilters = () => {
    setQuery("")
    setCatFilter("all")
    setOnlyDestaque(false)
  }

  return (
    <>
      <DashboardHeader
        title="Eventos"
        subtitle={`${proximosCount} próximos · ${destaquesCount} em destaque · ${events.length} total`}
        onMenuOpen={openMobileMenu}
        actions={
          <>
            {events.length === 0 && (
              <button
                type="button"
                onClick={seedDemo}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#4A2C1A]/8 bg-white text-[#2D1810] text-[13px] font-semibold hover:bg-[#FAFAF8] hover:border-[#4A2C1A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] transition-colors"
                title="Carregar 20 eventos de exemplo"
              >
                <Sparkles size={15} strokeWidth={2} />
                <span className="hidden sm:inline">Popular com exemplos</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#E87A1E] text-white text-[13px] font-semibold hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
            >
              <Plus size={15} strokeWidth={2.4} />
              <span className="hidden sm:inline">Novo evento</span>
            </button>
          </>
        }
      />

      <div className="px-5 md:px-8 py-6 md:py-8 flex flex-col gap-5">
        {events.length === 0 ? (
          <EmptyPanel onCreate={handleCreate} onSeed={seedDemo} />
        ) : (
          <>
            {/* Tabs — date-scope toggle */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div
                role="tablist"
                aria-label="Filtrar por data"
                className="inline-flex items-center p-1 rounded-lg bg-white border border-[#4A2C1A]/8"
              >
                <TabBtn active={tab === "proximos"} count={proximosCount} onClick={() => setTab("proximos")}>
                  Próximos
                </TabBtn>
                <TabBtn active={tab === "passados"} count={passadosCount} onClick={() => setTab("passados")}>
                  Passados
                </TabBtn>
                <TabBtn active={tab === "todos"} count={events.length} onClick={() => setTab("todos")}>
                  Todos
                </TabBtn>
              </div>

              {events.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Apagar todos os ${events.length} eventos? A página /eventos fica vazia.`)) {
                      resetAll()
                    }
                  }}
                  className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-[12px] font-semibold text-[#4A2C1A]/65 hover:bg-white border border-transparent hover:border-[#4A2C1A]/8 transition-colors"
                >
                  Limpar todos
                </button>
              )}
            </div>

            {/* Filters bar */}
            <div className="flex items-center gap-2.5 flex-wrap rounded-2xl border border-[#4A2C1A]/8 bg-white p-2.5 md:p-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A2C1A]/45"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar nome, cidade, venue, teaser…"
                  className="w-full h-9 pl-9 pr-8 rounded-lg border border-[#4A2C1A]/8 bg-white text-[13px] text-[#2D1810] placeholder:text-[#4A2C1A]/40 focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#FAFAF8]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <Select<"all" | EventCategoria>
                id="ev-cat-filter"
                aria-label="Filtrar por categoria"
                size="sm"
                value={catFilter}
                onChange={setCatFilter}
                active={catFilter !== "all"}
                options={[
                  { value: "all", label: "Categoria · todas" },
                  ...EVENT_CATEGORIAS.map<SelectOption<"all" | EventCategoria>>((c) => ({
                    value: c,
                    label: c,
                    hint: catCounts[c]?.toString(),
                    disabled: (catCounts[c] ?? 0) === 0,
                  })),
                ]}
              />

              <button
                type="button"
                onClick={() => setOnlyDestaque((v) => !v)}
                aria-pressed={onlyDestaque}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold transition-colors",
                  onlyDestaque
                    ? "bg-[#E87A1E] text-white border border-[#E87A1E]"
                    : "bg-white text-[#4A2C1A]/70 border border-[#4A2C1A]/8 hover:bg-[#FAFAF8]",
                )}
              >
                <Star
                  size={12}
                  strokeWidth={2.4}
                  className={onlyDestaque ? "fill-white" : ""}
                />
                Só destaques
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold text-[#4A2C1A]/70 hover:bg-[#FAFAF8] transition-colors ml-auto"
                >
                  <X size={12} strokeWidth={2.5} />
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Event list */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-[#4A2C1A]/15 p-10 text-center text-[#4A2C1A]/55 text-sm italic">
                Nenhum evento bate com esses filtros.
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                {filtered.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onEdit={() => handleEdit(event)}
                    onDelete={() => setConfirmingDelete(event)}
                    onToggleDestaque={() =>
                      updateEvent(event.id, { destaque: !event.destaque })
                    }
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <EventFormModal
        key={modalOpen ? (editing?.id ?? "__create__") : "__closed__"}
        initial={editing}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {confirmingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0A]/40 backdrop-blur-sm"
          onClick={() => setConfirmingDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#4A2C1A]/8 shadow-[0_30px_60px_-20px_rgba(45,24,16,0.35)]"
          >
            <h3
              className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Remover evento?
            </h3>
            <p className="text-sm text-[#4A2C1A]/70 mt-2">
              <strong>{confirmingDelete.nome}</strong>
              {confirmingDelete.cidade ? ` em ${confirmingDelete.cidade}` : ""} ·{" "}
              {formatDate(confirmingDelete.data)}. Some da página /eventos imediatamente.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setConfirmingDelete(null)}
                className="h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/75 hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-10 px-4 rounded-lg text-[13px] font-semibold bg-[#D32F2F] text-white hover:bg-[#B71C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ----------------- TabBtn -----------------

function TabBtn({
  active,
  count,
  children,
  onClick,
}: {
  active: boolean
  count: number
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-semibold transition-colors",
        active
          ? "bg-[#FAFAF8] text-[#1A1A1A] shadow-[inset_0_0_0_1px_rgba(74,44,26,0.08)]"
          : "text-[#4A2C1A]/65 hover:text-[#1A1A1A]",
      )}
    >
      {children}
      <span
        className={cn(
          "text-[10px] tabular-nums px-1.5 py-px rounded",
          active ? "bg-[#E87A1E]/15 text-[#C4650F]" : "bg-[#4A2C1A]/8 text-[#4A2C1A]/55",
        )}
      >
        {count}
      </span>
    </button>
  )
}

// ----------------- EventRow card -----------------

function EventRow({
  event,
  onEdit,
  onDelete,
  onToggleDestaque,
}: {
  event: BangEvent
  onEdit: () => void
  onDelete: () => void
  onToggleDestaque: () => void
}) {
  const color = CATEGORIA_COLORS[event.categoria]
  const upcoming = isUpcoming(event)

  return (
    <li className="relative flex flex-col gap-3 p-4 rounded-2xl bg-white border border-[#4A2C1A]/8 hover:border-[#4A2C1A]/15 transition-colors">
      {/* Header — categoria + status pills */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.18em] uppercase px-2 py-1 rounded-full"
          style={{ background: `${color}14`, color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 5px ${color}88` }}
          />
          {event.categoria}
        </span>
        <div className="flex items-center gap-1">
          {!upcoming && (
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded bg-[#4A2C1A]/8 text-[#4A2C1A]/55">
              Passado
            </span>
          )}
          <button
            type="button"
            onClick={onToggleDestaque}
            aria-label={event.destaque ? "Tirar destaque" : "Marcar como destaque"}
            title={event.destaque ? "Tirar destaque" : "Marcar como destaque"}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              event.destaque
                ? "text-[#E87A1E] bg-[#E87A1E]/10 hover:bg-[#E87A1E]/15"
                : "text-[#4A2C1A]/45 hover:text-[#E87A1E] hover:bg-[#FAFAF8]",
            )}
          >
            <Star
              size={14}
              strokeWidth={2.2}
              className={event.destaque ? "fill-[#E87A1E]" : ""}
            />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3
        className="font-black uppercase text-[#1A1A1A] text-[15px] leading-tight tracking-tight line-clamp-2"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        {event.nome}
      </h3>

      {/* Meta */}
      <div className="flex flex-col gap-1 text-[12px] text-[#4A2C1A]/65">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays size={12} strokeWidth={2.2} className="text-[#E87A1E] shrink-0" />
          <span className="tabular-nums truncate">
            {formatDate(event.data)}
            {event.dataFim && ` → ${formatDate(event.dataFim)}`}
            {event.hora && (
              <span className="text-[#4A2C1A]/45"> · {formatHora(event.hora)}</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={12} strokeWidth={2.2} className="text-[#E87A1E] shrink-0" />
          <span className="truncate">
            {event.cidade}
            {event.uf && `/${event.uf}`}
            {event.venue && (
              <span className="text-[#4A2C1A]/45"> · {event.venue}</span>
            )}
          </span>
        </div>
        {event.ticketUrl && (
          <div className="flex items-center gap-2 min-w-0">
            <Ticket size={12} strokeWidth={2.2} className="text-[#E87A1E] shrink-0" />
            <span className="truncate">
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#C4650F] hover:text-[#E87A1E] underline underline-offset-2 inline-flex items-center gap-1"
              >
                Ingresso à venda
                <ExternalLink size={10} strokeWidth={2.4} />
              </a>
            </span>
          </div>
        )}
      </div>

      {/* Footer — edit/delete actions, pinned to the bottom */}
      <div className="mt-auto pt-3 flex items-center justify-end gap-1 border-t border-[#4A2C1A]/8">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${event.nome}`}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-semibold text-[#4A2C1A]/75 hover:text-[#E87A1E] hover:bg-[#FAFAF8] transition-colors"
        >
          <Pencil size={13} strokeWidth={2.2} />
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remover ${event.nome}`}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#4A2C1A]/55 hover:text-[#D32F2F] hover:bg-[#D32F2F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]"
        >
          <Trash2 size={13} strokeWidth={2.2} />
        </button>
      </div>
    </li>
  )
}

// ----------------- EmptyPanel -----------------

function EmptyPanel({ onCreate, onSeed }: { onCreate: () => void; onSeed: () => void }) {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-[#4A2C1A]/15 p-12 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
        <PartyPopper size={24} strokeWidth={2} />
      </div>
      <p
        className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)" }}
      >
        Nenhum evento ainda
      </p>
      <p className="text-sm text-[#4A2C1A]/60 max-w-sm">
        Cria o primeiro pra ele aparecer em <strong className="text-[#2D1810]">/eventos</strong>{" "}
        — ou popula com 20 exemplos pra testar a página.
      </p>
      <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#E87A1E] text-white text-[13px] font-semibold hover:bg-[#C4650F] transition-colors shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
        >
          <Plus size={15} strokeWidth={2.4} />
          Criar evento
        </button>
        <button
          type="button"
          onClick={onSeed}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#4A2C1A]/8 bg-white text-[#2D1810] text-[13px] font-semibold hover:bg-[#FAFAF8] transition-colors"
        >
          <Sparkles size={15} strokeWidth={2} />
          Popular com 20 exemplos
        </button>
      </div>
    </div>
  )
}
