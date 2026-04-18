"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Truck,
} from "lucide-react"
import type { PDV, UF } from "@/lib/types/pdv"
import { BRASIL_PATHS, BRASIL_VIEWBOX } from "@/lib/data/brasil-paths"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 6

const TIPO_COLORS: Record<string, string> = {
  Bar: "#D12B72",
  Restaurante: "#7EB619",
  "Casa Noturna": "#B85FE6",
  Mercado: "#E87A1E",
  Conveniência: "#2E8AB0",
  Distribuidora: "#C4650F",
  Rooftop: "#FFA64D",
  Outros: "#7A7A7A",
}

interface OndeEncontrarMapProps {
  /** PDVs already filtered by the browser (search/UF/cidade/tipo/delivery). */
  pdvs: readonly PDV[]
  /**
   * All UFs that have at least one PDV in the full dataset, ignoring the
   * current filter. Drives which states stay clickable on the map even when
   * a single-UF filter has narrowed `pdvs` down to that one state.
   */
  availableUfs: ReadonlySet<UF>
  /** UFs currently selected in the sidebar. Click on the map toggles these. */
  selectedUfs: UF[]
  onToggleUF: (uf: UF) => void
}

export function OndeEncontrarMap({
  pdvs,
  availableUfs,
  selectedUfs,
  onToggleUF,
}: OndeEncontrarMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const cardRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const listRef = useRef<HTMLOListElement | null>(null)

  // Group PDVs by UF — fuels the path-fill intensity + lets clicking a state
  // jump directly to that subset in the side list.
  const ufBuckets = useMemo(() => {
    const m = new Map<UF, PDV[]>()
    for (const p of pdvs) {
      const list = m.get(p.uf) ?? []
      list.push(p)
      m.set(p.uf, list)
    }
    return m
  }, [pdvs])

  const selectedUfSet = useMemo(() => new Set(selectedUfs), [selectedUfs])

  // Reset page + selection when the filtered set shifts
  const pdvsKey = pdvs.map((p) => p.id).join("|")
  const [trackedKey, setTrackedKey] = useState(pdvsKey)
  if (pdvsKey !== trackedKey) {
    setTrackedKey(pdvsKey)
    setPage(1)
    setSelectedId(null)
  }

  const totalPages = Math.max(1, Math.ceil(pdvs.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = pdvs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleUFClick = useCallback(
    (uf: UF) => {
      if (!availableUfs.has(uf)) return
      onToggleUF(uf)
    },
    [availableUfs, onToggleUF],
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
          {pdvs.length} {pdvs.length === 1 ? "PDV" : "PDVs"}
          {ufBuckets.size > 0 && (
            <span className="text-[#4A2C1A]/50">
              {" · "}
              {ufBuckets.size} {ufBuckets.size === 1 ? "estado" : "estados"}
            </span>
          )}
        </span>
        {selectedUfs.length > 0 && (
          <span className="text-xs text-[#4A2C1A]/50 italic">
            Filtrando: {selectedUfs.join(", ")}
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
            aria-label="Mapa do Brasil com os estados onde a Bang Bang está presente"
            className="w-full h-auto"
          >
            <title>Mapa dos PDVs Bang Bang</title>

            {BRASIL_PATHS.map(({ uf, name, d }) => {
              const isAvailable = availableUfs.has(uf)
              const bucket = ufBuckets.get(uf)
              const filteredCount = bucket?.length ?? 0
              const isSelected = selectedUfSet.has(uf)
              return (
                <path
                  key={uf}
                  d={d}
                  data-uf={uf}
                  role={isAvailable ? "button" : undefined}
                  aria-label={
                    isAvailable
                      ? `${name} (${uf}) — ${filteredCount} PDVs visíveis. ${isSelected ? "Filtro ativo." : "Clique para filtrar."}`
                      : `${name} (${uf}) — em breve`
                  }
                  aria-disabled={!isAvailable}
                  aria-pressed={isAvailable ? isSelected : undefined}
                  tabIndex={isAvailable ? 0 : -1}
                  className={cn(
                    "transition-all duration-200 stroke-[0.6]",
                    isAvailable
                      ? isSelected
                        ? "fill-[#C4650F] stroke-white cursor-pointer"
                        : "fill-[#E87A1E] stroke-white hover:fill-[#C4650F] cursor-pointer focus-visible:outline-none focus-visible:fill-[#C4650F]"
                      : "fill-[#4A2C1A]/8 stroke-[#4A2C1A]/15 cursor-not-allowed",
                  )}
                  style={{
                    // When the user is filtering, available-but-empty states
                    // dim down to point attention at the active selection.
                    opacity: isAvailable
                      ? selectedUfs.length === 0 || isSelected
                        ? 1
                        : filteredCount > 0
                          ? 0.85
                          : 0.4
                      : 1,
                  }}
                  onClick={() => handleUFClick(uf)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && isAvailable) {
                      e.preventDefault()
                      handleUFClick(uf)
                    }
                  }}
                />
              )
            })}

            {/* UF count labels — drop a small disc with the count over each
                state that has PDVs. Position is the centroid of the path's
                bounding box, which we approximate with predefined coords for
                readability (BRASIL_VIEWBOX is 450×460). */}
            {Object.entries(UF_LABEL_COORDS).map(([uf, c]) => {
              const bucket = ufBuckets.get(uf as UF)
              if (!bucket || bucket.length === 0) return null
              const isSelected = selectedUfSet.has(uf as UF)
              return (
                <g key={`lbl-${uf}`} pointerEvents="none">
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={5.5}
                    fill={isSelected ? "#FAFAF8" : "#2D1810"}
                    fillOpacity={isSelected ? 1 : 0.8}
                  />
                  <text
                    x={c.x}
                    y={c.y + 1.6}
                    textAnchor="middle"
                    fontSize={5.2}
                    fontWeight={900}
                    fill={isSelected ? "#C4650F" : "#FAFAF8"}
                  >
                    {bucket.length}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 right-3 md:left-4 md:right-auto flex flex-wrap gap-x-3 gap-y-2 p-2.5 rounded-xl bg-white/85 backdrop-blur-sm border border-[#4A2C1A]/10 shadow-[0_4px_14px_-6px_rgba(74,44,26,0.12)]">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#2D1810]/80">
              <span className="w-2 h-2 rounded-sm bg-[#E87A1E] shadow-[0_0_6px_rgba(232,122,30,0.5)]" />
              Disponível
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#2D1810]/80">
              <span className="w-2 h-2 rounded-sm bg-[#C4650F] shadow-[0_0_6px_rgba(196,101,15,0.5)]" />
              Selecionado
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#2D1810]/40">
              <span className="w-2 h-2 rounded-sm bg-[#4A2C1A]/15" />
              Em breve
            </span>
          </div>
        </div>

        {/* Side list — paginated mini PDV cards (~6/page) */}
        <div className="flex flex-col gap-3 min-h-[420px]">
          {pdvs.length === 0 ? (
            <EmptyPanel ufCount={ufBuckets.size} />
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-[#4A2C1A]/55">
                  {pdvs.length} {pdvs.length === 1 ? "PDV" : "PDVs"}
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
                {pageItems.map((p) => (
                  <li key={p.id} className="relative">
                    <MiniPDVCard
                      pdv={p}
                      color={TIPO_COLORS[p.tipo] ?? TIPO_COLORS.Outros}
                      isSelected={selectedId === p.id}
                      onClick={() => handleCardClick(p.id)}
                      ref={(el) => {
                        cardRefs.current.set(p.id, el)
                      }}
                    />
                    {p.mapsUrl && (
                      <a
                        href={p.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver ${p.nome} no Google Maps`}
                        title="Ver no Maps"
                        className={cn(
                          "absolute right-2.5 top-1/2 -translate-y-1/2 z-10",
                          "inline-flex items-center justify-center w-10 h-10 rounded-full",
                          "bg-[#E87A1E] text-white shadow-[0_6px_14px_-6px_rgba(232,122,30,0.7)]",
                          "hover:bg-[#C4650F] hover:scale-105 active:scale-95 transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2",
                        )}
                      >
                        <MapPin size={16} strokeWidth={2.6} aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ol>

              {totalPages > 1 && (
                <nav
                  aria-label="Paginação dos PDVs no mapa"
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

interface MiniPDVCardProps {
  pdv: PDV
  color: string
  isSelected: boolean
  onClick: () => void
}

const MiniPDVCard = ({
  ref,
  pdv,
  color,
  isSelected,
  onClick,
}: MiniPDVCardProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const isAddressHidden = pdv.tier === "C"

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        "group w-full flex items-center gap-3 px-3 py-2.5 min-h-[72px] rounded-xl border bg-white text-left transition-all",
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
      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: color, boxShadow: `0 0 5px ${color}88` }}
          />
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color }}
          >
            {pdv.tipo}
          </span>
          {pdv.deliveryUrl && (
            <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-[0.16em] px-1.5 py-px rounded-sm bg-[#E87A1E]/10 text-[#C4650F]">
              <Truck size={9} strokeWidth={2.6} />
              Delivery
            </span>
          )}
        </div>
        <h3
          className="font-black uppercase text-[#1A1A1A] text-[13px] leading-tight tracking-tight line-clamp-1"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {pdv.nome}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-[#4A2C1A]/65 min-w-0">
          <MapPin
            size={10}
            strokeWidth={2.5}
            className="shrink-0 text-[#E87A1E]"
            aria-hidden="true"
          />
          <span className="truncate">
            {isAddressHidden ? (
              <span className="italic text-[#4A2C1A]/55">Endereço sob consulta</span>
            ) : (
              <>
                {pdv.cidade}/{pdv.uf}
                {pdv.bairro && (
                  <>
                    <span className="text-[#4A2C1A]/30"> · </span>
                    {pdv.bairro}
                  </>
                )}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right-side Maps CTA is rendered in the parent <li> as a separate <a>
          so it stays a real link and doesn't nest inside this <button>. We
          just reserve room visually so the title doesn't run under it. */}
      {pdv.mapsUrl && <span aria-hidden="true" className="w-10 shrink-0" />}
    </button>
  )
}

function EmptyPanel({ ufCount }: { ufCount: number }) {
  return (
    <div className="w-full rounded-3xl border border-dashed border-[#4A2C1A]/20 bg-white/70 p-8 md:p-10 flex flex-col items-center justify-center text-center gap-4">
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
        {ufCount > 0
          ? "Os filtros zeraram a lista. Afrouxa pra ver os PDVs de novo."
          : "Nenhum PDV bate com os filtros atuais. Limpa ou troca pra voltar a aparecer."}
      </p>
    </div>
  )
}

// Approximate centroids in the BRASIL_VIEWBOX (450×460) for the count discs.
const UF_LABEL_COORDS: Partial<Record<UF, { x: number; y: number }>> = {
  AC: { x: 100, y: 235 },
  AL: { x: 380, y: 198 },
  AP: { x: 215, y: 105 },
  AM: { x: 155, y: 175 },
  BA: { x: 332, y: 220 },
  CE: { x: 350, y: 158 },
  DF: { x: 285, y: 250 },
  ES: { x: 335, y: 282 },
  GO: { x: 270, y: 250 },
  MA: { x: 295, y: 162 },
  MG: { x: 305, y: 270 },
  MS: { x: 230, y: 282 },
  MT: { x: 220, y: 220 },
  PA: { x: 230, y: 152 },
  PB: { x: 380, y: 175 },
  PE: { x: 365, y: 185 },
  PI: { x: 320, y: 180 },
  PR: { x: 263, y: 312 },
  RJ: { x: 322, y: 298 },
  RN: { x: 380, y: 165 },
  RO: { x: 155, y: 230 },
  RR: { x: 165, y: 105 },
  RS: { x: 248, y: 357 },
  SC: { x: 270, y: 335 },
  SE: { x: 365, y: 205 },
  SP: { x: 282, y: 295 },
  TO: { x: 282, y: 200 },
}
