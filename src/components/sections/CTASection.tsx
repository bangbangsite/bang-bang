"use client"

import { MessageCircle, Briefcase, PartyPopper } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import { useContacts } from "@/lib/contacts/useContacts"
import { trackClick, type CTACategory } from "@/lib/contacts/clicks"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

interface PathCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  category: CTACategory
}

function PathCard({ icon, title, description, href, category }: PathCardProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:")

  return (
    <a
      href={href}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" as const }
        : {})}
      onClick={() => trackClick(category)}
      className="group relative flex flex-col items-start gap-3 p-6 md:p-7 rounded-2xl overflow-hidden text-white border border-white/15 bg-white/[0.05] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd36a]/55 hover:bg-white/[0.09] hover:shadow-[0_24px_50px_-20px_rgba(255,211,106,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f0d08] h-full"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-[0_8px_18px_-6px_rgba(232,122,30,0.55)] transition-transform duration-300 group-hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, #E87A1E 0%, #C4650F 60%, #E85D10 100%)",
        }}
      >
        {icon}
      </div>

      <h3
        className="font-black uppercase text-white text-lg md:text-xl leading-tight tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        {title}
      </h3>

      <p className="text-white/70 text-sm md:text-[15px] leading-relaxed">
        {description}
      </p>

      <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffd36a] group-hover:gap-2.5 transition-all">
        Falar agora
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  )
}

export function CTASection() {
  const { urls } = useContacts()
  const revendaHref = urls.revenda || "#contato"
  const distribuidorHref = urls.distribuidor || "#contato"
  const eventosHref = urls.eventos || "#contato"

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
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,210,130,0.24), transparent 55%), linear-gradient(165deg, #1a0a06 0%, #3d1f0a 45%, #8a3d1a 100%)",
        }}
      />
      {/* Film grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 mix-blend-overlay opacity-[0.22]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.28em] uppercase px-3.5 py-2 rounded-full border border-white/35 bg-white/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#ffd36a] shadow-[0_0_10px_#ffd36a]" />
            Vamos conversar
          </span>

          <h2
            className="font-black uppercase leading-[0.95] tracking-tight mt-5 max-w-4xl"
            style={{
              fontFamily: "var(--font-heading-var)",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
            }}
          >
            Quer a Bang Bang{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #ffd36a, #ff7a3a 55%, #ffd36a)",
              }}
            >
              no seu negócio ou evento?
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-12 items-stretch">
          <PathCard
            icon={<MessageCircle size={22} strokeWidth={2.25} />}
            title="Quero revender"
            description="Pedido mínimo enxuto. Material de PDV no primeiro ciclo. Reposição quase semanal."
            href={revendaHref}
            category="revenda"
          />
          <PathCard
            icon={<Briefcase size={22} strokeWidth={2.25} />}
            title="Sou distribuidor"
            description="Tabela regional, logística e território exclusivo. Conversa direta com o comercial."
            href={distribuidorHref}
            category="distribuidor"
          />
          <PathCard
            icon={<PartyPopper size={22} strokeWidth={2.25} />}
            title="Quero no meu evento"
            description="Cenografia, geladeira branded, equipe e reposição. Você só manda o briefing."
            href={eventosHref}
            category="eventos"
          />
        </div>

        <p className="text-center text-white/60 text-sm mt-10">
          Sou consumidor →{" "}
          <a
            href="https://www.instagram.com/bebabangbang"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ffd36a] font-semibold underline underline-offset-4 hover:text-white transition-colors"
          >
            @bebabangbang no Instagram
          </a>
        </p>
      </Container>
    </SectionWrapper>
  )
}
