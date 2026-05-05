"use client"

import Image, { type StaticImageData } from "next/image"
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import caipiImg from "@/../public/images/latas/caipi.png"
import muleImg from "@/../public/images/latas/mule.png"
import spritzImg from "@/../public/images/latas/spritz.png"
import bangImg from "@/../public/images/latas/bang.png"
import { useContacts } from "@/lib/contacts/useContacts"
import { trackClick } from "@/lib/contacts/clicks"

// Media query hook that's SSR-safe via useSyncExternalStore.
// Server snapshot is always false so the initial HTML renders without hero FX,
// then hydration flips to true on capable clients.
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

// Adapted from the standalone HTML hero Pedro designed.
// Heavy effects (parallax, custom cursor, sparks, proximity glow) run only on
// desktop pointers and respect prefers-reduced-motion. Mobile gets a static stack.

interface CanDef {
  key: "caipi" | "mule" | "spritz" | "bang"
  label: string
  img: StaticImageData
  dotColor: string
  // desktop stage placement + depth
  leftPct: number
  widthPct: number
  depth: number
  baseRot: number
  floatDur: string
  floatDelay: string
  floatAmp: number
}

const CANS: CanDef[] = [
  { key: "caipi",  label: "Caipi Vodka 3 Limões", img: caipiImg,  dotColor: "#2a8f3e",
    leftPct: 4,  widthPct: 22, depth: 0.75, baseRot: -6, floatDur: "5.2s", floatDelay: "0s",    floatAmp: 14 },
  { key: "mule",   label: "Moscow Mule",          img: muleImg,   dotColor: "#8b3a1a",
    leftPct: 24, widthPct: 24, depth: 1.00, baseRot: -2, floatDur: "6.1s", floatDelay: "-0.9s", floatAmp: 18 },
  { key: "spritz", label: "40+3 Spritz",          img: spritzImg, dotColor: "#e0a070",
    leftPct: 45, widthPct: 24, depth: 1.10, baseRot:  2, floatDur: "5.6s", floatDelay: "-1.6s", floatAmp: 20 },
  { key: "bang",   label: "Whisky + Energy",      img: bangImg,   dotColor: "#e8661a",
    leftPct: 66, widthPct: 22, depth: 0.80, baseRot:  6, floatDur: "5.9s", floatDelay: "-2.3s", floatAmp: 16 },
]

// Mobile layout — each can bleeds off a different edge (top-left, top-right,
// mid-left, mid-right). No can touches the bottom so the copy + CTAs have
// quiet space, and the full lineup shows in Sabores right below the hero.
// Values are % of the hero section. Negative numbers = bleed off-screen.
interface MobileCanDef {
  key: "caipi" | "mule" | "spritz" | "bang"
  label: string
  img: StaticImageData
  /** Fraction of viewport width. Big numbers are fine — the can is cropped by
   *  the edge it's bleeding off. */
  widthVw: number
  /** One anchor per can. Exactly one of `top`/`bottom` AND one of `left`/
   *  `right` is set to pin the can to a specific edge. */
  top?: string
  bottom?: string
  left?: string
  right?: string
  rotate: number
  floatDur: string
  floatDelay: string
}

const MOBILE_CANS: MobileCanDef[] = [
  // Mule — peek off the top-left
  { key: "mule",   label: "Moscow Mule",          img: muleImg,
    widthVw: 42, top: "-24%", left: "-10%", rotate: -22,
    floatDur: "6.4s", floatDelay: "0s" },
  // Spritz — peek off the top-right
  { key: "spritz", label: "40+3 Spritz",          img: spritzImg,
    widthVw: 40, top: "-26%", right: "-8%", rotate: 20,
    floatDur: "5.8s", floatDelay: "-1.4s" },
  // Caipi — narrow peek off the left edge, below title
  { key: "caipi",  label: "Caipi Vodka 3 Limões", img: caipiImg,
    widthVw: 54, top: "46%", left: "-42%", rotate: 16,
    floatDur: "5.4s", floatDelay: "-0.7s" },
  // Bang — narrow peek off the right edge, below title
  { key: "bang",   label: "Whisky + Energy",      img: bangImg,
    widthVw: 52, top: "48%", right: "-44%", rotate: -14,
    floatDur: "6.0s", floatDelay: "-2.1s" },
]

const SPARK_COUNT = 18

function makeSparks() {
  // Stable positions — computed once on client mount so SSR matches first paint.
  return Array.from({ length: SPARK_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: 60 + Math.random() * 40,
    dx: Math.random() * 80 - 40,
    dy: -120 - Math.random() * 260,
    dur: 4 + Math.random() * 5,
    delay: -Math.random() * 6,
    size: 3 + Math.random() * 5,
    opacity: 0.2 + Math.random() * 0.6,
  }))
}

export function HeroSection() {
  const bannerRef = useRef<HTMLElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const canRefs = useRef<(HTMLDivElement | null)[]>([])

  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)")
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const isWide = useMediaQuery("(min-width: 1024px)")
  const fxEnabled = canHover && !reduceMotion && isWide

  const { urls } = useContacts()
  const distribuidorHref = urls.distribuidor || "#contato"
  const distribuidorIsExternal =
    distribuidorHref.startsWith("http") || distribuidorHref.startsWith("mailto:")

  const sparks = useMemo(() => (fxEnabled ? makeSparks() : []), [fxEnabled])

  useEffect(() => {
    if (!fxEnabled) return
    const banner = bannerRef.current
    const cursor = cursorRef.current
    const ring = ringRef.current
    if (!banner || !cursor || !ring) return

    let targetX = 0.5
    let targetY = 0.5
    let curX = 0.5
    let curY = 0.5
    let rawMx = window.innerWidth / 2
    let rawMy = window.innerHeight / 2
    let rafId = 0

    const handleMove = (e: PointerEvent) => {
      const rect = banner.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (!inside) {
        banner.classList.remove("hero--cursor-active")
        return
      }
      banner.classList.add("hero--cursor-active")
      rawMx = e.clientX
      rawMy = e.clientY
      const rx = (e.clientX - rect.left) / rect.width
      const ry = (e.clientY - rect.top) / rect.height
      targetX = rx
      targetY = ry
      banner.style.setProperty("--mx", `${rx * 100}%`)
      banner.style.setProperty("--my", `${ry * 100}%`)
    }

    window.addEventListener("pointermove", handleMove)

    const loop = () => {
      curX += (targetX - curX) * 0.08
      curY += (targetY - curY) * 0.08
      const dx = curX - 0.5
      const dy = curY - 0.5

      canRefs.current.forEach((el, i) => {
        if (!el) return
        const def = CANS[i]
        const mouseStrength = 90
        const tiltStrength = 3
        const tx = -dx * mouseStrength * def.depth
        const ty = -dy * mouseStrength * def.depth * 0.6
        const rz = def.baseRot + dx * tiltStrength * def.depth
        const ry = dx * tiltStrength * 0.8 * def.depth
        const rx = -dy * tiltStrength * 0.5 * def.depth
        el.style.transform =
          `translateY(-50%) translate3d(${tx}px, ${ty}px, 0) ` +
          `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`
      })

      // Cursor follow (fast for dot, smooth for ring)
      cursor.style.transform = `translate(${rawMx}px, ${rawMy}px) translate(-50%, -50%)`
      ring.style.transform = `translate(${curX * window.innerWidth}px, ${curY * window.innerHeight}px) translate(-50%, -50%)`

      // Proximity highlight
      let closestIdx = -1
      let closestD = Infinity
      canRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.hypot(cx - rawMx, cy - rawMy)
        if (d < closestD) {
          closestD = d
          closestIdx = i
        }
      })
      canRefs.current.forEach((el, i) => {
        if (!el) return
        const img = el.querySelector<HTMLElement>("[data-can-img]")
        if (!img) return
        if (i === closestIdx && closestD < 260) {
          img.style.filter =
            "drop-shadow(0 40px 30px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(255,210,130,0.55))"
        } else {
          img.style.filter = ""
        }
      })
      if (closestD < 260) {
        ring.classList.add("hero-cursor--big")
        cursor.classList.add("hero-cursor--big")
      } else {
        ring.classList.remove("hero-cursor--big")
        cursor.classList.remove("hero-cursor--big")
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      cancelAnimationFrame(rafId)
      banner.classList.remove("hero--cursor-active")
    }
  }, [fxEnabled])

  return (
    <section
      ref={bannerRef}
      id="hero"
      className="hero relative w-full min-h-[85vh] md:min-h-[90vh] lg:min-h-screen overflow-hidden text-white"
      style={{
        fontFamily: "var(--font-heading-var), var(--font-body), sans-serif",
        // DS validated brand gradient + amber radial highlight
        background:
          "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(192,120,40,0.28), transparent 45%), linear-gradient(135deg, #270C08 0%, #8C4515 50%, #C8902C 100%)",
      }}
    >
      {/* film grain overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Sparks — only when fx enabled */}
      {fxEnabled &&
        sparks.map((s) => (
          <span
            key={s.id}
            aria-hidden="true"
            className="hero-spark absolute rounded-full pointer-events-none"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background:
                "radial-gradient(circle, rgba(255,240,200,0.95), rgba(255,200,120,0))",
              filter: "blur(0.5px)",
              animationName: "hero-spark-drift",
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "linear",
              opacity: s.opacity,
              // per-spark CSS vars consumed in keyframes
              ["--dx" as string]: `${s.dx}px`,
              ["--dy" as string]: `${s.dy}px`,
            } as React.CSSProperties}
          />
        ))}

      {/* Copy block */}
      <div className="relative z-[5] max-w-full lg:max-w-[46vw] px-6 sm:px-8 lg:px-12 pt-32 md:pt-36 lg:pt-0 lg:absolute lg:left-[6vw] lg:top-1/2 lg:-translate-y-1/2 pointer-events-none">
        <div
          className="inline-flex items-center gap-2.5 text-[11px] sm:text-xs tracking-[0.28em] uppercase px-3.5 py-2 rounded-full border border-white/35 bg-white/5 backdrop-blur-md"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 600 }}
        >
          <span className="w-2 h-2 rounded-full bg-[#C07828] shadow-[0_0_10px_#C07828]" />
          Beba gelado
        </div>

        <h1
          className="uppercase leading-[0.95] mt-6 mb-5 drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)] lg:drop-shadow-[0_6px_40px_rgba(0,0,0,0.35)]"
          style={{
            // DS display = Bebas Neue
            fontFamily: "var(--font-display-var), sans-serif",
            fontWeight: 400,
            fontSize: "clamp(44px, 7.2vw, 120px)",
            letterSpacing: "0.02em",
          }}
        >
          <span className="block">Todo dia é</span>
          <span className="block">dia de</span>
          <span
            className="block bg-clip-text text-transparent"
            style={{
              // DS amber → cream gradient
              backgroundImage:
                "linear-gradient(90deg, #C8902C, #F5ECD7 55%, #C8902C)",
            }}
          >
            Bang Bang.
          </span>
        </h1>

        <p
          className="text-white text-base sm:text-lg max-w-[42ch] leading-relaxed mb-7 [text-shadow:0_2px_10px_rgba(0,0,0,0.45)] lg:[text-shadow:none] lg:text-white/85"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 400, lineHeight: 1.7 }}
        >
          Quatro RTDs em lata de 473 ml. Categoria em alta no Brasil — e a Bang Bang não para de crescer.
        </p>

        <div className="flex flex-col gap-3 items-start pointer-events-auto">
          <div className="flex flex-col sm:flex-row gap-3.5 items-start sm:items-center">
            <a
              href={distribuidorHref}
              {...(distribuidorIsExternal
                ? { target: "_blank", rel: "noopener noreferrer" as const }
                : {})}
              onClick={() => trackClick("distribuidor")}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm tracking-[0.12em] uppercase text-white shadow-[0_12px_32px_-8px_rgba(192,120,40,0.65)] hover:-translate-y-0.5 hover:bg-[#A06230] hover:shadow-[0_16px_40px_-10px_rgba(160,98,48,0.85)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#270C08]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                background: "#C07828",
              }}
            >
              Sou distribuidor
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#sabores"
              className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-sm tracking-[0.08em] uppercase text-white border border-white/45 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#270C08]"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Ver sabores
            </a>
          </div>
        </div>

      </div>

      {/* Mobile cans — each one bleeds off a different edge (top-left,
          top-right, mid-left, mid-right). Decoration only: pointer-events
          pass through to the copy block above. Sabores is the place to see
          all four fully, right below the hero. */}
      <div
        aria-hidden="true"
        className="lg:hidden absolute inset-0 pointer-events-none z-[3] overflow-hidden"
      >
        {MOBILE_CANS.map((c) => (
          <div
            key={c.key}
            className="absolute"
            style={{
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
              width: `${c.widthVw}vw`,
              transform: `rotate(${c.rotate}deg)`,
              transformOrigin: "50% 50%",
            }}
          >
            <div
              style={
                reduceMotion
                  ? undefined
                  : ({
                      animationName: "hero-can-bob",
                      animationDuration: c.floatDur,
                      animationDelay: c.floatDelay,
                      animationIterationCount: "infinite",
                      animationTimingFunction: "ease-in-out",
                      ["--hero-base-rot" as string]: "0deg",
                      ["--hero-float-amp" as string]: "10px",
                    } as React.CSSProperties)
              }
            >
              <Image
                src={c.img}
                alt=""
                role="presentation"
                className="w-full h-auto block select-none"
                style={{
                  filter:
                    "drop-shadow(0 22px 28px rgba(0,0,0,0.5)) drop-shadow(0 0 32px rgba(255,180,110,0.15))",
                }}
                priority
                sizes={`${c.widthVw}vw`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop cans stage — hidden on mobile where peek-cans take over. */}
      <div
        className="hidden lg:block lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[62vw] z-[4]"
        style={{ perspective: "1400px", transformStyle: "preserve-3d" }}
      >
        {CANS.map((c, i) => (
          <div
            key={c.key}
            ref={(el) => {
              canRefs.current[i] = el
            }}
            className="absolute top-1/2 will-change-transform pointer-events-none"
            style={{
              left: `${c.leftPct}%`,
              width: `${c.widthPct}%`,
              transformOrigin: "50% 60%",
              transform: `translateY(-50%) rotateZ(${c.baseRot}deg)`,
            }}
          >
            <div
              className={fxEnabled ? "hero-can-inner" : ""}
              style={
                fxEnabled
                  ? ({
                      animationName: "hero-can-bob",
                      animationDuration: c.floatDur,
                      animationDelay: c.floatDelay,
                      animationIterationCount: "infinite",
                      animationTimingFunction: "ease-in-out",
                      ["--hero-base-rot" as string]: `${c.baseRot}deg`,
                      ["--hero-float-amp" as string]: `${c.floatAmp}px`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <Image
                src={c.img}
                alt={c.label}
                data-can-img="true"
                className="w-full h-auto block"
                style={{
                  filter:
                    "drop-shadow(0 30px 30px rgba(0,0,0,0.45)) drop-shadow(0 0 0 rgba(255,255,255,0))",
                  transition: "filter 0.25s ease",
                }}
                priority={i < 2}
                sizes="(max-width: 1024px) 50vw, 20vw"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute left-[10%] right-[10%] -bottom-[8%] h-[28px] rounded-full blur-[6px] -z-10"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)",
                animation: fxEnabled
                  ? `hero-shadow-pulse ${c.floatDur} ease-in-out ${c.floatDelay} infinite`
                  : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* Ticker — lg+ only; on mobile these pills crowded the peek cans and
          added noise below the main CTAs. The spec info lives in Sabores
          anyway, which is the very next section. */}
      <div
        className="hidden lg:flex absolute bottom-5 left-0 right-0 z-[6] px-5 md:px-8 flex-wrap justify-between items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-white/70"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 600 }}
      >
        <span className="inline-flex gap-2 items-center px-3.5 py-2 rounded-full border border-white/25 bg-white/[0.05] backdrop-blur-md">
          473 ml · 5,5% vol
        </span>
        <span className="hidden md:inline-flex gap-2 items-center px-3.5 py-2 rounded-full border border-white/25 bg-white/[0.05] backdrop-blur-md">
          Expansão nacional
        </span>
        <span className="inline-flex gap-2 items-center px-3.5 py-2 rounded-full border border-white/25 bg-white/[0.05] backdrop-blur-md">
          Bebida mista gaseificada
        </span>
      </div>

      {/* Custom cursor — rendered in-tree but fixed-positioned; only active over hero */}
      {fxEnabled && (
        <>
          <div
            ref={ringRef}
            aria-hidden="true"
            className="hero-cursor-ring fixed top-0 left-0 w-[54px] h-[54px] border border-white/40 rounded-full pointer-events-none z-[99] opacity-0 transition-opacity"
          />
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="hero-cursor fixed top-0 left-0 w-[14px] h-[14px] rounded-full bg-white/95 pointer-events-none z-[100] mix-blend-difference opacity-0 transition-opacity"
          />
        </>
      )}
    </section>
  )
}
