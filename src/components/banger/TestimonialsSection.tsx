import { Quote } from "lucide-react"
import { Container } from "@/components/shared/Container"

interface Testimonial {
  quote: string
  author: string
  role: string
  handle: string
  accent: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Entrei achando que ia ser tipo todo programa de creator. Na primeira campanha vi que não era. Me mandaram o produto, o briefing de uma página só e me deixaram em paz. Resultado: meu melhor reels do ano.",
    author: "Larissa Rocha",
    role: "Creator · Nightlife SP",
    handle: "@lari.rocha",
    accent: "#d4ff4d",
  },
  {
    quote:
      "O que me prendeu foi o acesso. Entrei na Crew em fevereiro e em março já tava tocando num festival com Bang Bang apoiando. Isso sem fazer post nenhum ainda. Aqui é relacionamento de verdade.",
    author: "Pedro Guimarães",
    role: "DJ · Rio",
    handle: "@pedrao.vibes",
    accent: "#ff3a8a",
  },
  {
    quote:
      "Eu não tinha 50k de seguidores quando apliquei. Achei que iam ignorar. Ligaram em dois dias. Hoje faço o que eu ia fazer de qualquer jeito — mas pago, com caixa na porta e galera escutando.",
    author: "Matheus Lima",
    role: "Youtuber · Bar content",
    handle: "@matheusnabeer",
    accent: "#ff7a3a",
  },
]

export function TestimonialsSection() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 10% 80%, rgba(212,255,77,0.1), transparent 50%), " +
          "linear-gradient(180deg, #0a0606 0%, #14080a 100%)",
      }}
    >
      <Container className="relative z-10">
        <div className="py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-[#ffd36a]/10 text-[#ffd36a] border border-[#ffd36a]/30">
              Quem já é banger
            </span>
            <h2
              className="mt-5 font-black uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
              }}
            >
              Na voz de quem{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #d4ff4d, #ffd36a 55%, #ff7a3a)",
                }}
              >
                tá dentro.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <article
                key={t.handle}
                className="group relative rounded-3xl p-6 md:p-7 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all hover:-translate-y-1 flex flex-col gap-5"
                style={{
                  transform: `rotate(${i % 2 === 0 ? "-0.6deg" : "0.8deg"})`,
                }}
              >
                <Quote
                  size={28}
                  strokeWidth={2.2}
                  style={{ color: t.accent }}
                  className="opacity-80"
                />
                <p className="text-white/80 text-[15px] leading-relaxed flex-1">
                  {t.quote}
                </p>
                <footer className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div
                    className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-black uppercase"
                    style={{
                      background: `${t.accent}22`,
                      color: t.accent,
                      boxShadow: `inset 0 0 0 1.5px ${t.accent}55`,
                      fontFamily: "var(--font-heading-var)",
                    }}
                  >
                    {t.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-black uppercase text-sm truncate"
                      style={{ fontFamily: "var(--font-heading-var)" }}
                    >
                      {t.author}
                    </p>
                    <p className="text-[11px] text-white/50 uppercase tracking-wider truncate">
                      {t.role} · <span style={{ color: t.accent }}>{t.handle}</span>
                    </p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
