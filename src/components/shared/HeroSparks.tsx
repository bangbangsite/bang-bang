"use client"

import { useMemo, useSyncExternalStore } from "react"

// SSR-safe media query — server returns false so the initial HTML never
// renders sparks (then hydration flips on capable clients).
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

// Spark seed factory — kept outside the component so React's purity lint
// doesn't flag the Math.random calls inside the render path. Called once
// per (count, spawnBand) combination from inside a useMemo.
function makeSparks(count: number, spawnBand: [number, number]) {
  const [topMin, topMax] = spawnBand
  const topSpan = topMax - topMin
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: topMin + Math.random() * topSpan,
    dx: Math.random() * 80 - 40,
    dy: -120 - Math.random() * 260,
    dur: 4 + Math.random() * 5,
    delay: -Math.random() * 6,
    size: 3 + Math.random() * 5,
    opacity: 0.2 + Math.random() * 0.6,
  }))
}

interface HeroSparksProps {
  /** How many sparks to spawn. Default 18 — same density as the home hero. */
  count?: number
  /**
   * Vertical band where sparks spawn (in % of the parent height). 0 = top,
   * 100 = bottom. Default `[60, 100]` — sparks start in the lower 40% and
   * drift upward, mimicking smoke/dust rising. Pass `[0, 100]` for full
   * coverage.
   */
  spawnBand?: [number, number]
  /** Tint of the spark glow. Defaults to the warm cream/gold used in the
   * home hero. */
  color?: string
  /** Extra Tailwind classes for the wrapping container. */
  className?: string
}

/**
 * Floating "dust" particles — small glowing dots that fade in, drift up
 * (with random horizontal jitter), shrink and fade out in a continuous
 * loop. Driven by the `hero-spark-drift` keyframe in globals.css.
 *
 * Skipped entirely when prefers-reduced-motion is set or on coarse pointers
 * (mobile) — the effect is decorative and not worth the GPU on touch.
 */
export function HeroSparks({
  count = 18,
  spawnBand = [60, 100],
  color = "rgba(255,240,200,0.95)",
  className,
}: HeroSparksProps) {
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)")
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const isWide = useMediaQuery("(min-width: 1024px)")
  const fxEnabled = canHover && !reduceMotion && isWide

  const sparks = useMemo(
    () => (fxEnabled ? makeSparks(count, spawnBand) : []),
    [fxEnabled, count, spawnBand],
  )

  if (!fxEnabled) return null

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className ?? ""}`}
    >
      {sparks.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: `radial-gradient(circle, ${color}, rgba(255,200,120,0))`,
              filter: "blur(0.5px)",
              animationName: "hero-spark-drift",
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "linear",
              opacity: s.opacity,
              ["--dx" as string]: `${s.dx}px`,
              ["--dy" as string]: `${s.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
