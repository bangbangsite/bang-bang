import { cn } from "@/lib/utils"

interface SectionTitleProps {
  /** Plain title (always rendered first). */
  title: string
  /**
   * Optional second piece of the title rendered with the brand orange
   * gradient — same treatment used in EventsHero / OndeEncontrarHero.
   * The component decides the line-break: inline on small screens,
   * forced break (<br />) on md+ when both pieces are present.
   */
  highlight?: string
  /** Optional eyebrow pill rendered above the title. */
  eyebrow?: string
  /** Color of the eyebrow dot when an eyebrow is shown. Defaults to orange. */
  eyebrowDotColor?: string
  subtitle?: string
  align?: "left" | "center"
  /** True when the section background is dark — flips text colors. */
  light?: boolean
  className?: string
}

export function SectionTitle({
  title,
  highlight,
  eyebrow,
  eyebrowDotColor = "#E87A1E",
  subtitle,
  align = "left",
  light = false,
  className,
}: SectionTitleProps) {
  const isCenter = align === "center"

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isCenter && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.28em] uppercase px-3.5 py-2 rounded-full backdrop-blur-md self-start",
            light
              ? "border border-white/35 bg-white/5 text-white"
              : "border border-[#2D1810]/20 bg-white/60 text-[#4A2C1A]",
            isCenter && "self-center",
          )}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: eyebrowDotColor,
              boxShadow: `0 0 10px ${eyebrowDotColor}`,
            }}
          />
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          "font-black uppercase leading-[0.95] tracking-tight",
          light ? "text-white" : "text-[#1A1A1A]",
        )}
        style={{
          fontFamily: "var(--font-heading-var)",
          fontWeight: 700,
          fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
        }}
      >
        {title}
        {highlight && (
          <>
            {/* On md+ we let the highlight take its own line for impact;
                on small screens it stays inline so it doesn't waste vertical
                space. */}
            <span className="hidden md:inline">
              <br />
            </span>
            <span className="md:hidden"> </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #E87A1E, #ff7a3a 55%, #E87A1E)",
              }}
            >
              {highlight}
            </span>
          </>
        )}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "font-body text-base md:text-lg max-w-2xl leading-relaxed",
            light ? "text-white/75" : "text-[#4A2C1A]/70",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
