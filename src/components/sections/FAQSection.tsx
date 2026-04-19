import Image from "next/image"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import { FAQAccordion } from "@/components/sections/FAQAccordion"
import { getFaqItems } from "@/lib/faq/server"
import caipiImg from "@/../public/images/latas/caipi.png"
import bangImg from "@/../public/images/latas/bang.png"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

function BoomStar({
  size = 24,
  className = "",
  color = "#E87A1E",
}: {
  size?: number
  className?: string
  color?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      className={className}
    >
      <path d="M12 0 L13.5 9 L24 12 L13.5 15 L12 24 L10.5 15 L0 12 L10.5 9 Z" />
    </svg>
  )
}

const STARS = [
  { top: "8%",  left: "6%",  size: 18, rot: 12,  opacity: 0.22, color: "#E87A1E" },
  { top: "78%", left: "44%", size: 12, rot: 45,  opacity: 0.22, color: "#C4650F" },
  { bottom: "16%", right: "6%", size: 22, rot: -15, opacity: 0.2, color: "#E87A1E" },
]

// Server Component — fetches FAQ items at render time so the public home
// never requires client-side JS for the initial accordion content.
export async function FAQSection() {
  const items = await getFaqItems()

  return (
    <SectionWrapper
      id="faq"
      bg="light"
      py="lg"
      className="relative overflow-hidden"
    >
      {/* ============ Decorative backdrop ============ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[900px] h-[70%] rounded-full blur-3xl opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(232,122,30,0.3) 0%, rgba(232,122,30,0.08) 45%, transparent 70%)",
          }}
        />

        <div
          className="absolute top-6 left-2 md:top-10 md:left-4 lg:left-8 w-[180px] md:w-[260px] lg:w-[300px] opacity-[0.07] rotate-[-14deg]"
          style={{ filter: "grayscale(100%) blur(0.5px)" }}
        >
          <Image
            src={caipiImg}
            alt=""
            className="w-full h-auto"
            sizes="(max-width: 768px) 260px, 440px"
          />
        </div>
        <div
          className="absolute -bottom-20 -right-16 md:-bottom-32 md:-right-24 w-[260px] md:w-[380px] lg:w-[440px] opacity-[0.07] rotate-[16deg]"
          style={{ filter: "grayscale(100%) blur(0.5px)" }}
        >
          <Image
            src={bangImg}
            alt=""
            className="w-full h-auto"
            sizes="(max-width: 768px) 260px, 440px"
          />
        </div>

        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              opacity: s.opacity,
              transform: `rotate(${s.rot}deg)`,
            }}
          >
            <BoomStar size={s.size} color={s.color} />
          </div>
        ))}
        <div
          className="absolute inset-0 mix-blend-multiply opacity-[0.1]"
          style={{ backgroundImage: GRAIN_URL }}
        />
      </div>

      <Container className="relative z-10">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white border border-[#4A2C1A]/10 shadow-[0_30px_80px_-30px_rgba(45,24,16,0.22)] px-6 md:px-10 lg:px-14 py-12 md:py-16">
          {/* Heading */}
          <div className="flex flex-col items-center text-center gap-4">
            <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.28em] uppercase px-3.5 py-2 rounded-full border border-[#2D1810]/20 bg-[#FAFAF8] text-[#4A2C1A]">
              <span className="w-2 h-2 rounded-full bg-[#E87A1E] shadow-[0_0_10px_#E87A1E]" />
              Dúvidas frequentes
            </span>

            <h2
              className="font-black uppercase leading-[0.95] tracking-tight text-[#1A1A1A] max-w-3xl"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              }}
            >
              Antes de você{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #E87A1E, #ff7a3a 55%, #E87A1E)",
                }}
              >
                perguntar.
              </span>
            </h2>

            <p className="text-[#4A2C1A]/70 text-base md:text-lg max-w-xl">
              Respostas diretas. Se faltar algo, fala com a gente — responde no mesmo dia útil.
            </p>
          </div>

          {/* Two-column stage: photo on the left, accordion on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-4 md:gap-6 mt-10 items-stretch">
            <div className="relative rounded-2xl overflow-hidden border border-[#4A2C1A]/10 shadow-[0_18px_40px_-18px_rgba(45,24,16,0.28)] min-h-[320px] lg:min-h-0 aspect-[4/5] lg:aspect-auto">
              <Image
                src="/images/faq/fridge-hand.webp"
                alt="Cliente pegando uma Bang Bang geladinha na geladeira de um bar"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            {/* Client accordion — interactivity requires "use client" */}
            <FAQAccordion items={items} />
          </div>

          <p className="text-center text-[#4A2C1A]/60 text-sm mt-8">
            Não achou sua pergunta?{" "}
            <a
              href="#contato"
              className="font-semibold text-[#E87A1E] hover:text-[#C4650F] underline underline-offset-4"
            >
              Fala com a gente →
            </a>
          </p>
        </div>
      </Container>
    </SectionWrapper>
  )
}
