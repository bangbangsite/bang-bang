"use client"

import Link from "next/link"
import { MessageCircleQuestion, ArrowRight, CircleCheck, Info } from "lucide-react"
import { useFAQ } from "@/lib/faq/useFAQ"

function formatRelative(iso: string | null): string | null {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "há poucos segundos"
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)} min`
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)} h`
  const days = Math.floor(diff / 86_400_000)
  return `há ${days} ${days === 1 ? "dia" : "dias"}`
}

export function FAQSnapshot() {
  const { items, count, max, updatedAt } = useFAQ()
  const fillPct = (count / max) * 100
  const edited = updatedAt !== null

  return (
    <section className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6 flex flex-col">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion size={16} strokeWidth={2.2} className="text-[#E87A1E]" />
          <h2
            className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            Perguntas frequentes
          </h2>
        </div>
        <Link
          href="/dashboard/faq"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase text-[#E87A1E] border border-[#E87A1E]/30 hover:border-[#E87A1E]/60 hover:bg-[#E87A1E]/5 rounded-lg px-3 py-1.5 transition-colors"
        >
          Gerenciar
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </header>

      {/* Capacity line */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="font-black uppercase leading-none text-[#1A1A1A] tabular-nums"
          style={{
            fontFamily: "var(--font-heading-var)",
            fontWeight: 700,
            fontSize: "clamp(2rem, 3.5vw, 2.5rem)",
          }}
        >
          {count}
          <span className="text-[#4A2C1A]/35 text-2xl">/{max}</span>
        </span>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="h-2 rounded-full bg-[#4A2C1A]/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${fillPct}%`,
                background: "linear-gradient(90deg, #ffd36a 0%, #E87A1E 60%, #C4650F 100%)",
              }}
            />
          </div>
          <p className="text-[11px] font-semibold text-[#4A2C1A]/55 flex items-center gap-1.5">
            {edited ? (
              <>
                <CircleCheck size={12} strokeWidth={2.2} className="text-[#2E7D32]" />
                Última edição {formatRelative(updatedAt)}
              </>
            ) : (
              <>
                <Info size={12} strokeWidth={2.2} className="text-[#4A2C1A]/40" />
                Usando perguntas padrão — ainda sem edição
              </>
            )}
          </p>
        </div>
      </div>

      {/* Preview — primeiras 3 perguntas */}
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.slice(0, 3).map((item, i) => (
            <li
              key={item.id}
              className="flex items-start gap-2.5 text-sm text-[#2D1810]"
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#FAFAF8] text-[10px] font-black text-[#C4650F] flex items-center justify-center tabular-nums border border-[#4A2C1A]/8">
                {i + 1}
              </span>
              <span className="line-clamp-1 flex-1 font-semibold text-[#2D1810]/85">
                {item.question}
              </span>
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-xs text-[#4A2C1A]/45 italic pl-7.5">
              …e mais {items.length - 3}
            </li>
          )}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center py-4">
          <p className="text-sm text-[#4A2C1A]/55">
            Nenhuma pergunta ativa.{" "}
            <Link href="/dashboard/faq" className="font-semibold text-[#E87A1E] hover:text-[#C4650F] underline underline-offset-2">
              Adicionar
            </Link>
          </p>
        </div>
      )}
    </section>
  )
}
