import { FileSignature, MessagesSquare, PartyPopper, TrendingUp } from "lucide-react"
import { Container } from "@/components/shared/Container"

interface Step {
  n: string
  icon: React.ReactNode
  title: string
  body: string
  accent: string
}

const STEPS: Step[] = [
  {
    n: "01",
    icon: <FileSignature size={22} strokeWidth={2.3} />,
    title: "Aplica",
    body: "Preenche o form aqui embaixo — leva uns 2 minutos. A gente lê tudo, sem bot no meio.",
    accent: "#d4ff4d",
  },
  {
    n: "02",
    icon: <MessagesSquare size={22} strokeWidth={2.3} />,
    title: "Conversa",
    body: "Se o match fizer sentido, marcamos um papo rápido pra alinhar expectativas e perfil.",
    accent: "#ffd36a",
  },
  {
    n: "03",
    icon: <PartyPopper size={22} strokeWidth={2.3} />,
    title: "Entra na Crew",
    body: "Você recebe o welcome kit, acesso ao grupo privado e já começa nas primeiras campanhas.",
    accent: "#ff7a3a",
  },
  {
    n: "04",
    icon: <TrendingUp size={22} strokeWidth={2.3} />,
    title: "Sobe de nível",
    body: "Performance vira cachê maior, viagens, ativações exclusivas e voz no que vem a seguir.",
    accent: "#E87A1E",
  },
]

export function HowItWorksSection() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 90% 50%, rgba(255,122,58,0.18), transparent 55%), " +
          "linear-gradient(180deg, #14080a 0%, #1f0d08 100%)",
      }}
    >
      <Container className="relative z-10">
        <div className="py-20 md:py-28">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-[#ff7a3a]/10 text-[#ff7a3a] border border-[#ff7a3a]/30">
                Como funciona
              </span>
              <h2
                className="mt-5 font-black uppercase leading-[0.95] tracking-[-0.02em]"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(2.25rem, 5vw, 4rem)",
                }}
              >
                Quatro passos.{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #d4ff4d, #ffd36a 60%, #ff7a3a)",
                  }}
                >
                  Sem enrolação.
                </span>
              </h2>
            </div>
            <p className="text-white/60 text-sm max-w-sm">
              Do clique no botão até o primeiro rolê com a gente, o processo
              costuma levar de 7 a 14 dias.
            </p>
          </div>

          {/* Steps — responsive grid with connector line on desktop */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Connector line (desktop only) */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-[60px] left-[12%] right-[12%] h-[2px] z-0"
              style={{
                background:
                  "linear-gradient(90deg, #d4ff4d 0%, #ffd36a 33%, #ff7a3a 66%, #E87A1E 100%)",
                opacity: 0.25,
              }}
            />

            {STEPS.map((step, i) => (
              <article
                key={step.n}
                className="relative z-10 group rounded-3xl p-6 border border-white/10 bg-[#0e0606]/70 backdrop-blur-sm hover:border-white/20 transition-all hover:-translate-y-1"
                style={{
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Number badge with accent glow */}
                <div
                  className="w-[120px] h-[120px] rounded-full flex items-center justify-center mb-5 relative transition-transform group-hover:scale-105 mx-auto"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${step.accent}28, ${step.accent}06 70%)`,
                    boxShadow: `inset 0 0 0 2px ${step.accent}40, 0 0 40px -10px ${step.accent}80`,
                  }}
                >
                  <span
                    className="font-black uppercase bg-clip-text text-transparent leading-none"
                    style={{
                      fontFamily: "var(--font-heading-var)",
                      fontSize: "3.2rem",
                      backgroundImage: `linear-gradient(180deg, ${step.accent} 0%, ${step.accent}80 100%)`,
                    }}
                  >
                    {step.n}
                  </span>
                  <div
                    className="absolute -bottom-2 right-1/2 translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: "#0a0606",
                      borderColor: step.accent,
                      color: step.accent,
                    }}
                  >
                    {step.icon}
                  </div>
                </div>

                <h3
                  className="text-center font-black uppercase mb-2"
                  style={{ fontFamily: "var(--font-heading-var)", fontSize: "1.4rem" }}
                >
                  {step.title}
                </h3>
                <p className="text-center text-sm text-white/65 leading-relaxed">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
