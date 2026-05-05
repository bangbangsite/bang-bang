"use client"

import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import { HeroSparks } from "@/components/shared/HeroSparks"
import evento01 from "@/../public/images/eventos/evento-01.webp"
import evento02 from "@/../public/images/eventos/evento-02.webp"
import evento03 from "@/../public/images/eventos/evento-03.webp"
import evento04 from "@/../public/images/eventos/evento-04.webp"
import evento05 from "@/../public/images/eventos/evento-05.webp"
import evento06 from "@/../public/images/eventos/evento-06.webp"
import evento07 from "@/../public/images/eventos/evento-07.webp"
import evento08 from "@/../public/images/eventos/evento-08.webp"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

type Slot =
  | {
      kind: "photo"
      id: string
      tilt: number
      src: StaticImageData
      alt: string
    }
  | {
      kind: "text"
      id: string
      title: string
      description: string
    }

// Desktop grid: 5 cols × 2 rows. Mobile grid: 2 cols, reordered so photos
// come in pairs with text blocks breaking the rhythm (2 photos · text · 2
// photos · text · 4 photos). Text blocks lean B2B (sales pitch for producers
// /venues); consumer agenda lives at /eventos via the link at the bottom.
const SLOTS: Slot[] = [
  // ── Row 1 ──
  { kind: "photo", id: "ev-01", tilt: -4, src: evento01, alt: "Bang Bang em ativação — foto 1" },
  {
    kind: "text",
    id: "txt-1",
    title: "Sua marca + a nossa.",
    description:
      "Cenografia reutilizável, geladeira branded, copo, faixa, fotógrafo. A gente desce com tudo montado.",
  },
  { kind: "photo", id: "ev-02", tilt: 0, src: evento02, alt: "Bang Bang em ativação — foto 2" },
  { kind: "photo", id: "ev-03", tilt: 0, src: evento03, alt: "Bang Bang em ativação — foto 3" },
  { kind: "photo", id: "ev-04", tilt: 3, src: evento04, alt: "Bang Bang em ativação — foto 4" },

  // ── Row 2 ──
  { kind: "photo", id: "ev-05", tilt: 0, src: evento05, alt: "Bang Bang em ativação — foto 5" },
  { kind: "photo", id: "ev-06", tilt: -3, src: evento06, alt: "Bang Bang em ativação — foto 6" },
  {
    kind: "text",
    id: "txt-2",
    title: "Logística resolvida.",
    description:
      "Você cuida do line-up, a gente cuida do resto. Equipe, kit, reposição. Você só assina o briefing.",
  },
  { kind: "photo", id: "ev-07", tilt: 4, src: evento07, alt: "Bang Bang em ativação — foto 7" },
  { kind: "photo", id: "ev-08", tilt: -3, src: evento08, alt: "Bang Bang em ativação — foto 8" },
]

// Mobile rhythm: 2 photos → text → 2 photos → text → 4 photos. The ids must
// match SLOTS above. If you add/remove a slot, update both lists.
const MOBILE_ORDER = [
  "ev-01", "ev-02",
  "txt-1",
  "ev-03", "ev-04",
  "txt-2",
  "ev-05", "ev-06",
  "ev-07", "ev-08",
] as const

const SLOTS_BY_ID = new Map(SLOTS.map((s) => [s.id, s]))
const MOBILE_SLOTS: Slot[] = MOBILE_ORDER.map((id) => {
  const slot = SLOTS_BY_ID.get(id)
  if (!slot) throw new Error(`Eventos MOBILE_ORDER references unknown slot: ${id}`)
  return slot
})

function PhotoTile({
  tilt,
  src,
  alt,
}: {
  tilt: number
  src: StaticImageData
  alt: string
}) {
  return (
    <div
      // DS radius lg = 24px (rounded-3xl)
      className="relative overflow-hidden rounded-3xl border border-white/10 aspect-[4/5] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:!rotate-0 hover:scale-[1.02]"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 20vw"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 mix-blend-overlay opacity-[0.12] pointer-events-none"
        style={{ backgroundImage: GRAIN_URL }}
      />
    </div>
  )
}

function TextBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col justify-center gap-3 py-4 md:py-0">
      <h3
        // DS H2 size → Bebas Neue display
        className="uppercase text-white text-2xl md:text-3xl leading-tight"
        style={{
          fontFamily: "var(--font-display-var)",
          fontWeight: 400,
          letterSpacing: "0.03em",
        }}
      >
        {title}
      </h3>
      <p
        className="text-white/75 text-sm md:text-[15px] leading-relaxed max-w-[28ch]"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 400, lineHeight: 1.7 }}
      >
        {description}
      </p>
    </div>
  )
}

export function EventosSection() {
  return (
    <SectionWrapper
      id="eventos"
      py="lg"
      bg="custom"
      customBg=""
      className="relative overflow-hidden text-white"
    >
      {/* Self-owned dark gradient — used to share with Lifestyle, but Lifestyle
          dissolved when the home pivoted B2B. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          // DS validated dark gradient: Espresso → Brand Dark → Mule BG → Chocolate
          // Highlights use DS Brand Amber (rgb 192,120,40)
          background:
            "radial-gradient(circle at 50% 0%, rgba(192,120,40,0.22), transparent 45%), " +
            "radial-gradient(circle at 20% 85%, rgba(200,144,44,0.16), transparent 55%), " +
            "linear-gradient(180deg, #270C08 0%, #2C1505 30%, #4A2008 60%, #8C4515 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none mix-blend-overlay opacity-[0.17]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* Floating sparks — same gold dust effect from the home hero. Spawns
          from the lower band so they drift upward across the photo mosaic,
          reinforcing the "ativação ao vivo" feel. */}
      <HeroSparks count={22} spawnBand={[55, 100]} />

      <Container className="relative z-10">
        {/* Title — pivots B2B: ativação de marca em eventos */}
        <div className="flex flex-col items-center text-center gap-4">
          <span
            className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.28em] uppercase px-3.5 py-2 rounded-full border border-white/35 bg-white/5 backdrop-blur-md"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 600 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#C8902C] shadow-[0_0_10px_#C8902C]" />
            Eventos · ativação de marca
          </span>
          <h2
            // DS H1 → Bebas Neue display
            className="uppercase leading-[0.95] max-w-3xl"
            style={{
              fontFamily: "var(--font-display-var)",
              fontWeight: 400,
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              letterSpacing: "0.03em",
            }}
          >
            <span className="text-white">Quer Bang Bang </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                // DS Caramel → Cream → Caramel
                backgroundImage:
                  "linear-gradient(90deg, #C8902C, #F5ECD7 55%, #C8902C)",
              }}
            >
              no seu palco?
            </span>
          </h2>
          <p
            className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 400, lineHeight: 1.7 }}
          >
            Festivais, rooftops, festas privadas, ativações de marca. Onde a
            Bang Bang chega, a noite muda.
          </p>
        </div>

        {/* Mobile grid — 2 cols, custom rhythm (2 photos · text · 2 photos · text · 4 photos) */}
        <div className="grid grid-cols-2 gap-3 mt-12 md:hidden">
          {MOBILE_SLOTS.map((slot) =>
            slot.kind === "photo" ? (
              <PhotoTile key={slot.id} tilt={slot.tilt} src={slot.src} alt={slot.alt} />
            ) : (
              <div key={slot.id} className="col-span-2">
                <TextBlock title={slot.title} description={slot.description} />
              </div>
            ),
          )}
        </div>

        {/* Desktop grid — 5×2 (original ordering) */}
        <div className="hidden md:grid md:grid-cols-5 md:gap-4 mt-12">
          {SLOTS.map((slot) =>
            slot.kind === "photo" ? (
              <PhotoTile key={slot.id} tilt={slot.tilt} src={slot.src} alt={slot.alt} />
            ) : (
              <div key={slot.id}>
                <TextBlock title={slot.title} description={slot.description} />
              </div>
            ),
          )}
        </div>

        {/* CTA único — discreto. Captação forte de evento privado vive em
            /eventos; aqui é só vitrine. */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/eventos"
            // DS Caramel #C8902C as the warm accent on dark surfaces
            className="group inline-flex items-center gap-2.5 text-sm text-white/75 hover:text-[#C8902C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] rounded px-1 -mx-1"
            style={{ fontFamily: "var(--font-heading-var)" }}
          >
            <CalendarDays
              size={14}
              strokeWidth={2.2}
              className="text-[#C8902C]/85 group-hover:text-[#C8902C]"
            />
            <span className="font-semibold underline underline-offset-4 decoration-[#C8902C]/40 group-hover:decoration-[#C8902C]">
              Agenda completa &amp; briefing de eventos
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </Container>
    </SectionWrapper>
  )
}
