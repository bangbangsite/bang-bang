"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  X,
  MapPin,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from "lucide-react"
import type { BangEvent, EventCategoria } from "@/lib/events/config"
import { BRASIL_PATHS, BRASIL_VIEWBOX } from "@/lib/data/brasil-paths"
import { EventCoverPlaceholder } from "./EventCoverPlaceholder"
import { cn } from "@/lib/utils"

// Approximate positions in the BRASIL_VIEWBOX (450×460) for the cities that
// appear in the events dataset. Unknown cities don't get a pin (degraded ok).
const CITY_COORDS: Record<string, { x: number; y: number }> = {
  Salvador: { x: 348, y: 198 },
  Recife: { x: 370, y: 168 },
  "Belo Horizonte": { x: 310, y: 278 },
  Uberlândia: { x: 278, y: 275 },
  "Rio de Janeiro": { x: 325, y: 300 },
  "São Paulo": { x: 293, y: 300 },
  Brasília: { x: 280, y: 248 },
  Curitiba: { x: 278, y: 320 },
  Florianópolis: { x: 285, y: 340 },
  "Porto Alegre": { x: 263, y: 357 },
}

const CATEGORIA_COLORS: Record<EventCategoria, string> = {
  Festa: "#D12B72",      // magenta, slightly darker than the dark theme pink
  Show: "#7EB619",       // olive-lime — readable on cream
  Festival: "#E87A1E",   // brand orange
  Rooftop: "#C4650F",    // brand orange-dark
  Ativação: "#2E8AB0",   // deep teal
}

const MONTH_ABBR = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
]

const PAGE_SIZE = 6

function parseISOLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

function formatDayMonth(iso: string): { day: string; month: string } {
  const d = parseISOLocal(iso)
  return { day: `${d.getDate()}`, month: MONTH_ABBR[d.getMonth()].toUpperCase() }
}

function formatDurationHint(e: BangEvent): string | null {
  if (!e.dataFim) return null
  const ms = parseISOLocal(e.dataFim).getTime() - parseISOLocal(e.data).getTime()
  const days = Math.max(1, Math.round(ms / 86400000))
  return `+${days}d`
}

interface EventsMapProps {
  /** Events to show as pins. Already filtered upstream by the browser. */
  events: readonly BangEvent[]
}

export function EventsMap({ events }: EventsMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const cardRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const listRef = useRef<HTMLOListElement | null>(null)

  // Group events by city so a single pin represents stacked events.
  const cityGroups = useMemo(() => {
    const m = new Map<string, BangEvent[]>()
    for (const ev of events) {
      if (!CITY_COORDS[ev.cidade]) continue
      const list = m.get(ev.cidade) ?? []
      list.push(ev)
      m.set(ev.cidade, list)
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
  }, [events])

  const totalOnMap = cityGroups.reduce((sum, [, l]) => sum + l.length, 0)
  const droppedEvents = events.length - totalOnMap

  // Reset selection + pagination when the filter shifts
  const eventsKey = events.map((e) => e.id).join("|")
  const [trackedKey, setTrackedKey] = useState(eventsKey)
  if (eventsKey !== trackedKey) {
    setTrackedKey(eventsKey)
    setPage(1)
    setSelectedId(null)
  }

  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = events.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handlePinClick = useCallback(
    (firstEvent: BangEvent) => {
      setSelectedId(firstEvent.id)
      const idx = events.findIndex((e) => e.id === firstEvent.id)
      if (idx >= 0) {
        const targetPage = Math.floor(idx / PAGE_SIZE) + 1
        setPage(targetPage)
      }
    },
    [events],
  )

  const handleCardClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  // Scroll selected card into view (within the side list, not the page)
  useEffect(() => {
    if (!selectedId) return
    const el = cardRefs.current.get(selectedId)
    const container = listRef.current
    if (!el || !container) return
    const elRect = el.getBoundingClientRect()
    const cRect = container.getBoundingClientRect()
    if (elRect.top < cRect.top || elRect.bottom > cRect.bottom) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedId, safePage])

  return (
    <div className="flex flex-col gap-5">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#4A2C1A]/70">
        <span className="inline-flex items-center gap-2 font-semibold text-[#2D1810]">
          <MapPin size={14} strokeWidth={2.4} className="text-[#E87A1E]" />
          {totalOnMap} {totalOnMap === 1 ? "evento no mapa" : "eventos no mapa"}
          {cityGroups.length > 0 && (
            <span className="text-[#4A2C1A]/50">
              {" · "}
              {cityGroups.length}{" "}
              {cityGroups.length === 1 ? "cidade" : "cidades"}
            </span>
          )}
        </span>
        {droppedEvents > 0 && (
          <span className="text-xs text-[#4A2C1A]/50 italic">
            +{droppedEvents} sem coordenadas no mapa
          </span>
        )}
      </div>

      {/* Map + side list */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-5 lg:gap-6 items-start">
        {/* Map card */}
        <div
          className="relative rounded-3xl border border-[#4A2C1A]/10 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(255,211,106,0.18), transparent 65%), " +
              "linear-gradient(180deg, #FFFDF7 0%, #F5E6D0 100%)",
            boxShadow:
              "0 20px 50px -30px rgba(74,44,26,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
          }}
        >
          <svg
            viewBox={BRASIL_VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Mapa do Brasil com eventos Bang Bang"
            className="w-full h-auto"
          >
            <title>Mapa dos eventos Bang Bang</title>

            {/* UF outlines */}
            {BRASIL_PATHS.map(({ uf, name, d }) => {
              const hasEvents = cityGroups.some(
                ([, list]) => list[0]?.uf === uf,
              )
              return (
                <path
                  key={uf}
                  d={d}
                  aria-label={name}
                  className="transition-colors duration-200 stroke-[0.6]"
                  style={{
                    fill: hasEvents
                      ? "rgba(232,122,30,0.14)"
                      : "rgba(74,44,26,0.05)",
                    stroke: hasEvents
                      ? "rgba(232,122,30,0.5)"
                      : "rgba(74,44,26,0.18)",
                  }}
                />
              )
            })}

            {/* Pins */}
            {cityGroups.map(([cidade, list]) => {
              const coords = CITY_COORDS[cidade]
              const first = list[0]
              const color = CATEGORIA_COLORS[first.categoria]
              const isSelected =
                selectedId !== null && list.some((e) => e.id === selectedId)
              const isHovered = hoveredCity === cidade

              return (
                <g key={cidade}>
                  {(isSelected || isHovered) && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={13}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.2}
                      opacity={0.7}
                      style={{
                        animation: "eventPinPulse 1.8s ease-out infinite",
                        transformOrigin: `${coords.x}px ${coords.y}px`,
                      }}
                    />
                  )}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 10 : 8}
                    fill={color}
                    opacity={0.22}
                  />
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 5.2 : 4.2}
                    fill={color}
                    stroke="#FAFAF8"
                    strokeWidth={1.4}
                    className="cursor-pointer transition-all duration-150"
                    style={{
                      filter: isSelected
                        ? `drop-shadow(0 0 8px ${color})`
                        : undefined,
                    }}
                    onClick={() => handlePinClick(first)}
                    onMouseEnter={() => setHoveredCity(cidade)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handlePinClick(first)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${cidade}: ${list.length} ${
                      list.length === 1 ? "evento" : "eventos"
                    }`}
                  />
                  {list.length > 1 && (
                    <g pointerEvents="none">
                      <circle
                        cx={coords.x + 4.5}
                        cy={coords.y - 4.5}
                        r={3.6}
                        fill="#FAFAF8"
                        stroke={color}
                        strokeWidth={0.8}
                      />
                      <text
                        x={coords.x + 4.5}
                        y={coords.y - 3.4}
                        textAnchor="middle"
                        fontSize={4.2}
                        fill={color}
                        fontWeight={900}
                      >
                        {list.length}
                      </text>
                    </g>
                  )}

                  {/* City label on hover */}
                  {isHovered && (
                    <g pointerEvents="none">
                      <rect
                        x={coords.x + 10}
                        y={coords.y - 8}
                        width={cidade.length * 2.8 + 8}
                        height={10}
                        rx={3}
                        fill="#2D1810"
                        stroke={`${color}88`}
                        strokeWidth={0.5}
                      />
                      <text
                        x={coords.x + 14}
                        y={coords.y - 1}
                        fontSize={4.5}
                        fill="#FAFAF8"
                        fontWeight={700}
                        style={{ textTransform: "uppercase", letterSpacing: 0.4 }}
                      >
                        {cidade}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Category legend */}
          <div className="absolute bottom-3 left-3 right-3 md:left-4 md:right-auto flex flex-wrap gap-x-3 gap-y-2 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-[#4A2C1A]/10 shadow-[0_4px_14px_-6px_rgba(74,44,26,0.12)]">
            {(Object.keys(CATEGORIA_COLORS) as EventCategoria[]).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#2D1810]/80"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: CATEGORIA_COLORS[cat],
                    boxShadow: `0 0 6px ${CATEGORIA_COLORS[cat]}88`,
                  }}
                />
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Side list — paginated mini horizontal cards (~6/page) */}
        <div className="flex flex-col gap-3 min-h-[420px]">
          {events.length === 0 ? (
            <EmptyPanel cityCount={cityGroups.length} />
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-[#4A2C1A]/55">
                  {events.length} {events.length === 1 ? "evento" : "eventos"}
                  {selectedId && (
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="ml-2 inline-flex items-center gap-1 font-bold text-[#E87A1E] hover:text-[#C4650F]"
                    >
                      <X size={10} strokeWidth={2.6} />
                      limpar
                    </button>
                  )}
                </p>
                {totalPages > 1 && (
                  <span className="text-[10px] font-bold text-[#4A2C1A]/50 tabular-nums">
                    {safePage}/{totalPages}
                  </span>
                )}
              </div>

              <ol ref={listRef} className="flex flex-col gap-2.5">
                {pageItems.map((e) => {
                  const onMap = Boolean(CITY_COORDS[e.cidade])
                  return (
                    <li key={e.id} className="relative">
                      <MiniEventCard
                        event={e}
                        color={CATEGORIA_COLORS[e.categoria]}
                        isSelected={selectedId === e.id}
                        onMap={onMap}
                        onClick={() => handleCardClick(e.id)}
                        ref={(el) => {
                          cardRefs.current.set(e.id, el)
                        }}
                      />
                      {e.ticketUrl && (
                        <a
                          href={e.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Comprar ingresso — ${e.nome}`}
                          title="Comprar ingresso"
                          className={cn(
                            "absolute right-2.5 top-1/2 -translate-y-1/2 z-10",
                            "inline-flex items-center justify-center w-10 h-10 rounded-full",
                            "bg-[#E87A1E] text-white shadow-[0_6px_14px_-6px_rgba(232,122,30,0.7)]",
                            "hover:bg-[#C4650F] hover:scale-105 active:scale-95 transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2",
                          )}
                        >
                          <Ticket size={16} strokeWidth={2.6} aria-hidden="true" />
                        </a>
                      )}
                    </li>
                  )
                })}
              </ol>

              {totalPages > 1 && (
                <nav
                  aria-label="Paginação dos eventos no mapa"
                  className="mt-2 flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label="Página anterior"
                    className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-[#4A2C1A]/15 text-[12px] font-semibold text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                    Anterior
                  </button>
                  <span className="text-[12px] font-semibold text-[#4A2C1A]/70 tabular-nums">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    aria-label="Próxima página"
                    className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-[#4A2C1A]/15 text-[12px] font-semibold text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-30 disabled:cursor-not-allowed"
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
    </div>
  )
}

interface MiniEventCardProps {
  event: BangEvent
  color: string
  isSelected: boolean
  onMap: boolean
  onClick: () => void
}

const MiniEventCard = ({
  ref,
  event,
  color,
  isSelected,
  onMap,
  onClick,
}: MiniEventCardProps & {
  ref?: React.Ref<HTMLButtonElement>
}) => {
  const { day, month } = formatDayMonth(event.data)
  const duration = formatDurationHint(event)
  const hasCover = Boolean(event.coverUrl && event.coverUrl.trim())

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        "group w-full flex items-stretch gap-3 p-2 rounded-xl border bg-white text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
        isSelected
          ? "shadow-[0_10px_24px_-12px_rgba(232,122,30,0.45)]"
          : "border-[#4A2C1A]/10 hover:border-[#E87A1E]/40 hover:shadow-[0_8px_18px_-12px_rgba(232,122,30,0.3)]",
      )}
      style={
        isSelected
          ? { borderColor: color, boxShadow: `0 10px 24px -12px ${color}66` }
          : undefined
      }
    >
      {/* Cover thumbnail with date overlay */}
      <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0">
        {hasCover ? (
          <Image
            src={event.coverUrl!}
            alt=""
            fill
            sizes="72px"
            className="object-cover"
          />
        ) : (
          <EventCoverPlaceholder seed={event.id} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/55" />
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center text-white leading-none">
          <span
            className="text-[16px] font-black tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {day}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.18em] mt-0.5 opacity-95">
            {month}
          </span>
        </div>
        {duration && (
          <span className="absolute top-1 right-1 px-1 h-3.5 inline-flex items-center rounded-sm bg-white/90 text-[8px] font-black tracking-[0.06em] text-[#2D1810] tabular-nums">
            {duration}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: color, boxShadow: `0 0 5px ${color}88` }}
          />
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color }}
          >
            {event.categoria}
          </span>
          {event.destaque && (
            <span className="text-[8px] font-black uppercase tracking-[0.18em] px-1.5 py-px rounded-sm bg-[#E87A1E]/10 text-[#C4650F]">
              Destaque
            </span>
          )}
        </div>
        <h3
          className="font-black uppercase text-[#1A1A1A] text-[13px] leading-tight tracking-tight line-clamp-1"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {event.nome}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-[#4A2C1A]/65 min-w-0">
          <MapPin
            size={10}
            strokeWidth={2.5}
            className={cn("shrink-0", onMap ? "text-[#E87A1E]" : "text-[#4A2C1A]/35")}
            aria-hidden="true"
          />
          <span className="truncate">
            {event.cidade}
            {event.uf && `, ${event.uf}`}
            {event.venue && (
              <>
                <span className="text-[#4A2C1A]/30"> · </span>
                {event.venue}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right-side ingresso CTA is rendered in <li> as a separate <a> so it
          stays a real link and doesn't nest inside this <button>. We just
          reserve room for it visually so the title doesn't run under it. */}
      {event.ticketUrl && <span aria-hidden="true" className="w-10 shrink-0" />}
    </button>
  )
}

function EmptyPanel({ cityCount }: { cityCount: number }) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl border border-dashed border-[#4A2C1A]/20 bg-white/70 p-8 md:p-10",
        "flex flex-col items-center justify-center text-center gap-4",
      )}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(232,122,30,0.12)",
          color: "#E87A1E",
          boxShadow: "inset 0 0 0 1.5px rgba(232,122,30,0.3)",
        }}
      >
        <MousePointerClick size={22} strokeWidth={2.2} />
      </div>
      <h3
        className="font-black uppercase text-lg md:text-xl tracking-tight text-[#2D1810]"
        style={{ fontFamily: "var(--font-heading-var)" }}
      >
        Nada por aqui
      </h3>
      <p className="text-sm text-[#4A2C1A]/65 max-w-xs">
        {cityCount > 0
          ? "Os filtros zeraram a lista. Afrouxa pra ver os pinos voltarem."
          : "Nenhum evento bate com os filtros atuais. Limpa ou troca pra voltar a ter pinos no mapa."}
      </p>
    </div>
  )
}
