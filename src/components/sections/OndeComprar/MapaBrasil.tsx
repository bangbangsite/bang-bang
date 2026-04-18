"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useOndeComprar } from "./store"
import { BRASIL_PATHS, BRASIL_VIEWBOX } from "@/lib/data/brasil-paths"
import type { UF } from "@/lib/types/pdv"
import { cn } from "@/lib/utils"

interface TooltipState {
  uf: UF
  name: string
  count: number
  /** Client x in SVG coords */
  x: number
  y: number
}

export function MapaBrasil() {
  const { activeUfs, activeUfSet, filter, setFilter, clearFilter } = useOndeComprar()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const countByUF = useMemo(() => {
    const m = new Map<UF, number>()
    for (const u of activeUfs) m.set(u.uf, u.count)
    return m
  }, [activeUfs])

  const handleClick = useCallback(
    (uf: UF, name: string) => {
      if (!activeUfSet.has(uf)) return
      const isAlreadySelected = filter.kind === "uf" && filter.value === uf
      if (isAlreadySelected) {
        clearFilter()
        return
      }
      setFilter({ kind: "uf", value: uf, label: `${name} (${uf})` })
      // Scroll the list into view — it sits below the map on mobile
      requestAnimationFrame(() => {
        document
          .getElementById("onde-comprar-lista")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    },
    [activeUfSet, filter, setFilter, clearFilter],
  )

  const handleEnter = useCallback(
    (uf: UF, name: string, e: React.MouseEvent<SVGPathElement>) => {
      if (!activeUfSet.has(uf)) return
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const count = countByUF.get(uf) ?? 0
      setTooltip({
        uf,
        name,
        count,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [activeUfSet, countByUF],
  )

  const handleMove = useCallback(
    (e: React.MouseEvent<SVGPathElement>) => {
      const svg = svgRef.current
      if (!svg || !tooltip) return
      const rect = svg.getBoundingClientRect()
      setTooltip({ ...tooltip, x: e.clientX - rect.left, y: e.clientY - rect.top })
    },
    [tooltip],
  )

  const handleLeave = useCallback(() => setTooltip(null), [])

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={BRASIL_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Mapa do Brasil com os estados onde a Bang Bang está presente"
        className="w-full h-auto max-h-[520px]"
      >
        <title>Mapa dos estados com Bang Bang</title>
        {BRASIL_PATHS.map(({ uf, name, d }) => {
          const isActive = activeUfSet.has(uf)
          const isSelected = filter.kind === "uf" && filter.value === uf
          return (
            <path
              key={uf}
              d={d}
              data-uf={uf}
              role={isActive ? "button" : undefined}
              aria-label={
                isActive
                  ? `${name} (${uf}) — ${countByUF.get(uf) ?? 0} PDVs. Clique para filtrar.`
                  : `${name} (${uf}) — em breve`
              }
              aria-disabled={!isActive}
              aria-pressed={isActive ? isSelected : undefined}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "transition-all duration-200 stroke-[0.8]",
                isActive
                  ? isSelected
                    ? "fill-[#C4650F] stroke-white cursor-pointer"
                    : "fill-[#E87A1E] stroke-white hover:fill-[#C4650F] cursor-pointer focus-visible:outline-none focus-visible:fill-[#C4650F]"
                  : "fill-[#E5DCCF] stroke-white cursor-not-allowed",
              )}
              onClick={() => handleClick(uf, name)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && isActive) {
                  e.preventDefault()
                  handleClick(uf, name)
                }
              }}
              onMouseEnter={(e) => handleEnter(uf, name, e)}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              onFocus={(e) => {
                if (!isActive) return
                const bbox = (e.target as SVGPathElement).getBBox()
                setTooltip({
                  uf,
                  name,
                  count: countByUF.get(uf) ?? 0,
                  x: bbox.x + bbox.width / 2,
                  y: bbox.y,
                })
              }}
              onBlur={handleLeave}
            />
          )
        })}
      </svg>

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 px-3 py-2 rounded-lg bg-[#2D1810] text-white text-xs shadow-lg whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -110%)",
          }}
        >
          <div className="font-bold">{tooltip.name}</div>
          <div className="text-white/70">
            {tooltip.count} {tooltip.count === 1 ? "PDV ativo" : "PDVs ativos"}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-[#4A2C1A]/70">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#E87A1E]" />
          Disponível
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#E5DCCF]" />
          Em breve
        </span>
      </div>
    </div>
  )
}
