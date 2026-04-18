import { cn } from "@/lib/utils"

interface EventCoverPlaceholderProps {
  /** Seed for deterministic per-event variation (stable across renders). */
  seed: string
  className?: string
}

/**
 * Deterministic gradient poster rendered when an event has no uploaded cover.
 * The look is tied to the Bang Bang palette with a mild variation per seed so
 * a page of 12 placeholders doesn't feel monotonous.
 */

const BG_VARIANTS = [
  {
    background:
      "radial-gradient(circle at 20% 15%, #ffd36a 0%, transparent 55%)," +
      "radial-gradient(circle at 80% 85%, #ff5a1f 0%, transparent 60%)," +
      "linear-gradient(135deg, #E87A1E 0%, #C4650F 60%, #8a3d1a 100%)",
    accent: "#ffd36a",
  },
  {
    background:
      "radial-gradient(circle at 90% 10%, #ffd36a 0%, transparent 50%)," +
      "radial-gradient(circle at 10% 90%, #c13584 0%, transparent 55%)," +
      "linear-gradient(145deg, #3d1f0a 0%, #6a3214 45%, #E87A1E 100%)",
    accent: "#ffd36a",
  },
  {
    background:
      "radial-gradient(circle at 30% 20%, #ff7a3a 0%, transparent 45%)," +
      "radial-gradient(circle at 75% 75%, #ffd36a 0%, transparent 55%)," +
      "linear-gradient(160deg, #1f0d08 0%, #3d1f0a 40%, #8a3d1a 100%)",
    accent: "#ffd36a",
  },
  {
    background:
      "radial-gradient(circle at 15% 80%, #f5a623 0%, transparent 55%)," +
      "radial-gradient(circle at 85% 20%, #ff5a1f 0%, transparent 55%)," +
      "linear-gradient(120deg, #2D1810 0%, #6a3214 50%, #C4650F 100%)",
    accent: "#ffd36a",
  },
  {
    background:
      "radial-gradient(circle at 50% 0%, #ffd36a 0%, transparent 50%)," +
      "radial-gradient(circle at 50% 100%, #8a3d1a 0%, transparent 55%)," +
      "linear-gradient(180deg, #E87A1E 0%, #C4650F 50%, #2D1810 100%)",
    accent: "#ffd36a",
  },
]

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

// Simple FNV-like hash — deterministic across SSR/CSR so the chosen variant
// doesn't flash between renders.
function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h
}

export function EventCoverPlaceholder({ seed, className }: EventCoverPlaceholderProps) {
  const h = hashSeed(seed)
  const variant = BG_VARIANTS[h % BG_VARIANTS.length]
  const shapeRotation = (h >> 3) % 360
  const shapeScale = 0.85 + ((h >> 7) % 30) / 100 // 0.85 → 1.14

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        className,
      )}
      style={{ background: variant.background }}
      aria-hidden="true"
    >
      {/* Abstract decorative shape — a pair of offset rings in the accent
          color, nothing semantic. The rotation/scale is seeded so each card
          gets a slightly different composition. */}
      <svg
        viewBox="0 0 200 200"
        width="140%"
        height="140%"
        className="absolute -right-10 -bottom-10 opacity-30 mix-blend-screen"
        style={{
          transform: `rotate(${shapeRotation}deg) scale(${shapeScale})`,
        }}
      >
        <circle cx="100" cy="100" r="62" fill="none" stroke={variant.accent} strokeWidth="2" />
        <circle cx="100" cy="100" r="44" fill="none" stroke={variant.accent} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="26" fill="none" stroke={variant.accent} strokeWidth="1" />
      </svg>

      {/* Film grain — ties it visually to the rest of the brand */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.18] pointer-events-none"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* Bottom gradient so any overlays (chip/title) on top read well */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  )
}
