"use client"

import {
  TrendingUp,
  Zap,
  Award,
  HeartHandshake,
  MessageCircle,
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
      {/* Icon chip — orange gradient, mirrors the CTAs */}
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
    title: "Vende rápido, não sobra",
    description:
      "RTD é a categoria que cresce mais rápido no Brasil. Cliente entra, pega da geladeira, paga. Reposição quase semanal.",
  },
  {
    icon: <Zap size={22} strokeWidth={2.4} />,
    title: "Zero preparo",
    description:
      "Sem coqueteleira, sem copo, sem mistura, sem bartender. Abre, serve, lucra. Sua operação não muda nada.",
  },
  {
    icon: <Award size={22} strokeWidth={2.4} />,
    title: "Marca que o cliente já procura",
    description:
      "Bang Bang aparece em festa, rooftop, festival. Quando ele pede no balcão, é porque já sabe o que quer.",
  },
  {
    icon: <HeartHandshake size={22} strokeWidth={2.4} />,
    title: "A gente entra junto",
    description:
      "Material de PDV, kit de ativação, cartaz, geladeira. Você não fica sozinho na hora de vender.",
  },
]

export function RevendaSection() {
  const { urls } = useContacts()
  const revendaHref = urls.revenda || "#contato"
  const distribuidorHref = urls.distribuidor || "#contato"

  return (
    <SectionWrapper bg="light" py="lg" id="revenda">
      <Container>
        <SectionTitle
          eyebrow="Pra quem vende"
          title="Bota Bang Bang"
          highlight="na prateleira."
          subtitle="Não é só uma bebida — é giro alto, margem real e um cliente que já chega pedindo pelo nome."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-12 items-stretch">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="whatsapp"
            size="md"
            href={revendaHref}
            icon={<MessageCircle size={18} />}
            onClick={() => trackClick("revenda")}
          >
            Quero revender
          </Button>

          <Button
            variant="outline"
            size="md"
            href={distribuidorHref}
            onClick={() => trackClick("distribuidor")}
          >
            Sou distribuidor
          </Button>
        </div>
      </Container>

      {/* Parceiros — prova social B2B na MESMA dobra. Hairline divider acima
          pra separar o "argumento" (cards) do "quem já fechou" (logos), sem
          gerar mais espaço vertical do que o necessário. */}
      <div className="mt-16 md:mt-20 pt-12 md:pt-14 border-t border-[#4A2C1A]/10">
        <ParceirosBlock fadeColor="#FAFAF8" />
      </div>
    </SectionWrapper>
  )
}
