"use client"

import type { ClickEngagement, CTACategoryKey } from "@/lib/contacts/clicks-server"

interface CategoryMeta {
  key: CTACategoryKey
  label: string
  icon: React.ReactNode
  color: string
}

interface CTAEngagementDisplayProps {
  engagement: ClickEngagement
  categories: CategoryMeta[]
}

export function CTAEngagementDisplay({ engagement, categories }: CTAEngagementDisplayProps) {
  const { totalByCategory } = engagement

  const total =
    totalByCategory.revenda + totalByCategory.distribuidor + totalByCategory.eventos

  let topCategory: CTACategoryKey | null = null
  if (total > 0) {
    topCategory = (
      [
        ["revenda", totalByCategory.revenda],
        ["distribuidor", totalByCategory.distribuidor],
        ["eventos", totalByCategory.eventos],
      ] as [CTACategoryKey, number][]
    ).sort((a, b) => b[1] - a[1])[0][0]
  }

  return (
    <>
      {/* Per-category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {categories.map((cat) => {
          const count = totalByCategory[cat.key]
          const share = total === 0 ? 0 : (count / total) * 100
          const isTop = total > 0 && topCategory === cat.key

          return (
            <div
              key={cat.key}
              className="rounded-xl border border-[#4A2C1A]/8 bg-[#FAFAF8] p-4 flex flex-col gap-3 relative overflow-hidden"
            >
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

              {/* Top badge — sm+ only */}
              {isTop && (
                <span className="hidden sm:inline-flex absolute top-2 right-2 text-[9px] font-bold tracking-[0.18em] uppercase bg-[#E87A1E] text-white px-1.5 py-0.5 rounded">
                  Top
                </span>
              )}

              <div className="flex items-center justify-end gap-3">
                <p className="text-[10px] text-[#4A2C1A]/40 tabular-nums shrink-0">
                  {share.toFixed(share >= 10 ? 0 : 1)}% do total
                </p>
              </div>

              {/* Share bar */}
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

      {total === 0 && (
        <p className="text-center text-[#4A2C1A]/45 text-sm py-4">
          Quando os visitantes clicarem nos CTAs, os números aparecem aqui.
        </p>
      )}
    </>
  )
}
