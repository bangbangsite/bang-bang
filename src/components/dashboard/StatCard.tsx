import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: React.ReactNode
  /**
   * Featured = brand-orange surface used to anchor the most important stat
   * on the page. Subtle linear gradient + white text. Should appear at most
   * once per row to keep the visual hierarchy clear.
   */
  featured?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  featured,
  className,
}: StatCardProps) {
  if (featured) {
    return (
      <article
        className={cn(
          "rounded-2xl p-5 md:p-6 bg-white border border-[#E87A1E]/55 transition-colors hover:border-[#E87A1E]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#C4650F]">
            {label}
          </span>
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E87A1E]/12 text-[#E87A1E]">
              {icon}
            </div>
          )}
        </div>
        <div
          className="mt-3 font-black uppercase leading-none text-[#E87A1E] tabular-nums"
          style={{
            fontFamily: "var(--font-heading-var)",
            fontWeight: 700,
            fontSize: "clamp(2.25rem, 3.5vw, 3rem)",
          }}
        >
          {value}
        </div>
        {hint && <p className="mt-2 text-xs text-[#4A2C1A]/55">{hint}</p>}
      </article>
    )
  }

  return (
    <article
      className={cn(
        "rounded-2xl p-5 md:p-6 bg-white border border-[#4A2C1A]/8 transition-colors hover:border-[#4A2C1A]/15",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4A2C1A]/55">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FAFAF8] text-[#E87A1E]">
            {icon}
          </div>
        )}
      </div>
      <div
        className="mt-3 font-black uppercase leading-none text-[#1A1A1A] tabular-nums"
        style={{
          fontFamily: "var(--font-heading-var)",
          fontWeight: 700,
          fontSize: "clamp(2.25rem, 3.5vw, 3rem)",
        }}
      >
        {value}
      </div>
      {hint && <p className="mt-2 text-xs text-[#4A2C1A]/50">{hint}</p>}
    </article>
  )
}
