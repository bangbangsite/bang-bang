import type { ReactNode } from "react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"

// Mock "logos" — flat-color symbolic placeholders until the real brand marks arrive.
// Each one uses a distinct color + shape + typographic treatment so the carousel
// rhythm mirrors what a row of real logos will look like.

type PartnerLogo = {
  name: string
  render: () => ReactNode
}

const LOGOS: PartnerLogo[] = [
  {
    name: "Farid Supermercados",
    render: () => (
      <div className="h-12 px-3.5 flex items-center gap-2.5 rounded-lg bg-[#1F5E3A] text-white">
        <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center font-black italic text-base leading-none">
          F
        </div>
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="font-black italic text-[14px] tracking-tight">Farid</span>
          <span className="text-[8px] tracking-[0.24em] uppercase opacity-70">Supermercados</span>
        </div>
      </div>
    ),
  },
  {
    name: "Mercado Espeto Bar",
    render: () => (
      <div className="h-12 pl-2 pr-4 flex items-center gap-2.5 rounded-full bg-[#B33B2E] text-white">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-[11px] leading-none">
          ME
        </div>
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-[11px] tracking-[0.2em] uppercase font-black">Mercado</span>
          <span className="text-[8px] tracking-[0.24em] uppercase opacity-80">Espeto Bar</span>
        </div>
      </div>
    ),
  },
  {
    name: "Bhzão",
    render: () => (
      <div className="h-12 pr-3 flex items-center gap-2">
        <div className="w-11 h-11 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-black italic text-[17px] leading-none">
          Bh
        </div>
        <span className="font-black italic text-[#1E3A8A] text-[17px] tracking-tight">
          Bhzão
        </span>
      </div>
    ),
  },
  {
    name: "DOS3 Distribuidora",
    render: () => (
      <div className="h-12 px-3.5 flex items-center gap-2 rounded-lg bg-[#F2A71F]">
        <div className="flex items-baseline font-black text-[#2a1410] leading-none">
          <span className="text-[22px] tracking-tight">DOS</span>
          <span className="text-[11px] ml-0.5 -translate-y-2 font-black">3</span>
        </div>
        <span className="text-[8px] tracking-[0.26em] uppercase text-[#2a1410]/80 font-black">
          Distrib.
        </span>
      </div>
    ),
  },
  {
    name: "Granezzo Distribuidora",
    render: () => (
      <div className="h-12 px-4 flex items-center rounded-full border-2 border-[#0F3D1A] bg-[#0F3D1A]/5 text-[#0F3D1A]">
        <div className="flex flex-col leading-none gap-0.5 items-start">
          <span className="font-black text-[14px] tracking-[0.08em] uppercase">
            Granezzo
          </span>
          <span className="text-[7px] tracking-[0.3em] uppercase opacity-70 font-black">
            Distribuidora
          </span>
        </div>
      </div>
    ),
  },
  {
    name: "Empório Sanders",
    render: () => (
      <div className="h-12 px-4 flex items-center gap-2 rounded-md bg-[#1a0f0a] text-[#F2A71F]">
        <span className="text-[20px] font-black italic leading-none tracking-tight">
          Sanders
        </span>
        <span className="text-[8px] tracking-[0.28em] uppercase opacity-65 font-bold">
          Empório
        </span>
      </div>
    ),
  },
  {
    name: "Pituba Mart",
    render: () => (
      <div className="h-12 pl-2 pr-4 flex items-center gap-2 rounded-full bg-[#0EA5A4] text-white">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black italic text-[15px] leading-none">
          P
        </div>
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-[12px] tracking-[0.18em] uppercase font-black">Pituba</span>
          <span className="text-[8px] tracking-[0.24em] uppercase opacity-80">Mart</span>
        </div>
      </div>
    ),
  },
  {
    name: "Casa Verde Conveniência",
    render: () => (
      <div className="h-12 px-4 flex items-center gap-2.5 rounded-xl bg-white border border-[#0F3D1A]/15 text-[#0F3D1A]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#0F3D1A]" />
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-[13px] font-black tracking-tight">Casa Verde</span>
          <span className="text-[8px] tracking-[0.26em] uppercase opacity-65 font-bold">
            Conveniência
          </span>
        </div>
      </div>
    ),
  },
  {
    name: "Mercadão Único",
    render: () => (
      <div
        className="h-12 px-4 flex items-center rounded-lg text-white"
        style={{
          background:
            "linear-gradient(135deg, #C4650F 0%, #E87A1E 60%, #F2A71F 100%)",
        }}
      >
        <span className="text-[16px] font-black italic leading-none tracking-tight">
          Mercadão
        </span>
        <span className="ml-1.5 text-[16px] font-black leading-none">Único</span>
      </div>
    ),
  },
  {
    name: "Rota 7 Distribuidora",
    render: () => (
      <div className="h-12 px-3 flex items-center gap-2.5 text-[#1A1A1A]">
        <div className="w-10 h-10 rotate-45 bg-[#FFD600] flex items-center justify-center">
          <span className="-rotate-45 font-black text-[15px] tracking-tight">7</span>
        </div>
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-[14px] font-black tracking-[0.06em] uppercase">Rota</span>
          <span className="text-[8px] tracking-[0.28em] uppercase opacity-65 font-bold">
            Distribuidora
          </span>
        </div>
      </div>
    ),
  },
  {
    name: "Beer Express",
    render: () => (
      <div className="h-12 px-4 flex items-center rounded-md bg-[#7C2D12] text-[#FBBF24]">
        <span
          className="text-[15px] font-black uppercase tracking-[0.18em] leading-none"
          style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}
        >
          Beer
        </span>
        <span className="ml-1 text-[15px] font-black uppercase tracking-[0.18em] leading-none text-white">
          Express
        </span>
      </div>
    ),
  },
]

// Double the list so the CSS marquee (translateX 0 → -50%) loops seamlessly.
const DOUBLED = [...LOGOS, ...LOGOS]

interface ParceirosBlockProps {
  /** Background color used by the edge fades (so the loop seam blends). Pass
   * the host section's bg color as hex. Defaults to #FAFAF8 (light surface). */
  fadeColor?: string
  className?: string
}

/**
 * Headline + marquee-of-logos block, wrapper-less. Used by ParceirosSection
 * (stand-alone) and by RevendaSection (rendered as a footer block under the
 * B2B feature cards so the home keeps the "argumento + prova social" pair on
 * a single fold).
 */
export function ParceirosBlock({
  fadeColor = "#FAFAF8",
  className,
}: ParceirosBlockProps) {
  return (
    <div className={className}>
      <Container>
        <div className="flex flex-col items-center text-center gap-3">
          <span className="inline-flex items-center gap-2.5 text-[10px] md:text-[11px] font-semibold tracking-[0.28em] uppercase px-3.5 py-2 rounded-full border border-[#2D1810]/20 bg-white/60 backdrop-blur-md text-[#4A2C1A]">
            <span className="w-2 h-2 rounded-full bg-[#E87A1E] shadow-[0_0_10px_#E87A1E]" />
            Parceiros
          </span>
          <h3
            className="font-black uppercase text-[#1A1A1A] tracking-tight leading-[0.95]"
            style={{
              fontFamily: "var(--font-heading-var)",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            }}
          >
            Quem vende, sabe.
          </h3>
          <p className="text-sm md:text-[15px] text-[#4A2C1A]/65">
            Distribuidoras, mercados e bares que já botaram Bang Bang na geladeira.
          </p>
        </div>
      </Container>

      {/* Carousel — edge-to-edge inside the host section, seamless CSS marquee. */}
      <div
        className="marquee-container relative mt-8 w-full overflow-hidden"
        aria-label="Parceiros Bang Bang"
      >
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)` }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)` }}
        />

        <div
          className="marquee-track flex flex-row flex-nowrap items-center gap-5 md:gap-8 py-2"
          style={{ animation: "marquee 40s linear infinite" }}
        >
          {DOUBLED.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0"
              role="img"
              aria-label={logo.name}
              {...(i >= LOGOS.length ? { "aria-hidden": true } : {})}
            >
              {logo.render()}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Stand-alone section wrapper around ParceirosBlock. Kept on the API for any
 *  page that wants Parceiros as its own fold (today only stories use this — the
 *  home merges Parceiros into RevendaSection as a footer block). */
export function ParceirosSection() {
  return (
    <SectionWrapper id="parceiros" bg="light" py="sm">
      <ParceirosBlock />
    </SectionWrapper>
  )
}
