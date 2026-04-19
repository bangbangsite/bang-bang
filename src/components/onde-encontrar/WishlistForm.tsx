"use client"

import { useEffect, useRef, useState, useActionState } from "react"
import {
  ArrowRight,
  Check,
  MapPin,
  Phone,
  User,
  MessageCircle,
  Loader2,
  Sparkles,
} from "lucide-react"
import { submitWishlistRequest, type WishlistActionState } from "@/lib/wishlist/actions"
import { EMPTY_REQUEST } from "@/lib/wishlist/config"
import { Select } from "@/components/shared/Select"
import { InstagramIcon } from "@/components/shared/icons/SocialIcons"
import type { UF } from "@/lib/types/pdv"
import { cn } from "@/lib/utils"

interface WishlistFormProps {
  /** Focus + soft-highlight trigger. Set true when user's search had zero PDVs. */
  highlighted?: boolean
  /** Prefill fields when we know the CEP/cidade from a ViaCEP lookup. */
  prefill?: {
    cep?: string
    cidade?: string
    uf?: UF | ""
    endereco?: string
    bairro?: string
  } | null
}

const UF_LIST: UF[] = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]

function formatCep(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

function formatWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11)
  if (!d) return ""
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const initialState: WishlistActionState = { ok: false, error: null }

export function WishlistForm({ highlighted, prefill }: WishlistFormProps) {
  const [state, formAction, isPending] = useActionState(submitWishlistRequest, initialState)

  const [form, setForm] = useState({ ...EMPTY_REQUEST })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [submittedCity, setSubmittedCity] = useState<string | null>(null)
  // Mobile reveal gate — on small screens the form lives behind a big CTA so
  // the pitch column reads as a strong ask first. Desktop ignores this (CSS
  // forces the form visible from lg+). `highlighted` auto-opens the form when
  // the user arrives from an empty-results search.
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Show success state when the Server Action returns ok.
  useEffect(() => {
    if (state.ok) {
      setSubmittedCity(form.cidade || "sua cidade")
      setForm({ ...EMPTY_REQUEST })
    }
  }, [state.ok]) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply prefill whenever it changes — does NOT overwrite fields the user
  // already typed. Tracked-key pattern so we only react to real changes.
  const prefillKey = JSON.stringify(prefill ?? {})
  const [trackedPrefillKey, setTrackedPrefillKey] = useState(prefillKey)
  if (prefillKey !== trackedPrefillKey) {
    setTrackedPrefillKey(prefillKey)
    if (prefill) {
      setForm((f) => ({
        ...f,
        cep: f.cep || (prefill.cep ? formatCep(prefill.cep) : f.cep),
        cidade: f.cidade || prefill.cidade || f.cidade,
        uf: f.uf || (prefill.uf ?? f.uf),
        endereco: f.endereco || prefill.endereco || f.endereco,
        bairro: f.bairro || prefill.bairro || f.bairro,
      }))
    }
  }

  // Scroll into view + subtle focus when the search turns empty. We also
  // force the mobile form open, since a `highlighted` arrival means the user
  // already asked a question and we shouldn't hide the answer behind a CTA.
  useEffect(() => {
    if (!highlighted) return
    setMobileExpanded(true)
    const el = sectionRef.current
    if (!el) return
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 250)
    return () => clearTimeout(t)
  }, [highlighted])

  const revealMobileForm = () => {
    setMobileExpanded(true)
    // Wait one frame for the form to mount before focusing the first field.
    requestAnimationFrame(() => {
      document.getElementById("wl-nome")?.focus({ preventScroll: true })
      document
        .getElementById("wl-nome")
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  // Auto-lookup when CEP reaches 8 digits (trigger for manual typing).
  useEffect(() => {
    const digits = form.cep.replace(/\D/g, "")
    if (digits.length !== 8) return
    let cancelled = false
    setCepLoading(true)
    setCepError(null)
    ;(async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
        if (!res.ok) throw new Error("network")
        const data: {
          logradouro?: string
          bairro?: string
          localidade?: string
          uf?: string
          erro?: boolean
        } = await res.json()
        if (cancelled) return
        if (data.erro) {
          setCepError("CEP não encontrado. Preencha o endereço manualmente.")
          return
        }
        setForm((f) => ({
          ...f,
          endereco: f.endereco || data.logradouro || "",
          bairro: f.bairro || data.bairro || "",
          cidade: f.cidade || data.localidade || "",
          uf: f.uf || ((data.uf ?? "").toUpperCase() as UF | ""),
        }))
      } catch {
        if (!cancelled) {
          setCepError("Não consegui consultar o CEP agora. Preencha manualmente.")
        }
      } finally {
        if (!cancelled) setCepLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form.cep])

  const canSubmit =
    form.nome.trim().length >= 2 &&
    form.whatsapp.replace(/\D/g, "").length >= 10

  // ----------------- Success state -----------------
  if (submittedCity) {
    return (
      <section
        ref={sectionRef}
        id="quero-bang-bang"
        aria-labelledby="quero-bang-bang-title"
        className="scroll-mt-24"
      >
        <div className="rounded-3xl p-8 md:p-12 bg-white border border-[#4A2C1A]/10 shadow-[0_20px_60px_-30px_rgba(45,24,16,0.18)]">
          <div className="flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#E87A1E] text-white flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(232,122,30,0.5)]">
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h3
              id="quero-bang-bang-title"
              className="font-black uppercase text-[#1A1A1A] text-2xl md:text-3xl leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Recebido! Obrigado.
            </h3>
            <p className="text-[#4A2C1A]/80 leading-relaxed">
              Seu voto por Bang Bang em{" "}
              <strong className="text-[#2D1810]">{submittedCity}</strong> foi
              registrado. Quando a gente abrir PDV aí, você é um dos primeiros a
              saber — no WhatsApp que você cadastrou.
            </p>
            <button
              type="button"
              onClick={() => setSubmittedCity(null)}
              className="mt-2 text-sm font-bold uppercase tracking-wider text-[#E87A1E] hover:text-[#C4650F] underline underline-offset-4"
            >
              Indicar outra cidade
            </button>
          </div>
        </div>
      </section>
    )
  }

  // ----------------- Form -----------------
  return (
    <section
      ref={sectionRef}
      id="quero-bang-bang"
      aria-labelledby="quero-bang-bang-title"
      className={cn(
        "scroll-mt-24 rounded-3xl bg-white overflow-hidden transition-all",
        highlighted
          ? "border-2 border-[#E87A1E] shadow-[0_20px_60px_-20px_rgba(232,122,30,0.35)] ring-1 ring-[#E87A1E]/20"
          : "border border-[#4A2C1A]/10 shadow-[0_12px_40px_-20px_rgba(45,24,16,0.12)]",
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] items-stretch">
        {/* Left — pitch column. Subtle warm gradient so it differentiates from
            the form panel without becoming a heavy creme block. */}
        <div
          className="relative flex flex-col gap-4 p-6 md:p-9 lg:border-r border-[#4A2C1A]/8"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(255,211,106,0.18), transparent 55%)," +
              "linear-gradient(180deg, #FFFDF7 0%, #FAFAF8 100%)",
          }}
        >
          <span className="inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E87A1E] text-white text-[10px] font-black uppercase tracking-[0.22em] shadow-[0_6px_14px_-6px_rgba(232,122,30,0.6)]">
            <MapPin size={12} strokeWidth={2.6} />
            Ajuda a mapear
          </span>

          <h3
            id="quero-bang-bang-title"
            className="font-black uppercase text-[#1A1A1A] text-3xl md:text-4xl leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            Quero Bang Bang
            <br />
            <span className="text-[#E87A1E]">na minha cidade</span>.
          </h3>

          <p className="text-[#4A2C1A]/75 leading-relaxed text-[15px]">
            Não achou PDV perto de você? Registra sua demanda aqui. A gente usa
            esses pedidos pra priorizar próximas cidades — quanto mais gente
            pedir, mais rápido chegamos aí.
          </p>

          {highlighted && (
            <div className="rounded-xl bg-[#E87A1E]/10 border border-[#E87A1E]/30 text-[#C4650F] px-3.5 py-2.5 text-sm font-semibold leading-snug">
              Sua busca não achou PDV. Deixa teus dados que a gente te avisa
              quando chegar.
            </div>
          )}

          <ul className="mt-2 flex flex-col gap-2.5 text-[14px] text-[#4A2C1A]/75">
            <Bullet>Sem email, sem enrolação — só WhatsApp.</Bullet>
            <Bullet>CEP preenche seu endereço automaticamente.</Bullet>
            <Bullet>A gente te chama quando abrir PDV aí.</Bullet>
          </ul>

          {/* Mobile-only CTA — reveals the form. Hidden from lg+ since the form
              sits alongside the pitch on desktop. */}
          {!mobileExpanded && (
            <button
              type="button"
              onClick={revealMobileForm}
              aria-expanded={false}
              aria-controls="wishlist-form-panel"
              className={cn(
                "lg:hidden mt-3 inline-flex w-full items-center justify-center gap-2 h-14 px-6 rounded-xl",
                "bg-[#E87A1E] text-white font-black text-[13px] uppercase tracking-[0.16em]",
                "shadow-[0_16px_40px_-10px_rgba(232,122,30,0.55)]",
                "hover:bg-[#C4650F] active:translate-y-0 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2",
              )}
            >
              Quero Bang Bang na minha cidade
              <ArrowRight size={16} strokeWidth={2.6} />
            </button>
          )}

          {/* Post-submit nudge — minimal IG follow prompt anchored at the
              bottom of the pitch column as a gentle PS. Hidden on mobile
              when the form is still gated: the "depois de indicar" copy
              only makes sense once the ask is visible. */}
          <div
            className={cn(
              "mt-auto pt-6 border-t border-[#4A2C1A]/10 flex items-start gap-3",
              !mobileExpanded && "hidden lg:flex",
            )}
          >
            <span
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white"
              style={{
                background:
                  "linear-gradient(135deg, #f5a623 0%, #E87A1E 45%, #c13584 90%, #833ab4 100%)",
              }}
              aria-hidden="true"
            >
              <InstagramIcon size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#4A2C1A]/75 leading-relaxed">
                Depois de indicar,{" "}
                <span className="text-[#2D1810] font-semibold">
                  segue a gente
                </span>{" "}
                — postamos em tempo real cada cidade nova que a Bang Bang
                domina.
              </p>
              <a
                href="https://www.instagram.com/bebabangbang"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] uppercase text-[#E87A1E] hover:text-[#C4650F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] rounded"
              >
                @bebabangbang
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right — form. Hidden on mobile until the user taps the CTA; always
            visible from lg+ where it sits beside the pitch column. */}
        <form
          id="wishlist-form-panel"
          action={formAction}
          className={cn(
            "flex-col gap-4 p-6 md:p-9 bg-[#FAFAF8]",
            mobileExpanded ? "flex" : "hidden lg:flex",
          )}
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-black tracking-[0.22em] uppercase text-[#4A2C1A]/55">
              Cadastro · &lt;30s
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.18em] uppercase text-[#E87A1E]">
              <Sparkles size={10} strokeWidth={2.6} />
              Sem email
            </span>
          </div>

          {/* Server action error — shown inline above the submit button */}
          {state.error && (
            <div
              role="alert"
              className="rounded-xl px-4 py-3 text-sm bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B]"
            >
              {state.error}
            </div>
          )}

          {/* Hidden fields — carry controlled state values into the FormData */}
          <input type="hidden" name="cep" value={form.cep.replace(/\D/g, "")} />
          <input type="hidden" name="endereco" value={form.endereco} />
          <input type="hidden" name="bairro" value={form.bairro} />
          <input type="hidden" name="cidade" value={form.cidade} />
          <input type="hidden" name="uf" value={form.uf} />

          {/* Nome */}
          <Field
            id="wl-nome"
            label="Seu nome"
            icon={<User size={13} strokeWidth={2.4} />}
          >
            <input
              id="wl-nome"
              name="nome"
              type="text"
              autoComplete="name"
              required
              value={form.nome}
              onChange={(e) =>
                setForm((f) => ({ ...f, nome: e.target.value }))
              }
              placeholder="Como prefere ser chamado"
              className={inputCls}
            />
          </Field>

          {/* WhatsApp */}
          <Field
            id="wl-wpp"
            label="WhatsApp"
            icon={<Phone size={13} strokeWidth={2.4} />}
            hint="DDD + número"
          >
            <input
              id="wl-wpp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={form.whatsapp}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  whatsapp: formatWhatsapp(e.target.value),
                }))
              }
              placeholder="(31) 99999-9999"
              className={inputCls}
            />
          </Field>

          {/* CEP — controlled display; raw digits go via hidden input */}
          <Field
            id="wl-cep"
            label="CEP"
            icon={<MapPin size={13} strokeWidth={2.4} />}
            hint={
              cepLoading
                ? "Consultando…"
                : cepError ?? "8 dígitos preenchem o endereço"
            }
            hintTone={cepError ? "error" : undefined}
          >
            <div className="relative">
              <input
                id="wl-cep"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.cep}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cep: formatCep(e.target.value) }))
                }
                placeholder="00000-000"
                className={inputCls}
              />
              {cepLoading && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E87A1E] animate-spin"
                />
              )}
            </div>
          </Field>

          {/* Endereço + Nº */}
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <Field id="wl-end" label="Endereço">
              <input
                id="wl-end"
                type="text"
                autoComplete="street-address"
                value={form.endereco}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endereco: e.target.value }))
                }
                placeholder="Rua / Av."
                className={inputCls}
              />
            </Field>
            <Field id="wl-num" label="Nº">
              <input
                id="wl-num"
                name="numero"
                type="text"
                inputMode="numeric"
                value={form.numero}
                onChange={(e) =>
                  setForm((f) => ({ ...f, numero: e.target.value }))
                }
                placeholder="123"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Bairro */}
          <Field id="wl-bairro" label="Bairro">
            <input
              id="wl-bairro"
              type="text"
              value={form.bairro}
              onChange={(e) =>
                setForm((f) => ({ ...f, bairro: e.target.value }))
              }
              placeholder="Seu bairro"
              className={inputCls}
            />
          </Field>

          {/* Cidade + UF — controlled values sent via hidden inputs above */}
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <Field id="wl-cidade" label="Cidade">
              <input
                id="wl-cidade"
                type="text"
                autoComplete="address-level2"
                required
                value={form.cidade}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cidade: e.target.value }))
                }
                placeholder="Sua cidade"
                className={inputCls}
              />
            </Field>
            <Field id="wl-uf" label="UF">
              <Select<UF | "">
                id="wl-uf"
                aria-label="Estado"
                className="w-full block"
                value={form.uf}
                onChange={(v) => setForm((f) => ({ ...f, uf: v }))}
                options={[
                  { value: "", label: "—" },
                  ...UF_LIST.map((uf) => ({ value: uf as UF, label: uf })),
                ]}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className={cn(
              "mt-3 inline-flex items-center justify-center gap-2 h-11 rounded-lg text-[12px] font-black uppercase tracking-[0.18em] transition-all",
              "bg-[#E87A1E] text-white shadow-[0_10px_24px_-10px_rgba(232,122,30,0.55)]",
              "hover:bg-[#C4650F] hover:-translate-y-0.5 active:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
            )}
          >
            <MessageCircle size={14} strokeWidth={2.6} />
            {isPending ? "Enviando…" : "Quero Bang Bang aqui"}
          </button>

          <p className="text-[11px] text-[#4A2C1A]/50 text-center">
            A gente só usa pra te avisar quando abrir PDV na sua região.
          </p>
        </form>
      </div>
    </section>
  )
}

// ----------------- small helpers -----------------

const inputCls =
  "w-full h-11 px-3.5 rounded-xl border border-[#4A2C1A]/15 bg-white text-[#2D1810] text-sm placeholder:text-[#4A2C1A]/40 focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"

function Field({
  id,
  label,
  icon,
  hint,
  hintTone,
  children,
}: {
  id: string
  label: string
  icon?: React.ReactNode
  hint?: string | null
  hintTone?: "error"
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label
        htmlFor={id}
        className="text-[10px] font-black tracking-[0.22em] uppercase text-[#4A2C1A]/60 flex items-center gap-1.5"
      >
        {icon && <span className="text-[#E87A1E]">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && (
        <p
          className={cn(
            "text-[11px]",
            hintTone === "error"
              ? "text-[#D32F2F] font-semibold"
              : "text-[#4A2C1A]/50",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#E87A1E]/12 text-[#E87A1E] inline-flex items-center justify-center"
      >
        <Check size={10} strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  )
}
