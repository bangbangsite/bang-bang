"use client"

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useCallback,
} from "react"
import Image, { type StaticImageData } from "next/image"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { cn } from "@/lib/utils"
import caipiImg from "@/../public/images/latas/caipi.png"
import muleImg from "@/../public/images/latas/mule.png"
import spritzImg from "@/../public/images/latas/spritz.png"
import bangImg from "@/../public/images/latas/bang.png"

// SSR-safe media query hook — same pattern used in the heros.
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

type FlavorKey = "caipi" | "mule" | "spritz" | "bang"

interface Product {
  name: string
  nickname: string
  /** Short summary, used on the collapsed cards. */
  description: string
  /** Punchy one-line tagline above the long description. */
  tagline: string
  /** Long description shown on the right side of the active card. */
  longDescription: string
  /** Flavor notes / "perfect for" — 3-4 short bullets. */
  notes: string[]
  /** Volume + alcohol info. */
  vol: string
  flavor: FlavorKey
  img: StaticImageData
  dotColor: string
  /** Background gradient for the card — mirrors the hero's "desert" palette style per flavor. */
  gradient: string
}

const PRODUCTS: Product[] = [
  {
    name: "Caipi Vodka 3 Limões",
    nickname: "O Verde",
    description:
      "Cítrico, refrescante, vibrante. Tropical em cada lata, sem preparo.",
    tagline: "O brasileiro que virou portátil.",
    longDescription:
      "Vodka, três limões e zero esforço. A caipirinha que cabia no bar agora cabe na sua mochila — mesma vibe tropical, sem coqueteleira, sem dor de cabeça.",
    notes: ["Cítrico marcante", "Lima·tahiti·siciliano", "Refrescante", "Pra dia de praia"],
    vol: "473 ml · 5,5% vol",
    flavor: "caipi",
    img: caipiImg,
    dotColor: "#2a8f3e",
    gradient:
      "radial-gradient(circle at 50% 20%, rgba(140,220,140,0.22), transparent 55%), linear-gradient(160deg, #0f3d1a 0%, #1e5a2a 45%, #2a7a3a 100%)",
  },
  {
    name: "Moscow Mule",
    nickname: "O Mule",
    description:
      "Gengibre marcante, vodka e lima. Sofisticação pronta pra gelar.",
    tagline: "Sofisticação sem firula.",
    longDescription:
      "Gengibre puxado, vodka premium, toque cítrico de lima. O drink que pedia bartender agora é só abrir e servir — mantendo o caráter que você espera de um Mule de verdade.",
    notes: ["Gengibre acentuado", "Vodka premium", "Lima fresca", "Pra noite que começa cedo"],
    vol: "473 ml · 5,5% vol",
    flavor: "mule",
    img: muleImg,
    dotColor: "#d67a3e",
    gradient:
      "radial-gradient(circle at 50% 20%, rgba(255,180,120,0.22), transparent 55%), linear-gradient(160deg, #2d1810 0%, #5a3220 45%, #8b5e3c 100%)",
  },
  {
    name: "40+3 Spritz",
    nickname: "O Spritz",
    description:
      "Baunilha e toque cítrico. Aperitivo pra quem tem estilo.",
    tagline: "Aperitivo de quem entende.",
    longDescription:
      "Aromático, levemente amargo, com baunilha e toque cítrico. O Spritz que abria a noite no rooftop italiano agora vai com você do happy hour ao after — sem perder a postura.",
    notes: ["Baunilha sutil", "Toque cítrico", "Aperitivo amargo", "Pra rooftop e brunch"],
    vol: "473 ml · 5,5% vol",
    flavor: "spritz",
    img: spritzImg,
    dotColor: "#e0a070",
    gradient:
      "radial-gradient(circle at 50% 20%, rgba(255,210,150,0.22), transparent 55%), linear-gradient(160deg, #3d2a0f 0%, #8f6a3a 45%, #c49a6c 100%)",
  },
  {
    name: "Whisky + Energy",
    nickname: "O Bang",
    description:
      "Whisky e energético em uma lata. Impacto puro, sem meio-termo.",
    tagline: "A combinação clássica, embalada.",
    longDescription:
      "Whisky puxado e energético na medida certa. O combo que sempre rolou na pista agora vem pronto, balanceado, sem aquele momento de improvisar mistura no balcão.",
    notes: ["Whisky encorpado", "Energético equilibrado", "Impacto direto", "Pra balada longa"],
    vol: "473 ml · 5,5% vol",
    flavor: "bang",
    img: bangImg,
    dotColor: "#e8661a",
    gradient:
      "radial-gradient(circle at 50% 20%, rgba(255,210,130,0.22), transparent 55%), linear-gradient(160deg, #2a1410 0%, #6a2a14 45%, #e8661a 100%)",
  },
]

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export function SaboresSection() {
  const isLg = useMediaQuery("(min-width: 1024px)")
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // Pin only on desktop + when motion is allowed. Mobile and reduce-motion
  // get the static deck (still interactive via click).
  const usePin = isLg && !reduceMotion

  return usePin ? <SaboresPinned /> : <SaboresStatic />
}

// Static fallback — the interactive deck without the scroll-pin. Used on
// mobile and when prefers-reduced-motion is set.
function SaboresStatic() {
  return (
    <SectionWrapper bg="light" py="lg" id="sabores">
      <Container>
        <SectionTitle
          eyebrow="Catálogo"
          title="Cada lata,"
          highlight="uma atitude."
          subtitle="Quatro drinks clássicos prontos pra gelar. Clica num sabor pra ver o que tem dentro."
          align="center"
        />
        <SaboresInteractive />
      </Container>
    </SectionWrapper>
  )
}

// ---------------------------------------------------------------------------
// Pinned variant (desktop) — wraps the interactive deck in a 4× viewport
// height container with a sticky inner panel. Scroll progress through the
// wrapper drives the active flavor (1 viewport per flavor). Progress dots
// on the right give the user a mental model of where they are in the
// 4-flavor sequence.
// ---------------------------------------------------------------------------

function SaboresPinned() {
  const [activeIdx, setActiveIdx] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Scroll listener — clamps progress to [0, 1] over the wrapper's pin range
  // and maps it to one of N flavor slots.
  useEffect(() => {
    let rafId: number | null = null

    const update = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      const vh = window.innerHeight
      const scrollBudget = wrapper.offsetHeight - vh

      // outside the pin range — let the index sit at the edge values
      if (rect.top >= 0) {
        setActiveIdx((prev) => (prev !== 0 ? 0 : prev))
        return
      }
      if (rect.bottom <= vh) {
        setActiveIdx((prev) =>
          prev !== PRODUCTS.length - 1 ? PRODUCTS.length - 1 : prev,
        )
        return
      }

      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / scrollBudget))
      // Each flavor occupies an equal slice of the timeline. The clamp keeps
      // the very last frame from rolling into an out-of-bounds index.
      const idx = Math.min(
        PRODUCTS.length - 1,
        Math.floor(progress * PRODUCTS.length),
      )
      setActiveIdx((prev) => (prev !== idx ? idx : prev))
    }

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        update()
        rafId = null
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  // Programmatic scroll — clicking a progress dot jumps the page to the
  // middle of that flavor's slice so the index lands cleanly on it.
  const jumpTo = useCallback((idx: number) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const wrapperTop = window.scrollY + rect.top
    const scrollBudget = wrapper.offsetHeight - window.innerHeight
    // Center of slice: (idx + 0.5) / N
    const targetProgress = (idx + 0.5) / PRODUCTS.length
    window.scrollTo({
      top: wrapperTop + targetProgress * scrollBudget,
      behavior: "smooth",
    })
  }, [])

  const setActiveByKey = useCallback((key: FlavorKey) => {
    const idx = PRODUCTS.findIndex((p) => p.flavor === key)
    if (idx >= 0) jumpTo(idx)
  }, [jumpTo])

  return (
    <section
      id="sabores"
      ref={wrapperRef}
      className="relative bg-[#FAFAF8]"
      style={{ height: `${PRODUCTS.length * 100}vh` }}
    >
      {/* Sticky panel — fills the viewport while the wrapper scrolls past. */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <Container className="w-full">
          <SectionTitle
            eyebrow="Catálogo"
            title="Cada lata,"
            highlight="uma atitude."
            subtitle="Rola devagar — cada sabor abre na sua vez."
            align="center"
          />
          <SaboresInteractiveWithIndex
            activeIdx={activeIdx}
            onSelect={setActiveByKey}
          />
        </Container>

        {/* Progress dots — fixed inside the sticky panel so they stay anchored
            to the right edge during the entire pin. */}
        <ProgressDots
          active={activeIdx}
          total={PRODUCTS.length}
          onJump={jumpTo}
        />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Interactive split — active flavor on the left, the other three stacked on
// the right. Click a stacked card to promote it; the previous active drops
// to the stack. Used by both the pinned and static variants.
// ---------------------------------------------------------------------------

function SaboresInteractive() {
  const [activeKey, setActiveKey] = useState<FlavorKey>(PRODUCTS[0].flavor)
  const activeIdx = PRODUCTS.findIndex((p) => p.flavor === activeKey)
  return (
    <SaboresInteractiveWithIndex
      activeIdx={activeIdx >= 0 ? activeIdx : 0}
      onSelect={setActiveKey}
    />
  )
}

function SaboresInteractiveWithIndex({
  activeIdx,
  onSelect,
}: {
  activeIdx: number
  onSelect: (key: FlavorKey) => void
}) {
  const active = PRODUCTS[activeIdx] ?? PRODUCTS[0]
  // Preserve original order for the stack so users keep visual anchoring.
  const others = PRODUCTS.filter((p) => p.flavor !== active.flavor)

  return (
    <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-[3fr_1.1fr] gap-4 md:gap-6 items-stretch">
      {/* Active card — re-keyed by flavor so the can swap fades in cleanly */}
      <ActiveSaborCard key={active.flavor} product={active} />

      {/* Single stack — cards in the same position with a small horizontal
          offset so the back cards "peek" as colored stripes on the right. */}
      <SaborStack flavors={others} onSelect={onSelect} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProgressDots — vertical list of pills on the right edge of the pin panel.
// Active dot grows into a vertical bar; inactives stay as small dots.
// Click jumps the scroll position to that flavor.
// ---------------------------------------------------------------------------

function ProgressDots({
  active,
  total,
  onJump,
}: {
  active: number
  total: number
  onJump: (idx: number) => void
}) {
  return (
    <div
      className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30"
      role="tablist"
      aria-label="Navegação dos sabores"
    >
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === active
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${i + 1} de ${total} — ${PRODUCTS[i].nickname}`}
            onClick={() => onJump(i)}
            className={cn(
              "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2",
              isActive
                ? "w-2 h-10 bg-[#E87A1E] shadow-[0_0_12px_rgba(232,122,30,0.6)]"
                : "w-2 h-2 bg-[#4A2C1A]/25 hover:bg-[#4A2C1A]/55",
            )}
          />
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SaborStack — the 3 non-active flavors as a deck of cards stacked at the
// same position, each peeking PEEK_PX further right than the one in front.
// All cards have the same fixed width; the offset comes from `left:`. The
// peek stripe (right edge of each back card) is clickable.
// On screens < lg we drop the deck entirely and render a row of 3 chips
// stretching across the bottom — the deck illusion needs hover and breathing
// room that small screens don't have.
// ---------------------------------------------------------------------------

const PEEK_PX = 36

function SaborStack({
  flavors,
  onSelect,
}: {
  flavors: Product[]
  onSelect: (key: FlavorKey) => void
}) {
  const totalPeek = PEEK_PX * (flavors.length - 1)

  return (
    <>
      {/* Desktop deck — height matches the active card so the peek stripes
          line up with it. Capped to the pin viewport. */}
      <div
        className="relative hidden lg:block w-full min-h-[520px] max-h-[calc(100vh-180px)]"
      >
        {flavors.map((p, i) => (
          <StackedSaborCard
            key={p.flavor}
            product={p}
            isFront={i === 0}
            leftPx={i * PEEK_PX}
            // Width = container width minus the total peek pulled in from
            // the right. Every card has the same width — only `left` changes.
            widthCalc={`calc(100% - ${totalPeek}px)`}
            zIndex={flavors.length - i}
            onSelect={() => onSelect(p.flavor)}
          />
        ))}
      </div>

      {/* Mobile / tablet — vertical peek deck: same "stacked paper" illusion
          as the desktop, rotated 90°. Each back card peeks as a horizontal
          strip below the active card, and each deeper strip is inset on
          both sides so the stack visibly narrows as it goes back. */}
      <MobileVerticalDeck flavors={flavors} onSelect={onSelect} />
    </>
  )
}

// Mobile vertical deck — 3 peek strips that sit below the active card.
// STRIP_H is how tall each strip is; OVERLAP pulls the next strip up so
// only a band of the one above shows. INSET narrows each deeper strip
// on both sides to reinforce the "stack of cards" feel. Strips are tall
// enough to fit a peeking can on the right — the can overflows top/bottom
// and the parent's overflow-hidden clips it into a tall sliver.
const STRIP_H = 96
const OVERLAP = 16
const INSET = 10
const STRIP_CAN_W = 84

function MobileVerticalDeck({
  flavors,
  onSelect,
}: {
  flavors: Product[]
  onSelect: (key: FlavorKey) => void
}) {
  const visiblePerStrip = STRIP_H - OVERLAP
  const containerHeight = STRIP_H + (flavors.length - 1) * visiblePerStrip

  return (
    <div
      className="relative w-full mt-3 lg:hidden"
      style={{ height: containerHeight }}
    >
      {flavors.map((p, i) => {
        const sideInset = i * INSET
        return (
          <StrippedSaborCard
            key={p.flavor}
            product={p}
            top={i * visiblePerStrip}
            leftInset={sideInset}
            rightInset={sideInset}
            zIndex={flavors.length - i}
            onSelect={() => onSelect(p.flavor)}
          />
        )
      })}
    </div>
  )
}

function StrippedSaborCard({
  product,
  top,
  leftInset,
  rightInset,
  zIndex,
  onSelect,
}: {
  product: Product
  top: number
  leftInset: number
  rightInset: number
  zIndex: number
  onSelect: () => void
}) {
  const { name, nickname, img, dotColor, gradient } = product
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Ver detalhes de ${name}`}
      className="absolute rounded-xl overflow-hidden text-white text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2"
      style={{
        top,
        left: leftInset,
        right: rightInset,
        height: STRIP_H,
        zIndex,
        background: gradient,
        boxShadow: "0 14px 28px -16px rgba(0,0,0,0.6)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.16]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* Peek can — anchored right, overflows top/bottom so the container's
          overflow-hidden clips it into a half-visible sliver. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ right: -STRIP_CAN_W * 0.28, width: STRIP_CAN_W }}
      >
        <Image
          src={img}
          alt=""
          width={STRIP_CAN_W}
          height={Math.round(STRIP_CAN_W * 2)}
          sizes={`${STRIP_CAN_W}px`}
          className="w-full h-auto drop-shadow-[0_14px_18px_rgba(0,0,0,0.55)]"
        />
      </div>

      {/* Text block — constrained so it never slides under the can */}
      <div
        className="relative z-[1] h-full flex flex-col justify-center gap-1.5 pl-4"
        style={{ paddingRight: STRIP_CAN_W + 6 }}
      >
        <span
          className="font-black uppercase tracking-tight text-[15px] leading-[1.05] line-clamp-2"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {name}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.22em] uppercase text-white/80">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
          />
          {nickname}
        </span>
      </div>
    </button>
  )
}

function StackedSaborCard({
  product,
  isFront,
  leftPx,
  widthCalc,
  zIndex,
  onSelect,
}: {
  product: Product
  isFront: boolean
  leftPx: number
  widthCalc: string
  zIndex: number
  onSelect: () => void
}) {
  const { name, nickname, img, dotColor, gradient } = product
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Ver detalhes de ${name}`}
      className={cn(
        "group absolute top-0 bottom-0 rounded-2xl overflow-hidden text-white text-left transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]",
        !isFront && "hover:translate-x-[8px] cursor-pointer",
      )}
      style={{
        left: `${leftPx}px`,
        width: widthCalc,
        zIndex,
        background: gradient,
        boxShadow: isFront
          ? "0 24px 50px -20px rgba(0,0,0,0.4)"
          : "0 18px 36px -16px rgba(0,0,0,0.35)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* Nickname pill — anchored to the RIGHT so it stays on the visible
          peek stripe even when the card is behind the front card. */}
      <span className="absolute top-4 right-3 z-[2] inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold tracking-[0.22em] uppercase px-2.5 py-1.5 rounded-full border border-white/35 bg-white/5 backdrop-blur-md whitespace-nowrap">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
        />
        {nickname}
      </span>

      {/* Mini can — only the front card shows a centered can. Uses the full
          height of the card with object-contain so it scales to whatever
          space the parent allows (no overflow on short viewports). */}
      {isFront && (
        <div className="absolute inset-0 flex items-center justify-center px-4 pt-14 pb-12 pointer-events-none">
          <div className="relative w-full h-full max-w-[200px]">
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 1024px) 30vw, 18vw"
              className="object-contain object-center drop-shadow-[0_24px_24px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      )}

      {/* Name footer — anchored right so it sits on the peek stripe of back
          cards (rotated vertical for legibility on the narrow stripe). */}
      {isFront ? (
        <div
          className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-6"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0) 100%)",
          }}
        >
          <p
            className="font-black uppercase text-white text-[12px] md:text-[14px] leading-tight tracking-tight line-clamp-2"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {name}
          </p>
        </div>
      ) : (
        // Back card vertical label — sits on the visible peek stripe
        <span
          className="absolute right-2 bottom-4 z-[2] text-[10px] font-black tracking-[0.28em] uppercase text-white/80 whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {nickname}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// ActiveSaborCard — large, gradient-filled. Can on the left, copy on the
// right (stacks vertically on smaller widths).
// ---------------------------------------------------------------------------

function ActiveSaborCard({ product }: { product: Product }) {
  const { name, nickname, tagline, longDescription, notes, vol, img, dotColor, gradient } =
    product

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl text-white",
        // Capped at the available pin viewport so the can never gets clipped
        // on shorter screens. The min keeps it readable on the static fallback.
        "min-h-[480px] md:min-h-[520px] lg:max-h-[calc(100vh-180px)]",
        "animate-[fadeInScale_400ms_ease-out]",
      )}
      style={{ background: gradient }}
    >
      {/* Film grain — same treatment as the hero */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <div className="relative z-[1] h-full grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-2 md:gap-4">
        {/* Can stage — on mobile the grid row has no intrinsic height, so
            flex-1 alone collapses to 0. We give the stage an explicit mobile
            min-height to guarantee a dramatic can; desktop keeps flex-1
            fluid inside the pin viewport. */}
        <div className="relative flex flex-col items-center justify-end px-4 pt-12 md:pt-14 pb-4 md:pb-6 min-h-[360px] md:min-h-0">
          {/* Nickname badge — overlay on top-left of the can stage */}
          <span className="absolute top-5 md:top-6 left-5 md:left-6 inline-flex items-center gap-2 text-[10px] md:text-[11px] font-semibold tracking-[0.24em] uppercase px-3 py-1.5 rounded-full border border-white/35 bg-white/5 backdrop-blur-md z-[2]">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
            />
            {nickname}
          </span>

          <div className="relative flex-1 w-full min-h-[260px] md:min-h-0 max-w-[240px] md:max-w-[280px]">
            <Image
              src={img}
              alt={name}
              fill
              sizes="(max-width: 640px) 75vw, (max-width: 1024px) 60vw, 30vw"
              className="object-contain object-bottom drop-shadow-[0_36px_36px_rgba(0,0,0,0.55)]"
              priority
            />
          </div>
        </div>

        {/* Right copy block — full text, notes, vol, CTA */}
        <div
          className="relative flex flex-col justify-center gap-4 px-6 md:px-8 lg:px-10 pb-8 md:pb-10 pt-4 md:pt-12"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45) 10%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h3
            className="font-black uppercase tracking-tight leading-[0.95] text-white text-2xl md:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {name}
          </h3>

          <p
            className="text-[15px] md:text-[17px] font-bold italic leading-snug"
            style={{ color: dotColor }}
          >
            {tagline}
          </p>

          <p className="text-white/80 text-[14px] md:text-[15px] leading-relaxed max-w-[42ch]">
            {longDescription}
          </p>

          {/* Notes — small chip pills */}
          <ul className="flex flex-wrap gap-1.5 md:gap-2 mt-1">
            {notes.map((note) => (
              <li
                key={note}
                className="inline-flex items-center text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-md border border-white/20 bg-white/5 backdrop-blur-sm text-white/85"
              >
                {note}
              </li>
            ))}
          </ul>

          {/* Vol info + CTA */}
          <div className="flex items-center justify-between gap-3 mt-2 pt-4 border-t border-white/15">
            <span className="text-[11px] md:text-[12px] font-semibold tracking-wider uppercase text-white/60 tabular-nums">
              {vol}
            </span>
            <a
              href="/onde-encontrar"
              className="inline-flex items-center gap-1.5 text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-white hover:text-[#ffd36a] transition-colors group"
            >
              Onde comprar
              <ArrowRight
                size={13}
                strokeWidth={2.6}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

