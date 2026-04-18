"use client"

import { useEffect, useRef, useState } from "react"
import { Flame, Megaphone, Heart } from "lucide-react"
import { Container } from "@/components/shared/Container"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

interface MetricDef {
  value: number
  suffix: string
  label: string
  caption: string
  color: string
}

// Placeholder numbers — Pedro vai validar antes de ir pro ar.
const METRICS: MetricDef[] = [
  {
    value: 86,
    suffix: "+",
    label: "Bangers ativos",
    caption: "no programa hoje",
    color: "#d4ff4d",
  },
  {
    value: 4.2,
    suffix: "M",
    label: "Views orgânicas",
    caption: "em 90 dias",
    color: "#ffd36a",
  },
  {
    value: 18,
    suffix: " UFs",
    label: "Cobertura",
    caption: "de norte a sul",
    color: "#ff7a3a",
  },
  {
    value: 3.8,
    suffix: "x",
    label: "Engajamento",
    caption: "acima da média",
    color: "#E87A1E",
  },
]

function useCountUp(target: number, inView: boolean, duration = 1400) {
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current) return
    startedRef.current = true
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, inView, duration])

  return value
}

function MetricCard({ def, inView }: { def: MetricDef; inView: boolean }) {
  const n = useCountUp(def.value, inView)
  const display =
    def.value % 1 === 0
      ? Math.round(n).toLocaleString("pt-BR")
      : n.toFixed(1).replace(".", ",")

  return (
    <div
      className="relative group rounded-3xl p-6 md:p-7 border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden hover:border-white/20 transition-colors"
      style={{
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"
        style={{ background: def.color }}
      />
      <div className="relative flex flex-col gap-3">
        <span
          className="font-black uppercase leading-none tabular-nums bg-clip-text text-transparent"
          style={{
            fontFamily: "var(--font-heading-var)",
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
            backgroundImage: `linear-gradient(180deg, ${def.color} 0%, ${def.color}aa 100%)`,
          }}
        >
          {display}
          <span className="text-white/70">{def.suffix}</span>
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-black uppercase tracking-[0.18em] text-white">
            {def.label}
          </span>
          <span className="text-xs text-white/50">{def.caption}</span>
        </div>
      </div>
    </div>
  )
}

export function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(232,122,30,0.2), transparent 55%), " +
          "linear-gradient(180deg, #14080a 0%, #0a0606 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.15]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <Container className="relative z-10">
        <div className="py-20 md:py-28">
          {/* Two-column: manifesto text + three pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-start">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-[#d4ff4d]/10 text-[#d4ff4d] border border-[#d4ff4d]/30">
                Manifesto Banger
              </span>

              <h2
                className="mt-6 font-black uppercase leading-[0.95] tracking-[-0.02em]"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
                }}
              >
                A gente não <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #d4ff4d, #ffd36a 60%, #ff7a3a)",
                  }}
                >
                  pauteia ninguém.
                </span>
              </h2>

              <div className="mt-8 flex flex-col gap-5 text-white/75 text-lg leading-relaxed max-w-[55ch]">
                <p>
                  Banger não decora briefing. Banger abre a lata, conta o rolê
                  do jeito dele e mostra a Bang Bang onde ela tá: na mesa, no
                  rooftop, no after, na palhinha antes do show.
                </p>
                <p>
                  Se você tem voz, tem <strong className="text-white">galera</strong> e curte
                  agitar, a gente já quer te conhecer — independente do número
                  de seguidores. Aqui a régua é autenticidade.
                </p>
                <p className="text-[#ffd36a] font-semibold italic">
                  &ldquo;O Banger vende porque vive. Não vive porque vende.&rdquo;
                </p>
              </div>
            </div>

            {/* Three pillars */}
            <div className="flex flex-col gap-4">
              <PillarCard
                icon={<Flame size={20} strokeWidth={2.3} />}
                tag="01 · VIBE"
                title="Autêntico, sempre."
                body="Nada de roteiro engessado. Você conta do seu jeito, com a sua galera."
                accent="#d4ff4d"
              />
              <PillarCard
                icon={<Megaphone size={20} strokeWidth={2.3} />}
                tag="02 · VOZ"
                title="A sua narrativa manda."
                body="A gente entrega o produto, o briefing e te solta. Sem micro-gestão."
                accent="#ffd36a"
              />
              <PillarCard
                icon={<Heart size={20} strokeWidth={2.3} />}
                tag="03 · TROCA"
                title="Relacionamento, não contrato."
                body="Cachê justo, produtos no rolê e acesso a eventos antes de todo mundo."
                accent="#ff7a3a"
              />
            </div>
          </div>

          {/* Metrics strip */}
          <div className="mt-20 md:mt-28">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <h3
                className="font-black uppercase leading-none"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                }}
              >
                A Banger Crew em{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #d4ff4d, #ffd36a)",
                  }}
                >
                  números
                </span>
              </h3>
              <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-semibold">
                *Dados internos · atualizado 2026
              </span>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {METRICS.map((m) => (
                <MetricCard key={m.label} def={m} inView={inView} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function PillarCard({
  icon,
  tag,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode
  tag: string
  title: string
  body: string
  accent: string
}) {
  return (
    <article
      className="group relative rounded-2xl p-5 md:p-6 border border-white/10 bg-white/[0.025] hover:bg-white/[0.05] transition-colors overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-all group-hover:w-[5px]"
        style={{ background: accent, boxShadow: `0 0 20px ${accent}80` }}
      />
      <div className="flex items-start gap-4 pl-3">
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
          style={{
            background: `${accent}14`,
            borderColor: `${accent}55`,
            color: accent,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="block text-[10px] font-black tracking-[0.3em] uppercase mb-1"
            style={{ color: accent }}
          >
            {tag}
          </span>
          <h4
            className="font-black uppercase leading-tight mb-1.5"
            style={{ fontFamily: "var(--font-heading-var)", fontSize: "1.125rem" }}
          >
            {title}
          </h4>
          <p className="text-sm text-white/65 leading-relaxed">{body}</p>
        </div>
      </div>
    </article>
  )
}
