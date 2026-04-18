"use client"

import { useMemo, useRef, useEffect, useSyncExternalStore } from "react"
import { ArrowDown, Sparkles } from "lucide-react"
import { Container } from "@/components/shared/Container"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

// Static star positions generated on the client so SSR stays stable.
const STAR_SEEDS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: (i * 97) % 100,
  top: 5 + ((i * 41) % 85),
  size: 2 + (i % 4),
  dur: 3 + ((i * 13) % 5),
  delay: -((i * 7) % 6),
  opacity: 0.3 + ((i * 17) % 60) / 100,
}))

const SOCIAL_CHIPS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitch",
  "Kwai",
  "X · Twitter",
  "Reels",
  "Shorts",
  "Lives",
  "Podcasts",
]

interface MarqueeBandProps {
  rotation: number
  enabled: boolean
  accent: string
  order: "primary" | "secondary"
}

function MarqueeBand({ rotation, enabled, accent, order }: MarqueeBandProps) {
  // Anchored to the viewport's horizontal center so both bands share the
  // exact same rotation origin — guaranteeing their X crossing falls on
  // the page's center line, regardless of container padding or layout.
  const isPrimary = order === "primary"
  return (
    <div
      className="absolute left-1/2 top-1/2 overflow-hidden border-y"
      style={{
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        width: "118vw",
        padding: "7px 0",
        // The lighter band sits behind the darker one — primary on top.
        zIndex: isPrimary ? 2 : 1,
        background: isPrimary
          ? "linear-gradient(90deg, rgba(10,6,6,0.85), rgba(26,10,8,0.95) 50%, rgba(10,6,6,0.85))"
          : "linear-gradient(90deg, rgba(26,10,8,0.75), rgba(40,20,10,0.9) 50%, rgba(26,10,8,0.75))",
        borderTopColor: `${accent}33`,
        borderBottomColor: `${accent}33`,
        boxShadow: isPrimary
          ? `0 0 32px -8px ${accent}55`
          : `0 0 28px -10px ${accent}55`,
        mixBlendMode: isPrimary ? undefined : "screen",
        opacity: isPrimary ? 1 : 0.88,
      }}
    >
      <div
        className="flex whitespace-nowrap marquee-track"
        style={{
          // Counter-moving tracks: both use the same `marquee` keyframe; the
          // secondary band reverses direction. (Relying on a separate
          // `marquee-reverse` keyframe turned out to be unreliable under
          // Tailwind v4's @theme scoping — `reverse` is identical and safer.)
          animation: enabled
            ? `marquee 42s linear infinite${isPrimary ? "" : " reverse"}`
            : undefined,
          willChange: "transform",
        }}
      >
        {[...Array(2)].map((_, loop) => (
          <div key={loop} className="flex items-center shrink-0" aria-hidden={loop === 1}>
            {SOCIAL_CHIPS.map((chip, i) => (
              <span
                key={`${loop}-${i}`}
                className="inline-flex items-center gap-2.5 px-4 md:px-5 font-black uppercase tracking-[0.12em] text-sm md:text-base"
              >
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    fontFamily: "var(--font-heading-var)",
                    backgroundImage:
                      i % 3 === 0
                        ? "linear-gradient(90deg, #d4ff4d, #a8e620)"
                        : i % 3 === 1
                        ? "linear-gradient(90deg, #ffd36a, #E87A1E)"
                        : "linear-gradient(90deg, #ff7a3a, #ff3a8a)",
                  }}
                >
                  {chip}
                </span>
                <span style={{ color: `${accent}99` }}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BangerHero() {
  const heroRef = useRef<HTMLElement>(null)
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const isWide = useMediaQuery("(min-width: 1024px)")
  const fxEnabled = !reduceMotion && isWide

  const stars = useMemo(() => (fxEnabled ? STAR_SEEDS : []), [fxEnabled])

  // Mouse-reactive radial glow (desktop only). Cheap: CSS vars updated on pointermove.
  useEffect(() => {
    if (!fxEnabled) return
    const hero = heroRef.current
    if (!hero) return

    const handleMove = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect()
      const rx = ((e.clientX - rect.left) / rect.width) * 100
      const ry = ((e.clientY - rect.top) / rect.height) * 100
      hero.style.setProperty("--glow-x", `${rx}%`)
      hero.style.setProperty("--glow-y", `${ry}%`)
    }
    hero.addEventListener("pointermove", handleMove)
    return () => hero.removeEventListener("pointermove", handleMove)
  }, [fxEnabled])

  return (
    <section
      ref={heroRef}
      id="banger-hero"
      className="relative overflow-hidden text-white min-h-[85vh] md:min-h-[90vh] lg:min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 30%), rgba(210,255,90,0.16), transparent 45%), " +
          "radial-gradient(circle at 15% 85%, rgba(232,122,30,0.28), transparent 55%), " +
          "radial-gradient(circle at 85% 15%, rgba(255,211,106,0.2), transparent 50%), " +
          "linear-gradient(165deg, #08040a 0%, #14080a 20%, #1f0d08 45%, #2a1410 72%, #3d1f0a 100%)",
      }}
    >
      {/* Film grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* Floating stars */}
      {fxEnabled &&
        stars.map((s) => (
          <span
            key={s.id}
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background:
                "radial-gradient(circle, rgba(255,240,200,0.95), rgba(255,200,120,0))",
              filter: "blur(0.4px)",
              animation: `bangerStarFloat ${s.dur}s ease-in-out ${s.delay}s infinite`,
              opacity: s.opacity,
            }}
          />
        ))}

      {/* Decorative wavy lines (subtle background decoration) */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <path d="M0,200 Q300,100 600,220 T1200,180" stroke="#ffd36a" strokeWidth="1.5" fill="none" />
        <path d="M0,420 Q400,340 800,460 T1600,400" stroke="#E87A1E" strokeWidth="1.5" fill="none" />
        <path d="M0,640 Q300,560 700,680 T1400,620" stroke="#d4ff4d" strokeWidth="1.5" fill="none" />
      </svg>

      <Container className="relative z-10 flex-1 flex">
        <div className="relative pt-28 md:pt-32 pb-6 md:pb-10 flex-1 flex flex-col justify-center w-full">
          {/* Eyebrow */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.3em] uppercase px-4 py-2 rounded-full border border-white/25 bg-white/[0.04] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#d4ff4d] shadow-[0_0_12px_#d4ff4d]" />
              Programa de embaixadores
              <Sparkles size={12} strokeWidth={2.4} className="text-[#ffd36a]" />
            </span>
          </div>

          {/* Title row — flanked by side stats on desktop */}
          <div className="relative mt-8 md:mt-10">
            {/* Left stat (desktop only, absolute so it doesn't push title) */}
            <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col items-start gap-1.5 animate-[bangerFloatSlow_6s_ease-in-out_infinite] max-w-[220px]">
              <span className="text-[10px] font-black tracking-[0.24em] uppercase text-white/50">
                Pago por campanha
              </span>
              <span
                className="font-black uppercase bg-clip-text text-transparent leading-none"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 2.4vw, 2.25rem)",
                  backgroundImage:
                    "linear-gradient(180deg, #d4ff4d 0%, #a8e620 100%)",
                }}
              >
                R$ + caixas
              </span>
            </div>

            {/* Right stat (desktop only) */}
            <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col items-end gap-1.5 animate-[bangerFloatSlow_7s_ease-in-out_-2s_infinite] max-w-[220px]">
              <span className="text-[10px] font-black tracking-[0.24em] uppercase text-white/50">
                Eventos exclusivos
              </span>
              <span
                className="font-black uppercase bg-clip-text text-transparent leading-none"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 2.4vw, 2.25rem)",
                  backgroundImage:
                    "linear-gradient(180deg, #ffd36a 0%, #E87A1E 100%)",
                }}
              >
                Acesso VIP
              </span>
            </div>

            {/* Massive title */}
            <h1
              className="text-center font-black uppercase leading-[0.92] tracking-[-0.02em] px-4 lg:px-[240px]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                fontSize: "clamp(3rem, 10vw, 9rem)",
              }}
            >
              <span className="block">Seja um</span>
              <span
                className="block bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(255,122,58,0.35)]"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #d4ff4d 0%, #ffd36a 35%, #ff7a3a 70%, #E87A1E 100%)",
                }}
              >
                Banger.
              </span>
            </h1>
          </div>

          {/* Mobile/tablet stats — shown below title */}
          <div className="lg:hidden mt-6 flex items-center justify-center gap-6 md:gap-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black tracking-[0.24em] uppercase text-white/50">
                Pago por campanha
              </span>
              <span
                className="font-black uppercase bg-clip-text text-transparent leading-none"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                  backgroundImage: "linear-gradient(180deg, #d4ff4d 0%, #a8e620 100%)",
                }}
              >
                R$ + caixas
              </span>
            </div>
            <span aria-hidden="true" className="h-8 w-px bg-white/15" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black tracking-[0.24em] uppercase text-white/50">
                Eventos exclusivos
              </span>
              <span
                className="font-black uppercase bg-clip-text text-transparent leading-none"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                  backgroundImage: "linear-gradient(180deg, #ffd36a 0%, #E87A1E 100%)",
                }}
              >
                Acesso VIP
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="mt-7 md:mt-8 max-w-[56ch] mx-auto text-center text-white/75 text-base md:text-lg leading-relaxed">
            A Bang Bang não quer influencer. Quer <strong className="text-white">banger</strong> — gente
            que vive a noite, tem voz própria e não vende script. Se você é isso, a gente
            paga, solta a lata e te leva junto.
          </p>

          {/* CTA row */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#sou-banger"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-black text-sm tracking-[0.12em] uppercase bg-[#d4ff4d] text-[#14080a] shadow-[0_10px_40px_rgba(212,255,77,0.35)] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(212,255,77,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14080a]"
            >
              Quero ser Banger
              <ArrowDown size={14} strokeWidth={2.8} />
            </a>
            <a
              href="#manifesto"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-bold text-sm tracking-[0.12em] uppercase text-white border border-white/40 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14080a]"
            >
              Ver o manifesto
            </a>
          </div>
        </div>
      </Container>

      {/* Crossed X marquee bands — full-bleed, outside Container.
          The wrapper spans the whole viewport and positions each band with
          `left: 50%` + `translate(-50%, -50%)` so both rotations share the
          exact same center — guaranteeing the X crossing lands on the
          horizontal middle of the page regardless of parent layout. */}
      <div
        aria-hidden={!fxEnabled}
        className="relative w-full mt-10 md:mt-14 mb-6 md:mb-8 pointer-events-none"
        style={{ height: "110px" }}
      >
        <MarqueeBand
          rotation={-4}
          enabled={fxEnabled}
          accent="#d4ff4d"
          order="primary"
        />
        <MarqueeBand
          rotation={4}
          enabled={fxEnabled}
          accent="#ff7a3a"
          order="secondary"
        />
      </div>
    </section>
  )
}
