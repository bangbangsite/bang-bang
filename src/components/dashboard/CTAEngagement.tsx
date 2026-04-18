"use client"

import { useState, useEffect } from "react"
import {
  MessageCircle,
  Briefcase,
  PartyPopper,
  MousePointerClick,
  RotateCcw,
} from "lucide-react"
import { useClickStats, type CTACategory } from "@/lib/contacts/clicks"
import { useContacts } from "@/lib/contacts/useContacts"

function formatRelative(iso: string | null): string {
  if (!iso) return "Sem cliques ainda"
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "Agora há pouco"
  if (diff < 3_600_000) return `Há ${Math.floor(diff / 60_000)} min`
  if (diff < 86_400_000) return `Há ${Math.floor(diff / 3_600_000)} h`
  const days = Math.floor(diff / 86_400_000)
  return `Há ${days} ${days === 1 ? "dia" : "dias"}`
}

function formatFirstAt(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

interface CategoryMeta {
  key: CTACategory
  label: string
  icon: React.ReactNode
  color: string
}

const CATEGORIES: CategoryMeta[] = [
  { key: "revenda", label: "Revenda", icon: <MessageCircle size={16} strokeWidth={2.2} />, color: "#E87A1E" },
  { key: "distribuidor", label: "Distribuidor", icon: <Briefcase size={16} strokeWidth={2.2} />, color: "#C4650F" },
  { key: "eventos", label: "Eventos", icon: <PartyPopper size={16} strokeWidth={2.2} />, color: "#ffd36a" },
]

export function CTAEngagement() {
  const { clicks, total, topCategory, reset } = useClickStats()
  const { hasAnyConfigured } = useContacts()
  const firstAt = formatFirstAt(clicks.firstAt)
  const [confirmingReset, setConfirmingReset] = useState(false)

  // Auto-dismiss the confirm state after a few seconds if not clicked.
  useEffect(() => {
    if (!confirmingReset) return
    const t = setTimeout(() => setConfirmingReset(false), 4000)
    return () => clearTimeout(t)
  }, [confirmingReset])

  const handleReset = () => {
    if (confirmingReset) {
      reset()
      setConfirmingReset(false)
      return
    }
    setConfirmingReset(true)
  }

  return (
    <section className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6">
      <header className="flex items-end justify-between gap-3 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <MousePointerClick size={16} strokeWidth={2.2} className="text-[#E87A1E]" />
            <h2
              className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Engajamento nos CTAs
            </h2>
          </div>
          <p className="text-xs text-[#4A2C1A]/60 mt-0.5">
            {firstAt
              ? `Registrando cliques desde ${firstAt}`
              : "Quando os visitantes clicarem nos CTAs, eles aparecem aqui"}
          </p>
        </div>

        {total > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className={
              confirmingReset
                ? "inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#D32F2F] bg-[#D32F2F] text-white text-xs font-bold hover:bg-[#B71C1C] transition-colors"
                : "inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#4A2C1A]/15 text-[#4A2C1A]/70 text-xs font-semibold hover:bg-[#2D1810]/5 transition-colors"
            }
            aria-label={confirmingReset ? "Confirmar reset" : "Zerar contadores"}
          >
            <RotateCcw size={12} strokeWidth={2.2} />
            {confirmingReset ? "Confirmar" : "Zerar contadores"}
          </button>
        )}
      </header>

      {!hasAnyConfigured && (
        <div className="rounded-xl bg-[#FAFAF8] border border-[#E87A1E]/25 text-[#4A2C1A] px-3.5 py-2.5 text-xs flex items-start gap-2.5 mb-4">
          <span className="shrink-0 text-[#E87A1E] font-black">!</span>
          <p>
            Nenhum canal configurado ainda. Vai em <strong>Contatos</strong> pra adicionar o WhatsApp de cada categoria — os cliques já estão sendo contados mesmo sem link.
          </p>
        </div>
      )}

      {/* Total bar + per-category breakdown. Single column on phones so each
          card breathes; 3 across from sm+ where there's room for the full
          label. Phone cards use a horizontal layout (icon + label + number
          in one row, share bar underneath) to keep vertical footprint
          contained even when stacked. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {CATEGORIES.map((cat) => {
          const count = clicks[cat.key]
          const lastKey = `last${cat.key.charAt(0).toUpperCase()}${cat.key.slice(1)}` as
            | "lastRevenda"
            | "lastDistribuidor"
            | "lastEventos"
          const last = clicks[lastKey]
          const share = total === 0 ? 0 : (count / total) * 100
          const isTop = total > 0 && topCategory === cat.key

          return (
            <div
              key={cat.key}
              className="rounded-xl border border-[#4A2C1A]/8 bg-[#FAFAF8] p-4 flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Phone layout — icon + label on the left, number on the right.
                  Sm+ layout stacks them so the number gets to be big. */}
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start sm:gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="shrink-0 w-8 h-8 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-white"
                    style={{ background: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[11px] sm:text-[10px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/70 truncate">
                    {cat.label}
                  </span>
                  {isTop && (
                    <span className="shrink-0 sm:hidden text-[9px] font-bold tracking-[0.18em] uppercase bg-[#E87A1E] text-white px-1.5 py-0.5 rounded">
                      Top
                    </span>
                  )}
                </div>
                <div
                  className="font-black uppercase leading-none text-[#1A1A1A] tabular-nums"
                  style={{
                    fontFamily: "var(--font-heading-var)",
                    fontWeight: 700,
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  }}
                >
                  {count.toLocaleString("pt-BR")}
                </div>
              </div>

              {/* Top badge — sm+ only (phone shows it inline with the label). */}
              {isTop && (
                <span className="hidden sm:inline-flex absolute top-2 right-2 text-[9px] font-bold tracking-[0.18em] uppercase bg-[#E87A1E] text-white px-1.5 py-0.5 rounded">
                  Top
                </span>
              )}

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-[#4A2C1A]/55 leading-tight">
                  {formatRelative(last)}
                </p>
                <p className="text-[10px] text-[#4A2C1A]/40 tabular-nums shrink-0">
                  {share.toFixed(share >= 10 ? 0 : 1)}% do total
                </p>
              </div>

              {/* share bar */}
              <div className="h-1.5 rounded-full bg-[#4A2C1A]/8 overflow-hidden mt-auto">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${share}%`,
                    background:
                      "linear-gradient(90deg, #ffd36a 0%, #E87A1E 60%, #C4650F 100%)",
                  }}
                  aria-label={`${share.toFixed(1)}% dos cliques`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Total line */}
      {total > 0 && (
        <div className="mt-4 pt-4 border-t border-[#2D1810]/10 flex items-center justify-between gap-3 text-sm">
          <span className="text-[#4A2C1A]/60">Total de cliques</span>
          <span
            className="font-black uppercase text-[#2D1810] tabular-nums text-lg"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {total.toLocaleString("pt-BR")}
          </span>
        </div>
      )}
    </section>
  )
}
