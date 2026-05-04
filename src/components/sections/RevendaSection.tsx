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
import { Button } from "@/components/shared/Button"
import { Container } from "@/components/shared/Container"
import { SectionWrapper } from "@/components/shared/SectionWrapper"
import { SectionTitle } from "@/components/shared/SectionTitle"
import { ParceirosBlock } from "./ParceirosSection"
import { useContacts } from "@/lib/contacts/useContacts"
import { trackClick } from "@/lib/contacts/clicks"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="group relative flex flex-col gap-4 p-6 md:p-7 rounded-2xl bg-white border border-[#4A2C1A]/10 hover:border-[#E87A1E]/40 hover:shadow-[0_16px_40px_-18px_rgba(232,122,30,0.3)] hover:-translate-y-0.5 transition-all duration-300 h-full">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_8px_18px_-6px_rgba(232,122,30,0.55)] transition-transform duration-300 group-hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, #E87A1E 0%, #C4650F 60%, #E85D10 100%)",
        }}
      >
        {icon}
      </div>

      <h3
        className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl leading-tight tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        {title}
      </h3>

      <p className="text-sm md:text-[15px] text-[#4A2C1A]/70 leading-relaxed">
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
    <div className="flex flex-col gap-1.5 p-5 md:p-6 rounded-xl bg-[#FAFAF8] border border-[#4A2C1A]/8">
      <span
        className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        {value}
      </span>
      <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#4A2C1A]/60">
        {label}
      </span>
    </div>
  )
}

function SpecRow({ label, value }: SpecProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-[#4A2C1A]/8 last:border-0">
      <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#4A2C1A]/60">
        {label}
      </span>
      <span className="text-sm md:text-[15px] font-bold text-[#1A1A1A] text-right">
        {value}
      </span>
    </div>
  )
}

function LogisticaBlock() {
  return (
    <div className="relative rounded-3xl bg-white border border-[#4A2C1A]/10 p-6 md:p-9 shadow-[0_24px_60px_-30px_rgba(74,44,26,0.25)]">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_8px_18px_-6px_rgba(232,122,30,0.55)]"
            style={{
              background:
                "linear-gradient(135deg, #E87A1E 0%, #C4650F 60%, #E85D10 100%)",
            }}
          >
            <Boxes size={22} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#E87A1E]">
              Ficha técnica
            </span>
            <h3
              className="font-black uppercase text-[#1A1A1A] text-xl md:text-2xl leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Logística e paletização
            </h3>
          </div>
        </div>

        <a
          href="/lamina-comercial.pdf"
          download
          onClick={() => trackClick("distribuidor")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-[0.12em] uppercase text-[#1A1A1A] border border-[#4A2C1A]/20 bg-white hover:border-[#E87A1E] hover:text-[#E87A1E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 self-start md:self-auto"
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

      <p className="mt-6 text-xs text-[#4A2C1A]/50 leading-relaxed">
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
          <Button
            variant="whatsapp"
            size="md"
            href={distribuidorHref}
            icon={<MessageCircle size={18} />}
            onClick={() => trackClick("distribuidor")}
          >
            Quero distribuir
          </Button>
        </div>

        <div className="mt-16 md:mt-20">
          <LogisticaBlock />
        </div>
      </Container>

      <div className="mt-16 md:mt-20 pt-12 md:pt-14 border-t border-[#4A2C1A]/10">
        <ParceirosBlock fadeColor="#FAFAF8" />
      </div>
    </SectionWrapper>
  )
}
