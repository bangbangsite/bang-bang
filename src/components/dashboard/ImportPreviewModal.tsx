"use client"

import { useEffect } from "react"
import { X, Plus, Pencil, AlertTriangle } from "lucide-react"
import type { ImportPreview } from "@/lib/pdvs/import"

interface ImportPreviewModalProps {
  preview: ImportPreview | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ImportPreviewModal({
  preview,
  open,
  onClose,
  onConfirm,
}: ImportPreviewModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !preview) return null

  const { filename, totalRows, toAdd, toUpdate, skipped } = preview
  const hasChanges = toAdd.length + toUpdate.length > 0

  const badgeCls =
    "inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] uppercase rounded-full px-2.5 py-1"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0A]/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl border border-[#4A2C1A]/8 shadow-[0_30px_60px_-20px_rgba(45,24,16,0.35)] my-8 flex flex-col max-h-[calc(100vh-4rem)]"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#4A2C1A]/8">
          <div className="min-w-0">
            <h2
              id="import-modal-title"
              className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Revisar importação
            </h2>
            <p className="text-xs text-[#4A2C1A]/60 mt-0.5 truncate">
              <span className="font-mono">{filename}</span> ·{" "}
              {totalRows.toLocaleString("pt-BR")} linhas lidas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#4A2C1A]/55 hover:text-[#2D1810] hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] shrink-0"
          >
            <X size={18} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Summary chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${badgeCls} bg-[#2E7D32]/10 text-[#2E7D32]`}>
              <Plus size={12} strokeWidth={2.5} />
              {toAdd.length} novos
            </span>
            <span className={`${badgeCls} bg-[#E87A1E]/10 text-[#C4650F]`}>
              <Pencil size={12} strokeWidth={2.5} />
              {toUpdate.length} atualizados
            </span>
            <span className={`${badgeCls} bg-[#FAFAF8] border border-[#4A2C1A]/8 text-[#4A2C1A]/70`}>
              <AlertTriangle size={12} strokeWidth={2.5} />
              {skipped.length} ignorados
            </span>
          </div>

          {!hasChanges && (
            <div className="rounded-xl bg-[#FAFAF8] border border-[#E87A1E]/25 px-4 py-3 text-sm text-[#4A2C1A]">
              Nada pra aplicar — todas as linhas foram ignoradas. Confere se a planilha está no formato padrão.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PreviewList
              title="Vão ser adicionados"
              items={toAdd.slice(0, 5).map((p) => `${p.nome} (${p.cidade}/${p.uf})`)}
              more={Math.max(0, toAdd.length - 5)}
              emptyText="—"
            />
            <PreviewList
              title="Vão ser atualizados"
              items={toUpdate.slice(0, 5).map((u) => `${u.nome} (${u.id})`)}
              more={Math.max(0, toUpdate.length - 5)}
              emptyText="—"
            />
          </div>

          {skipped.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/60 mb-2">
                Ignorados ({skipped.length})
              </h3>
              <ul className="rounded-xl border border-[#4A2C1A]/8 bg-[#FAFAF8] p-3 text-xs text-[#4A2C1A]/70 flex flex-col gap-1 max-h-40 overflow-y-auto">
                {skipped.slice(0, 20).map((s, i) => (
                  <li key={i}>
                    <span className="font-mono text-[#4A2C1A]/40">linha {s.row}</span>
                    {s.nome ? ` · ${s.nome}` : ""} · <em>{s.reason}</em>
                  </li>
                ))}
                {skipped.length > 20 && (
                  <li className="text-[#4A2C1A]/40 italic">
                    …e mais {skipped.length - 20}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#4A2C1A]/8 bg-[#FAFAF8] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/75 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!hasChanges}
            className="h-10 px-4 rounded-lg text-[13px] font-semibold bg-[#E87A1E] text-white hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
          >
            Aplicar importação
          </button>
        </footer>
      </div>
    </div>
  )
}

function PreviewList({
  title,
  items,
  more,
  emptyText,
}: {
  title: string
  items: string[]
  more: number
  emptyText: string
}) {
  return (
    <div>
      <h3 className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/60 mb-2">
        {title}
      </h3>
      <ul className="rounded-xl border border-[#4A2C1A]/8 bg-[#FAFAF8] p-3 text-sm text-[#2D1810] flex flex-col gap-1 min-h-[80px]">
        {items.length === 0 ? (
          <li className="text-[#4A2C1A]/40 italic">{emptyText}</li>
        ) : (
          items.map((label, i) => (
            <li key={i} className="truncate">
              {label}
            </li>
          ))
        )}
        {more > 0 && (
          <li className="text-[#4A2C1A]/50 italic">…e mais {more}</li>
        )}
      </ul>
    </div>
  )
}
