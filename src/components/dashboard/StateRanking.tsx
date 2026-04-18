import type { UF } from "@/lib/types/pdv"

interface StateRankingProps {
  data: readonly { uf: string; count: number }[]
  title?: string
  /** Max rows to render. Default: all. */
  limit?: number
}

const UF_NAMES: Record<UF, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
}

export function StateRanking({ data, title = "PDVs por estado", limit }: StateRankingProps) {
  const rows = limit ? data.slice(0, limit) : data
  const total = data.reduce((sum, r) => sum + r.count, 0)
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0)

  return (
    <section className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6">
      <header className="flex items-end justify-between gap-3 mb-4">
        <h2
          className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {title}
        </h2>
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/50">
          {rows.length} {rows.length === 1 ? "estado" : "estados"}
        </span>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-[#4A2C1A]/50 italic">Sem dados ainda.</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {rows.map((r, i) => {
            const pct = max === 0 ? 0 : (r.count / max) * 100
            const share = total === 0 ? 0 : (r.count / total) * 100
            return (
              <li key={r.uf} className="grid grid-cols-[28px_64px_1fr_auto] items-center gap-3 text-sm">
                <span className="text-[#4A2C1A]/40 text-xs font-bold tabular-nums text-right">
                  {i + 1}
                </span>
                <span className="font-bold text-[#2D1810]">
                  <span className="inline-block w-6 text-[11px] tracking-wider">{r.uf}</span>
                </span>
                <div className="relative h-3 rounded-full bg-[#FAFAF8] border border-[#4A2C1A]/8 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, #ffd36a 0%, #E87A1E 60%, #C4650F 100%)",
                    }}
                    aria-label={`${UF_NAMES[r.uf as UF] ?? r.uf}: ${r.count} PDVs`}
                  />
                </div>
                <div className="flex items-baseline gap-2 min-w-[88px] justify-end">
                  <span className="font-bold tabular-nums text-[#2D1810]">{r.count}</span>
                  <span className="text-[11px] text-[#4A2C1A]/40 tabular-nums">
                    {share.toFixed(1)}%
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
