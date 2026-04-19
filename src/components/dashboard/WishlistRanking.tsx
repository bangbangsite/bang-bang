import Link from "next/link"
import { TrendingUp, ArrowUpRight, MapPin } from "lucide-react"
import type { CityRankRow } from "@/lib/wishlist/config"

interface WishlistRankingProps {
  ranking: readonly CityRankRow[]
  total: number
}

// Presentational widget — TOP 5 cities by demand on /onde-encontrar. Data is
// fetched by the parent Server Component and passed as props.
export function WishlistRanking({ ranking, total }: WishlistRankingProps) {
  const top5 = ranking.slice(0, 5)
  const maxCount = top5[0]?.count ?? 1

  return (
    <section
      aria-labelledby="wishlist-ranking-title"
      className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6 flex flex-col"
    >
      <header className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.22em] uppercase text-[#E87A1E] mb-1.5">
            <TrendingUp size={12} strokeWidth={2.5} />
            Demanda
          </div>
          <h2
            id="wishlist-ranking-title"
            className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            Onde mais querem Bang Bang
          </h2>
          <p className="text-[11px] text-[#4A2C1A]/55 mt-1">
            TOP 5 cidades por pedidos vindos do site
          </p>
        </div>
        <Link
          href="/dashboard/solicitacoes"
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#E87A1E] hover:text-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] rounded"
        >
          Ver tudo
          <ArrowUpRight size={12} strokeWidth={2.5} />
        </Link>
      </header>

      {top5.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
            <MapPin size={16} strokeWidth={2.2} />
          </div>
          <p className="text-sm font-semibold text-[#4A2C1A]/70">
            Ainda sem pedidos
          </p>
          <p className="text-xs text-[#4A2C1A]/50 max-w-xs leading-relaxed">
            Quando alguém indicar a cidade dele no site, o ranking aparece aqui.
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {top5.map((row, i) => {
            const width = Math.max(8, Math.round((row.count / maxCount) * 100))
            return (
              <li
                key={`${row.cidade}-${row.uf}-${i}`}
                className="relative rounded-xl bg-[#FAFAF8] border border-[#4A2C1A]/8 p-3 flex items-center gap-3 overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-[#E87A1E]/10"
                  style={{ width: `${width}%` }}
                />
                <div className="relative w-7 h-7 shrink-0 rounded-full bg-[#E87A1E] text-white flex items-center justify-center text-[11px] font-black">
                  {i + 1}
                </div>
                <div className="relative flex-1 min-w-0">
                  <div
                    className="font-black uppercase text-[#2D1810] text-sm leading-tight truncate"
                    style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                  >
                    {row.cidade}
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/55 mt-0.5">
                    {row.uf || "—"}
                  </div>
                </div>
                <div className="relative flex items-baseline gap-1 shrink-0 text-[#C4650F]">
                  <span
                    className="font-black text-lg leading-none tabular-nums"
                    style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                  >
                    {row.count}
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#4A2C1A]/50">
                    {row.count === 1 ? "voto" : "votos"}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {total > 0 && (
        <footer className="mt-4 pt-3 border-t border-[#4A2C1A]/8 text-[11px] text-[#4A2C1A]/55">
          {total.toLocaleString("pt-BR")} {total === 1 ? "solicitação total" : "solicitações no total"}
        </footer>
      )}
    </section>
  )
}
