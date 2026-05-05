"use client"

import {
  TrendingUp,
  Shield,
  Award,
  Megaphone,
  MessageCircle,
  Download,
  Boxes,
} from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { ParceirosBlock } from "./ParceirosSection"
import { useContacts } from "@/lib/contacts/useContacts"
import { trackClick } from "@/lib/contacts/clicks"

// ============================================
// DS validated tokens (Bang Bang Boom DS v0)
// Source: https://design-system-bang.vercel.app/
// ============================================
const DS = {
  brandDark: "#2C1505",
  brandAmber: "#C07828",
  brandWhite: "#FFFFFF",
  brandCream: "#F5ECD7",
  espresso: "#270C08",
  oliveSmoke: "#5A5228",
  copperDust: "#A06230",
  creamLight: "#EEE0C4",
  brandGradient:
    "linear-gradient(135deg, #270C08 0%, #8C4515 50%, #C8902C 100%)",
  fontDisplay: "var(--font-display-var)", // Bebas Neue
  fontHeading: "var(--font-heading-var)", // Oswald
  fontBody: "var(--font-heading-var)", // Oswald per DS body
} as const

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article
      className="group relative flex flex-col gap-4 p-6 md:p-8 transition-all duration-300 h-full"
      style={{
        background: DS.brandWhite,
        border: `1px solid ${DS.brandDark}1A`,
        borderRadius: "24px",
      }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{
          background: DS.brandGradient,
          color: DS.brandWhite,
          borderRadius: "12px",
          boxShadow: `0 8px 18px -6px ${DS.espresso}66`,
        }}
      >
        {icon}
      </div>

      <h3
        className="uppercase text-xl md:text-2xl leading-none tracking-[0.02em]"
        style={{
          fontFamily: DS.fontDisplay,
          color: DS.brandDark,
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </h3>

      <p
        className="text-sm md:text-[15px] leading-relaxed"
        style={{
          fontFamily: DS.fontBody,
          color: `${DS.oliveSmoke}D9`,
          fontWeight: 400,
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </article>
  )
}

const FEATURES: FeatureCardProps[] = [
  {
    icon: <TrendingUp size={22} strokeWidth={2.4} />,
    title: "Categoria que cresce",
    description:
      "RTD é o segmento de maior expansão no Brasil. Bang Bang surfa a onda com 4 SKUs prontos pra prateleira.",
  },
  {
    icon: <Shield size={22} strokeWidth={2.4} />,
    title: "Território exclusivo",
    description:
      "Exclusividade regional, sem canibalização. Plano comercial alinhado, tabela dedicada e sell-out monitorado.",
  },
  {
    icon: <Award size={22} strokeWidth={2.4} />,
    title: "Marca que puxa giro",
    description:
      "Presença em eventos nacionais, base de consumo crescente. Quando chega no PDV, cliente já procura pelo nome.",
  },
  {
    icon: <Megaphone size={22} strokeWidth={2.4} />,
    title: "Marketing co-op",
    description:
      "Material de PDV, geladeiras branded, ativações e suporte de campo. Distribuidor não vende sozinho.",
  },
]

interface SpecProps {
  label: string
  value: string
}

const PALLET_KPIS: SpecProps[] = [
  { label: "Latas por pallet", value: "2.112" },
  { label: "Packs por pallet", value: "176" },
  { label: "Peso bruto", value: "1.000 kg" },
  { label: "Volume", value: "1,96 m³" },
]

const PALLET_SPECS: SpecProps[] = [
  { label: "Latas por pack", value: "12" },
  { label: "Camadas × packs", value: "8 × 22" },
  { label: "Pallet PBR (A×L×C)", value: "1,63 × 1,00 × 1,20 m" },
  { label: "Empilhamento", value: "Não empilhar" },
  { label: "NCM", value: "2208.90-00" },
  { label: "Volume alcoólico", value: "5,5% vol · 473 ml" },
]

function KpiCell({ label, value }: SpecProps) {
  return (
    <div
      className="flex flex-col gap-2 p-5 md:p-6"
      style={{
        background: DS.creamLight,
        border: `1px solid ${DS.brandDark}14`,
        borderRadius: "12px",
      }}
    >
      <span
        className="text-3xl md:text-4xl leading-none"
        style={{
          fontFamily: DS.fontDisplay,
          color: DS.brandDark,
          letterSpacing: "0.02em",
        }}
      >
        {value}
      </span>
      <span
        className="text-[11px] tracking-[0.18em] uppercase"
        style={{
          fontFamily: DS.fontBody,
          color: `${DS.oliveSmoke}B3`,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function SpecRow({ label, value }: SpecProps) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-3"
      style={{ borderBottom: `1px solid ${DS.brandDark}14` }}
    >
      <span
        className="text-[12px] tracking-[0.16em] uppercase"
        style={{
          fontFamily: DS.fontBody,
          color: `${DS.oliveSmoke}B3`,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span
        className="text-sm md:text-[15px] text-right"
        style={{
          fontFamily: DS.fontBody,
          color: DS.brandDark,
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function LogisticaBlock() {
  return (
    <div
      className="relative p-6 md:p-10"
      style={{
        background: DS.brandWhite,
        border: `1px solid ${DS.brandDark}1A`,
        borderRadius: "24px",
        boxShadow: `0 24px 60px -30px ${DS.espresso}40`,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center shrink-0"
            style={{
              background: DS.brandGradient,
              color: DS.brandWhite,
              borderRadius: "12px",
              boxShadow: `0 8px 18px -6px ${DS.espresso}66`,
            }}
          >
            <Boxes size={22} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-[11px] tracking-[0.24em] uppercase"
              style={{
                fontFamily: DS.fontBody,
                color: DS.brandAmber,
                fontWeight: 700,
              }}
            >
              Ficha técnica
            </span>
            <h3
              className="uppercase text-2xl md:text-3xl leading-none"
              style={{
                fontFamily: DS.fontDisplay,
                color: DS.brandDark,
                letterSpacing: "0.03em",
              }}
            >
              Logística e paletização
            </h3>
          </div>
        </div>

        <a
          href="/lamina-comercial.pdf"
          download
          onClick={() => trackClick("distribuidor")}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs tracking-[0.14em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 self-start md:self-auto"
          style={{
            fontFamily: DS.fontBody,
            fontWeight: 700,
            color: DS.brandDark,
            background: DS.brandWhite,
            border: `1px solid ${DS.brandDark}33`,
            borderRadius: "12px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DS.brandAmber
            e.currentTarget.style.color = DS.brandAmber
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${DS.brandDark}33`
            e.currentTarget.style.color = DS.brandDark
          }}
        >
          <Download size={14} strokeWidth={2.4} />
          Baixar ficha completa (PDF)
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {PALLET_KPIS.map((kpi) => (
          <KpiCell key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
        {PALLET_SPECS.map((spec) => (
          <SpecRow key={spec.label} {...spec} />
        ))}
      </div>

      <p
        className="mt-6 text-xs leading-relaxed"
        style={{
          fontFamily: DS.fontBody,
          color: `${DS.oliveSmoke}99`,
          fontWeight: 400,
        }}
      >
        EAN, DUN e MAPA por SKU disponíveis na ficha por sabor (acima) e na lâmina comercial completa.
      </p>
    </div>
  )
}

export function RevendaSection() {
  const { urls } = useContacts()
  const distribuidorHref = urls.distribuidor || "#contato"

  return (
    <SectionWrapper bg="light" py="lg" id="distribuicao">
      <Container>
        <SectionTitle
          eyebrow="Pra distribuidores"
          title="Bang Bang"
          highlight="no seu portfólio."
          subtitle="Categoria em alta, marca consolidada, território exclusivo. Não é só mais um SKU. É giro garantido."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-12 items-stretch">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={distribuidorHref}
            onClick={() => trackClick("distribuidor")}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm tracking-[0.12em] uppercase text-white shadow-[0_12px_32px_-8px_rgba(192,120,40,0.65)] hover:-translate-y-0.5 hover:bg-[#A06230] hover:shadow-[0_16px_40px_-10px_rgba(160,98,48,0.85)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5ECD7]"
            style={{
              fontFamily: "var(--font-heading-var)",
              fontWeight: 700,
              background: "#C07828",
            }}
          >
            <MessageCircle size={18} />
            Quero distribuir
          </a>
        </div>

        <div className="mt-16 md:mt-20">
          <LogisticaBlock />
        </div>
      </Container>

      <div
        className="mt-16 md:mt-20 pt-12 md:pt-14"
        style={{ borderTop: `1px solid ${DS.brandDark}1A` }}
      >
        <ParceirosBlock fadeColor={DS.brandCream} />
      </div>
    </SectionWrapper>
  )
}
