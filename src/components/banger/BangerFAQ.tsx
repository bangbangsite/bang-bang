"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Container } from "@/components/shared/Container"

interface FAQ {
  q: string
  a: string
}

const FAQS: FAQ[] = [
  {
    q: "Preciso ter quantos seguidores pra aplicar?",
    a: "Zero regra fixa. A gente olha muito mais engajamento, vibe e adequação do conteúdo do que número cru. Já aceitamos gente com 8k e recusamos gente com 500k. O filtro é qualitativo.",
  },
  {
    q: "Tem exclusividade?",
    a: "Não. Você pode ter parceria com outras marcas, inclusive de bebida. A única coisa que pedimos é que, durante uma campanha ativa da Bang Bang, você não publique concorrente direto na mesma janela.",
  },
  {
    q: "Como funciona o cachê?",
    a: "Cada campanha tem um valor fixo combinado antes, baseado em entregas (reels, stories, presença em evento etc). Se bate meta de performance, rola bônus. Pagamento por PIX em até 15 dias úteis após a entrega aprovada.",
  },
  {
    q: "Preciso fazer quantos posts por mês?",
    a: "Depende do combo. Tem Banger que participa de 1 campanha por trimestre, tem gente que embarcou em série mensal. A gente monta junto com você, respeitando seu calendário.",
  },
  {
    q: "Posso aplicar se não sou maior de idade?",
    a: "Não. Programa exclusivo para maiores de 18 anos. Bang Bang é bebida alcoólica — só falamos com quem pode beber.",
  },
  {
    q: "Quanto tempo demora pra ter resposta?",
    a: "Entre 5 e 14 dias úteis. A gente lê tudo (é gente olhando, não bot). Se você não rolou agora, arquivamos o contato e avisamos quando abrir uma onda que combine.",
  },
  {
    q: "Vocês pagam viagem e hospedagem em eventos?",
    a: "Pra eventos que a gente convoca (festival, ativação, viagem), sim — tudo por nossa conta. Pra eventos que você ia de qualquer jeito e quer cobrir, entramos com produto e lista VIP.",
  },
  {
    q: "E se eu quiser sair do programa?",
    a: "Sem drama. Não tem multa, não tem fidelização. Você avisa, encerramos campanhas em andamento e segue a vida. A porta fica aberta pra voltar quando quiser.",
  },
]

export function BangerFAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(180deg, #14080a 0%, #0a0606 100%)",
      }}
    >
      <Container className="relative z-10">
        <div className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-[#d4ff4d]/10 text-[#d4ff4d] border border-[#d4ff4d]/30">
              Perguntou?
            </span>
            <h2
              className="mt-5 font-black uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
              }}
            >
              A gente{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #d4ff4d, #ffd36a 55%, #ff7a3a)",
                }}
              >
                responde.
              </span>
            </h2>
            <p className="mt-5 text-white/65 text-base max-w-xl mx-auto">
              Tudo que a gente mais escuta antes do aplica.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <ul className="flex flex-col gap-2">
              {FAQS.map((faq, i) => {
                const isOpen = open === i
                return (
                  <li key={faq.q}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`banger-faq-panel-${i}`}
                      className="group w-full flex items-start justify-between gap-4 text-left rounded-2xl px-5 py-5 md:px-6 md:py-6 border border-white/10 bg-white/[0.025] hover:bg-white/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4d]/50"
                    >
                      <span
                        className="font-black uppercase text-base md:text-lg leading-snug flex-1"
                        style={{ fontFamily: "var(--font-heading-var)" }}
                      >
                        {faq.q}
                      </span>
                      <span
                        className="shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-transform"
                        style={{
                          borderColor: isOpen
                            ? "rgba(212,255,77,0.6)"
                            : "rgba(255,255,255,0.2)",
                          background: isOpen ? "rgba(212,255,77,0.12)" : "transparent",
                          color: isOpen ? "#d4ff4d" : "rgba(255,255,255,0.6)",
                          transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                        }}
                      >
                        <Plus size={16} strokeWidth={2.6} />
                      </span>
                    </button>
                    <div
                      id={`banger-faq-panel-${i}`}
                      role="region"
                      aria-hidden={!isOpen}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] mt-1" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 md:px-6 pt-3 pb-5 text-white/70 text-[15px] leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
