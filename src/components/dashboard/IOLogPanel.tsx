"use client"

import { ArrowDownToLine, ArrowUpFromLine, History, Trash2 } from "lucide-react"
import { useIOLog, type IOEvent } from "@/lib/pdvs/io-log"

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} · ${hh}:${mi}`
}

export function IOLogPanel() {
  const { log, clear } = useIOLog()

  if (log.length === 0) return null

  return (
    <details className="group rounded-2xl border border-[#4A2C1A]/8 bg-white overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer select-none hover:bg-[#FAFAF8] transition-colors list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2.5">
          <History size={14} strokeWidth={2.2} className="text-[#4A2C1A]/50" />
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/60">
            Histórico de importações e exportações
          </span>
          <span className="text-[11px] tabular-nums text-[#4A2C1A]/40">
            ({log.length})
          </span>
        </div>
        <svg
          className="text-[#4A2C1A]/40 transition-transform group-open:rotate-180"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>

      <ul className="border-t border-[#4A2C1A]/8 max-h-80 overflow-y-auto">
        {log.map((ev) => (
          <LogItem key={ev.id} ev={ev} />
        ))}
      </ul>

      <div className="flex justify-end border-t border-[#4A2C1A]/8 px-4 py-2">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Limpar todo o histórico de importações e exportações?")) {
              clear()
            }
          }}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4A2C1A]/60 hover:text-[#D32F2F] transition-colors"
        >
          <Trash2 size={12} strokeWidth={2.2} />
          Limpar histórico
        </button>
      </div>
    </details>
  )
}

function LogItem({ ev }: { ev: IOEvent }) {
  const isExport = ev.kind === "export"
  const Icon = isExport ? ArrowUpFromLine : ArrowDownToLine
  return (
    <li className="flex items-start gap-3 px-4 py-3 border-b last:border-0 border-[#4A2C1A]/8 text-sm">
      <div
        className={
          isExport
            ? "w-8 h-8 rounded-full flex items-center justify-center bg-[#E87A1E]/10 text-[#E87A1E] shrink-0"
            : "w-8 h-8 rounded-full flex items-center justify-center bg-[#4CAF50]/10 text-[#2E7D32] shrink-0"
        }
      >
        <Icon size={14} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/50">
            {isExport ? "Exportação" : "Importação"}
          </span>
          <span className="text-[11px] text-[#4A2C1A]/40 tabular-nums">
            {formatDate(ev.at)}
          </span>
        </div>
        <p className="text-sm text-[#2D1810] font-semibold truncate">
          {ev.filename}
        </p>
        <p className="text-xs text-[#4A2C1A]/60 mt-0.5">{ev.summary}</p>
      </div>
    </li>
  )
}
