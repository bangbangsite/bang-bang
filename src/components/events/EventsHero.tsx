"use client"

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { ArrowDown, MapPin, Sparkles } from "lucide-react"
import { Container } from "@/components/shared/Container"
import type { BangEvent } from "@/lib/events/config"

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

// Deterministic star positions so SSR output stays stable.
const STAR_SEEDS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: (i * 83) % 100,
  top: 8 + ((i * 37) % 80),
  size: 2 + (i % 4),
  dur: 3 + ((i * 11) % 5),
  delay: -((i * 5) % 6),
  opacity: 0.3 + ((i * 19) % 55) / 100,
}))

interface EventsHeroProps {
  /** Upcoming events fetched server-side. Used only for stats display. */
  events: readonly BangEvent[]
}

export function EventsHero({ events }: EventsHeroProps) {
  const totalEvents = events.length
  const cityCount = new Set(events.map((e) => e.cidade).filter(Boolean)).size
  const stateCount = new Set(events.map((e) => e.uf).filter(Boolean)).size

  const heroRef = useRef<HTMLElement>(null)
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const isWide = useMediaQuery("(min-width: 1024px)")
  const fxEnabled = !reduceMotion && isWide

  const stars = useMemo(() => (fxEnabled ? STAR_SEEDS : []), [fxEnabled])

  // Mouse-reactive radial glow.
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
      id="eventos-hero"
      className="relative overflow-hidden text-white min-h-[85vh] md:min-h-[90vh] lg:min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 30%), rgba(255,211,106,0.2), transparent 45%), " +
          "radial-gradient(circle at 15% 85%, rgba(232,122,30,0.28), transparent 55%), " +
          "radial-gradient(circle at 85% 15%, rgba(255,211,106,0.18), transparent 50%), " +
          "linear-gradient(165deg, #0a0504 0%, #14080a 22%, #1f0d08 50%, #2a1410 78%, #3d1f0a 100%)",
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

      {/* Decorative wavy lines */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <path
          d="M0,260 Q320,150 640,280 T1280,220"
          stroke="#ffd36a"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,520 Q360,420 720,560 T1400,480"
          stroke="#E87A1E"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <Container className="relative z-10 flex-1 flex">
        <div className="pt-28 md:pt-32 pb-10 md:pb-14 flex-1 flex flex-col justify-center w-full">
          {/* Eyebrow */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.3em] uppercase px-4 py-2 rounded-full border border-white/25 bg-white/[0.04] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#ffd36a] shadow-[0_0_12px_#ffd36a]" />
              Agenda Bang Bang
              <Sparkles size={12} strokeWidth={2.4} className="text-[#ffd36a]" />
            </span>
          </div>

          {/* Title flanked by side mini-stats (desktop only) */}
          <div className="relative mt-8 md:mt-10">
            <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col items-start gap-1.5 animate-[bangerFloatSlow_6s_ease-in-out_infinite] max-w-[200px]">
              <span className="text-[10px] font-black tracking-[0.24em] uppercase text-white/50">
                Eventos confirmados
              </span>
              <span
                className="font-black uppercase bg-clip-text text-transparent leading-none tabular-nums"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 2.4vw, 2.25rem)",
                  backgroundImage:
                    "linear-gradient(180deg, #ffd36a 0%, #E87A1E 100%)",
                }}
              >
                {totalEvents.toLocaleString("pt-BR")}
              </span>
            </div>

            <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col items-end gap-1.5 animate-[bangerFloatSlow_7s_ease-in-out_-2s_infinite] max-w-[200px]">
              <span className="text-[10px] font-black tracking-[0.24em] uppercase text-white/50">
                Cidades no mapa
              </span>
              <span
                className="font-black uppercase bg-clip-text text-transparent leading-none tabular-nums"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 2.4vw, 2.25rem)",
                  backgroundImage:
                    "linear-gradient(180deg, #d4ff4d 0%, #a8e620 100%)",
                }}
              >
                {cityCount.toLocaleString("pt-BR")}
              </span>
            </div>

            <h1
              className="text-center font-black uppercase leading-[0.92] tracking-[-0.02em] px-4 lg:px-[220px]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                fontSize: "clamp(2.75rem, 9vw, 8rem)",
              }}
            >
              <span className="block">Bang Bang</span>
              <span
                className="block bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(255,122,58,0.35)]"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #ffd36a 0%, #ff7a3a 55%, #E87A1E 100%)",
                }}
              >
                ao vivo.
              </span>
            </h1>
          </div>

          {/* Mobile/tablet inline stats */}
          <div className="lg:hidden mt-6 flex items-center justify-center gap-5 md:gap-8">
            <InlineStat label="Eventos" value={totalEvents} color="#ffd36a" />
            <span aria-hidden="true" className="h-8 w-px bg-white/15" />
            <InlineStat label="Cidades" value={cityCount} color="#d4ff4d" />
            <span aria-hidden="true" className="h-8 w-px bg-white/15" />
            <InlineStat label="Estados" value={stateCount} color="#ff7a3a" />
          </div>

          {/* Subtitle */}
          <p className="mt-7 md:mt-8 max-w-[56ch] mx-auto text-center text-white/75 text-base md:text-lg leading-relaxed">
            Festas, shows, festivais e ativações com{" "}
            <strong className="text-white">Bang Bang</strong> geladinha. Filtra
            por cidade, categoria, ou{" "}
            <span className="text-[#ffd36a]">dropa um pino no mapa</span> e já
            sabe onde a próxima rola.
          </p>

          {/* CTAs */}
          {totalEvents > 0 && (
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href="#eventos-mapa"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-black text-sm tracking-[0.12em] uppercase bg-[#ffd36a] text-[#14080a] shadow-[0_10px_40px_rgba(255,211,106,0.35)] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(255,211,106,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14080a]"
              >
                <MapPin size={14} strokeWidth={2.8} />
                Ver no mapa
              </a>
              <a
                href="#eventos-list-title"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-bold text-sm tracking-[0.12em] uppercase text-white border border-white/40 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14080a]"
              >
                Ver agenda
                <ArrowDown size={14} strokeWidth={2.6} />
              </a>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

function InlineStat({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-black tracking-[0.24em] uppercase text-white/50">
        {label}
      </span>
      <span
        className="font-black uppercase bg-clip-text text-transparent leading-none tabular-nums"
        style={{
          fontFamily: "var(--font-heading-var)",
          fontWeight: 700,
          fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
          backgroundImage: `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
        }}
      >
        {value.toLocaleString("pt-BR")}
      </span>
    </div>
  )
}
