"use client"

import Link from "next/link"
import { MessageCircle, ArrowRight, CalendarDays } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import {
  InstagramIcon,
  TikTokIcon,
} from "@/components/shared/icons/SocialIcons"
import { useContacts } from "@/lib/contacts/useContacts"
import { trackClick } from "@/lib/contacts/clicks"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export function CTASection() {
  const { urls } = useContacts()
  const distribuidorHref = urls.distribuidor || "#contato"
  const distribuidorIsExternal =
    distribuidorHref.startsWith("http") ||
    distribuidorHref.startsWith("mailto:")

  return (
    <SectionWrapper
      id="contato"
      py="lg"
      bg="custom"
      customBg=""
      className="relative overflow-hidden text-white"
    >
      {/* Base desert gradient — deeper variant to close the page */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          // DS validated dark gradient close: Espresso → Brand Dark → Mule BG → Chocolate
          background:
            "radial-gradient(circle at 50% 0%, rgba(192,120,40,0.26), transparent 55%), linear-gradient(165deg, #270C08 0%, #2C1505 30%, #4A2008 60%, #8C4515 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 mix-blend-overlay opacity-[0.22]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.28em] uppercase px-3.5 py-2 rounded-full border border-white/35 bg-white/5 backdrop-blur-md"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 600 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#C8902C] shadow-[0_0_10px_#C8902C]" />
            Vamos conversar
          </span>

          <h2
            // DS H1 → Bebas Neue display
            className="uppercase leading-[0.95] mt-5 max-w-4xl"
            style={{
              fontFamily: "var(--font-display-var)",
              fontWeight: 400,
              fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
              letterSpacing: "0.03em",
            }}
          >
            Pronto pra{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                // DS Caramel → Cream → Caramel
                backgroundImage:
                  "linear-gradient(90deg, #C8902C, #F5ECD7 55%, #C8902C)",
              }}
            >
              distribuir Bang Bang?
            </span>
          </h2>
        </div>

        {/* Path principal — distribuidor */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/[0.05] backdrop-blur-md p-7 md:p-10 shadow-[0_30px_70px_-30px_rgba(192,120,40,0.3)]">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-50"
              style={{
                // DS Brand Amber radial glow
                background:
                  "radial-gradient(circle, rgba(192,120,40,0.5), transparent 70%)",
              }}
            />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div
                // DS lg radius (24) icon container, brand gradient
                className="w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-[0_12px_28px_-8px_rgba(39,12,8,0.65)]"
                style={{
                  background:
                    "linear-gradient(135deg, #270C08 0%, #8C4515 50%, #C8902C 100%)",
                }}
              >
                <MessageCircle size={28} strokeWidth={2.2} />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <h3
                  // DS H1 → Bebas Neue display
                  className="uppercase text-white text-2xl md:text-3xl leading-tight"
                  style={{
                    fontFamily: "var(--font-display-var)",
                    fontWeight: 400,
                    letterSpacing: "0.03em",
                  }}
                >
                  Quero distribuir Bang Bang
                </h3>
                <p
                  className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-xl"
                  // DS body Oswald, lh 1.7
                  style={{ fontFamily: "var(--font-heading-var)", fontWeight: 400, lineHeight: 1.7 }}
                >
                  Pedido mínimo, território exclusivo, margem dedicada e
                  suporte de marketing. Comercial responde no mesmo dia útil.
                </p>
              </div>

              <a
                href={distribuidorHref}
                {...(distribuidorIsExternal
                  ? { target: "_blank", rel: "noopener noreferrer" as const }
                  : {})}
                onClick={() => trackClick("distribuidor")}
                className="inline-flex items-center justify-center gap-2.5 px-6 h-12 rounded-xl text-sm tracking-[0.12em] uppercase text-white shadow-[0_12px_32px_-8px_rgba(192,120,40,0.65)] hover:-translate-y-0.5 hover:bg-[#A06230] hover:shadow-[0_16px_40px_-10px_rgba(160,98,48,0.85)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#270C08] shrink-0"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  background: "#C07828",
                }}
              >
                Falar com comercial
                <ArrowRight size={14} strokeWidth={2.6} />
              </a>
            </div>
          </div>
        </div>

        {/* Atalhos discretos — eventos + redes */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-3xl mx-auto">
          <Link
            href="/eventos"
            // DS Caramel #C8902C as warm accent on dark surfaces
            className="group inline-flex items-center justify-center gap-2.5 text-sm text-white/75 hover:text-[#C8902C] transition-colors px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C]"
            style={{ fontFamily: "var(--font-heading-var)" }}
          >
            <CalendarDays
              size={16}
              strokeWidth={2.2}
              className="text-[#C8902C]/85 group-hover:text-[#C8902C]"
            />
            <span className="font-semibold">
              Quero Bang Bang no meu evento
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>

          <div className="flex items-center justify-center gap-3">
            <span
              className="text-xs tracking-[0.18em] uppercase text-white/60"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 600 }}
            >
              Siga
            </span>
            <a
              href="https://www.instagram.com/bebabangbang"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @bebabangbang"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/5 text-white/75 hover:text-[#C8902C] hover:border-white/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C]"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Bang Bang"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/5 text-white/75 hover:text-[#C8902C] hover:border-white/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C]"
            >
              <TikTokIcon size={18} />
            </a>
            <span
              className="text-xs text-white/50 ml-1"
              style={{ fontFamily: "var(--font-heading-var)" }}
            >
              @bebabangbang
            </span>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  )
}
