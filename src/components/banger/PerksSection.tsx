import { DollarSign, Package, Ticket, Gift, Camera, Zap } from "lucide-react"
import { Container } from "@/components/shared/Container"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

interface Perk {
  icon: React.ReactNode
  tag: string
  title: string
  body: string
  accent: string
}

const PERKS: Perk[] = [
  {
    icon: <DollarSign size={22} strokeWidth={2.4} />,
    tag: "Grana",
    title: "Cachê por campanha",
    body: "Pagamento fixo por entrega + bônus de performance. Nada de permuta disfarçada.",
    accent: "#d4ff4d",
  },
  {
    icon: <Package size={22} strokeWidth={2.4} />,
    tag: "Caixas",
    title: "Produto no rolê",
    body: "Kit mensal com as quatro latas, merch exclusivo e lançamentos antes de todo mundo.",
    accent: "#ffd36a",
  },
  {
    icon: <Ticket size={22} strokeWidth={2.4} />,
    tag: "VIP",
    title: "Lista nos eventos",
    body: "Acesso garantido aos eventos com Bang Bang — festivais, rooftops, ativações.",
    accent: "#ff7a3a",
  },
  {
    icon: <Camera size={22} strokeWidth={2.4} />,
    tag: "Produção",
    title: "Suporte criativo",
    body: "Referências, direção de arte e um time pra ajudar no que você precisar.",
    accent: "#E87A1E",
  },
  {
    icon: <Gift size={22} strokeWidth={2.4} />,
    tag: "Perks",
    title: "Perks & parcerias",
    body: "Descontos e cortesias com marcas parceiras da nossa rede.",
    accent: "#ff3a8a",
  },
  {
    icon: <Zap size={22} strokeWidth={2.4} />,
    tag: "Flex",
    title: "Zero burocracia",
    body: "Sem exclusividade maluca, sem contrato de 3 anos. Flexível, transparente, direto.",
    accent: "#d4ff4d",
  },
]

export function PerksSection() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(ellipse at 20% 10%, rgba(212,255,77,0.1), transparent 45%), " +
          "linear-gradient(180deg, #0a0606 0%, #14080a 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.14]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <Container className="relative z-10">
        <div className="py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-[#ffd36a]/10 text-[#ffd36a] border border-[#ffd36a]/30">
              O que você leva
            </span>
            <h2
              className="mt-5 font-black uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
              }}
            >
              Benefício real.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #d4ff4d, #ffd36a 55%, #ff7a3a)",
                }}
              >
                Sem letra miúda.
              </span>
            </h2>
            <p className="mt-5 text-white/70 text-lg max-w-[56ch] leading-relaxed">
              Cada Banger entra no programa com um combo claro: o que entrega,
              o que recebe, o que ganha a mais quando dá resultado. Zero
              surpresa depois.
            </p>
          </div>

          {/* Perks grid */}
          <div className="mt-14 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {PERKS.map((p) => (
              <PerkCard key={p.title} perk={p} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function PerkCard({ perk }: { perk: Perk }) {
  return (
    <article
      className="group relative rounded-3xl p-6 md:p-7 border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:from-white/[0.08] hover:to-white/[0.02] transition-all hover:-translate-y-1 overflow-hidden"
      style={{
        boxShadow: "0 10px 40px -20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Hover glow blob */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: perk.accent }}
      />

      <div className="relative flex items-start gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: `${perk.accent}16`,
            color: perk.accent,
            boxShadow: `inset 0 0 0 1px ${perk.accent}40`,
          }}
        >
          {perk.icon}
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="text-[10px] font-black tracking-[0.3em] uppercase block mb-1.5"
            style={{ color: perk.accent }}
          >
            {perk.tag}
          </span>
          <h3
            className="font-black uppercase leading-tight mb-2"
            style={{ fontFamily: "var(--font-heading-var)", fontSize: "1.3rem" }}
          >
            {perk.title}
          </h3>
          <p className="text-sm text-white/65 leading-relaxed">{perk.body}</p>
        </div>
      </div>
    </article>
  )
}
