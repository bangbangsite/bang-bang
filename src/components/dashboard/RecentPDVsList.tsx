import Link from "next/link"
import { MapPin, Plus } from "lucide-react"
import type { PDV } from "@/lib/types/pdv"

interface RecentPDVsListProps {
  items: readonly PDV[]
  /** Max items to render when there's data. */
  max?: number
  /** Called when the "Adicionar" chip is clicked. */
  onAdd?: () => void
}

export function RecentPDVsList({ items, max = 5, onAdd }: RecentPDVsListProps) {
  const rows = items.slice(0, max)

  return (
    <section className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6">
      <header className="flex items-end justify-between gap-3 mb-4">
        <h2
          className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          Últimos cadastrados
        </h2>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase text-[#E87A1E] border border-[#E87A1E]/30 hover:border-[#E87A1E]/60 hover:bg-[#E87A1E]/5 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus size={13} strokeWidth={2.5} />
            Adicionar
          </button>
        ) : (
          <Link
            href="/dashboard/pdvs"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase text-[#E87A1E] border border-[#E87A1E]/30 hover:border-[#E87A1E]/60 hover:bg-[#E87A1E]/5 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus size={13} strokeWidth={2.5} />
            Gerenciar
          </Link>
        )}
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
            <MapPin size={20} strokeWidth={2.4} />
          </div>
          <p className="text-sm text-[#4A2C1A]/60">
            Nenhum PDV cadastrado ou editado por aqui ainda.
          </p>
          <p className="text-xs text-[#4A2C1A]/40 max-w-sm">
            Quando você adicionar ou editar um PDV pela aba <strong>PDVs</strong>, ele aparece nesta lista.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((pdv, i) => (
            <li
              key={pdv.id}
              className={
                i < rows.length - 1
                  ? "py-3 border-b border-[#4A2C1A]/8 flex items-center gap-3"
                  : "py-3 flex items-center gap-3"
              }
            >
              <div className="w-10 h-10 rounded-full bg-[#E87A1E] flex items-center justify-center text-white shrink-0">
                <MapPin size={16} strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-black uppercase text-[#2D1810] text-sm leading-tight truncate"
                  style={{ fontFamily: "var(--font-heading-var)" }}
                >
                  {pdv.nome}
                </p>
                <p className="text-xs text-[#4A2C1A]/60 truncate mt-0.5">
                  {pdv.cidade}/{pdv.uf}
                  {pdv.bairro ? ` · ${pdv.bairro}` : ""}
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#E87A1E] bg-[#E87A1E]/10 rounded-full px-2.5 py-1 shrink-0">
                {pdv.tipo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
