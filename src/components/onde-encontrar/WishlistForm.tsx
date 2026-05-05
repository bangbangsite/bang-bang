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
} from "lucide-react"
import {
  submitWishlistRequest,
  type WishlistActionState,
} from "@/lib/wishlist/actions"
import { EMPTY_REQUEST } from "@/lib/wishlist/config"
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
  const [state, formAction, isPending] = useActionState(
    submitWishlistRequest,
    initialState,
  )

  const [form, setForm] = useState({ ...EMPTY_REQUEST })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [submittedCity, setSubmittedCity] = useState<string | null>(null)
  // Mobile reveal gate — small screens hide the form behind a CTA so the pitch
  // reads first. `highlighted` auto-opens the form when the user arrives from
  // an empty-results search.
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (state.ok) {
      setSubmittedCity(form.cidade || "sua cidade")
      setForm({ ...EMPTY_REQUEST })
    }
  }, [state.ok]) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply prefill — only the fields we still expose or use silently.
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
      }))
    }
  }

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
    requestAnimationFrame(() => {
      document.getElementById("wl-nome")?.focus({ preventScroll: true })
      document
        .getElementById("wl-nome")
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  // Auto-lookup when CEP reaches 8 digits — populates cidade/uf silently in
  // hidden form state so the backend still gets geolocation data.
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
          localidade?: string
          uf?: string
          erro?: boolean
        } = await res.json()
        if (cancelled) return
        if (data.erro) {
          setCepError("CEP não encontrado. Confere os dígitos.")
          return
        }
        setForm((f) => ({
          ...f,
          cidade: data.localidade || f.cidade,
          uf: ((data.uf ?? f.uf) as UF | "").toString().toUpperCase() as UF | "",
        }))
      } catch {
        if (!cancelled) {
          setCepError("Não consegui consultar o CEP agora. Tenta de novo.")
        }
      } finally {
        if (!cancelled) setCepLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form.cep])

  const cepValid = form.cep.replace(/\D/g, "").length === 8
  const canSubmit =
    form.nome.trim().length >= 2 &&
    form.whatsapp.replace(/\D/g, "").length >= 10 &&
    cepValid

  // ----------------- Success state -----------------
  if (submittedCity) {
    return (
      <section
        ref={sectionRef}
        id="quero-bang-bang"
        aria-labelledby="quero-bang-bang-title"
        className="scroll-mt-24"
      >
        <div className="rounded-3xl p-8 md:p-12 bg-white border border-[#5A5228]/10 shadow-[0_20px_60px_-30px_rgba(45,24,16,0.18)]">
          <div className="flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#C07828] text-white flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(192,120,40,0.5)]">
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h3
              id="quero-bang-bang-title"
              // DS H1 → Bebas Neue display
              className="uppercase text-[#2C1505] text-3xl md:text-4xl leading-tight"
              style={{
                fontFamily: "var(--font-display-var)",
                fontWeight: 400,
                letterSpacing: "0.03em",
              }}
            >
              Recebido! Obrigado.
            </h3>
            <p
              className="text-[#5A5228]/85 leading-relaxed"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 400, lineHeight: 1.7 }}
            >
              Seu voto por Bang Bang em{" "}
              <strong className="text-[#2C1505]">{submittedCity}</strong> foi
              registrado. Quando a gente abrir PDV aí, você é um dos primeiros a
              saber — no WhatsApp que você cadastrou.
            </p>
            <button
              type="button"
              onClick={() => setSubmittedCity(null)}
              className="mt-2 text-sm font-bold uppercase tracking-wider text-[#C07828] hover:text-[#A06230] underline underline-offset-4"
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
          ? "border-2 border-[#C07828] shadow-[0_20px_60px_-20px_rgba(192,120,40,0.35)] ring-1 ring-[#C07828]/20"
          : "border border-[#5A5228]/10 shadow-[0_12px_40px_-20px_rgba(45,24,16,0.12)]",
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] items-stretch">
        {/* Left — pitch column. Trimmed: title + 1-line subtitle. */}
        <div
          className="relative flex flex-col gap-4 p-6 md:p-9 lg:border-r border-[#5A5228]/8"
          style={{
            // DS Cream Light glow + neutral white→cream surface
            background:
              "radial-gradient(circle at 0% 0%, rgba(238,224,196,0.45), transparent 55%)," +
              "linear-gradient(180deg, #FFFFFF 0%, #F5ECD7 100%)",
          }}
        >
          <span className="inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C07828] text-white text-[10px] font-black uppercase tracking-[0.22em] shadow-[0_6px_14px_-6px_rgba(192,120,40,0.6)]">
            <MapPin size={12} strokeWidth={2.6} />
            Ajuda a mapear
          </span>

          <h3
            id="quero-bang-bang-title"
            // DS H1 → Bebas Neue display
            className="uppercase text-[#2C1505] text-4xl md:text-5xl leading-[1.05]"
            style={{
              fontFamily: "var(--font-display-var)",
              fontWeight: 400,
              letterSpacing: "0.03em",
            }}
          >
            Quero Bang Bang
            <br />
            <span className="text-[#C07828]">na minha cidade</span>.
          </h3>

          <p
            className="text-[#5A5228]/85 leading-relaxed text-[15px]"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 400, lineHeight: 1.7 }}
          >
            Joga teu CEP — quando abrir PDV aí, a gente te avisa.
          </p>

          {highlighted && (
            <div className="rounded-xl bg-[#C07828]/10 border border-[#C07828]/30 text-[#A06230] px-3.5 py-2.5 text-sm font-semibold leading-snug">
              Sua busca não achou PDV. Deixa teus dados que a gente te avisa
              quando chegar.
            </div>
          )}

          {!mobileExpanded && (
            <button
              type="button"
              onClick={revealMobileForm}
              aria-expanded={false}
              aria-controls="wishlist-form-panel"
              className={cn(
                "lg:hidden mt-2 inline-flex w-full items-center justify-center gap-2 h-14 px-6 rounded-xl",
                "bg-[#C07828] text-white font-black text-[13px] uppercase tracking-[0.16em]",
                "shadow-[0_16px_40px_-10px_rgba(192,120,40,0.55)]",
                "hover:bg-[#A06230] active:translate-y-0 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07828] focus-visible:ring-offset-2",
              )}
            >
              Quero Bang Bang na minha cidade
              <ArrowRight size={16} strokeWidth={2.6} />
            </button>
          )}
        </div>

        {/* Right — form. 3 fields only: nome, whatsapp, CEP. CEP auto-fills
            cidade/UF in hidden state for backend storage. */}
        <form
          id="wishlist-form-panel"
          action={formAction}
          className={cn(
            "flex-col gap-4 p-6 md:p-9 bg-[#EEE0C4]",
            mobileExpanded ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-black tracking-[0.22em] uppercase text-[#5A5228]/55">
              Cadastro · &lt;30s
            </span>
          </div>

          {state.error && (
            <div
              role="alert"
              className="rounded-xl px-4 py-3 text-sm bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B]"
            >
              {state.error}
            </div>
          )}

          {/* Hidden — cidade/uf populated silently from ViaCEP for analytics */}
          <input type="hidden" name="cep" value={form.cep.replace(/\D/g, "")} />
          <input type="hidden" name="cidade" value={form.cidade} />
          <input type="hidden" name="uf" value={form.uf} />

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

          <Field
            id="wl-cep"
            label="CEP"
            icon={<MapPin size={13} strokeWidth={2.4} />}
            hint={
              cepLoading
                ? "Consultando…"
                : cepError ?? "8 dígitos pra geolocalização"
            }
            hintTone={cepError ? "error" : undefined}
          >
            <div className="relative">
              <input
                id="wl-cep"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                required
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C07828] animate-spin"
                />
              )}
            </div>
          </Field>

          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className={cn(
              "mt-3 inline-flex items-center justify-center gap-2 h-11 rounded-lg text-[12px] font-black uppercase tracking-[0.18em] transition-all",
              "bg-[#C07828] text-white shadow-[0_10px_24px_-10px_rgba(192,120,40,0.55)]",
              "hover:bg-[#A06230] hover:-translate-y-0.5 active:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07828] focus-visible:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
            )}
          >
            <MessageCircle size={14} strokeWidth={2.6} />
            {isPending ? "Enviando…" : "Quero Bang Bang aqui"}
          </button>

          <p className="text-[11px] text-[#5A5228]/50 text-center">
            A gente só usa pra te avisar quando abrir PDV na sua região.
          </p>
        </form>
      </div>
    </section>
  )
}

// ----------------- small helpers -----------------

const inputCls =
  "w-full h-11 px-3.5 rounded-xl border border-[#5A5228]/15 bg-white text-[#2C1505] text-sm placeholder:text-[#5A5228]/40 focus:border-[#C07828] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C07828]/40 transition-colors"

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
        className="text-[10px] font-black tracking-[0.22em] uppercase text-[#5A5228]/60 flex items-center gap-1.5"
      >
        {icon && <span className="text-[#C07828]">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && (
        <p
          className={cn(
            "text-[11px]",
            hintTone === "error"
              ? "text-[#D32F2F] font-semibold"
              : "text-[#5A5228]/50",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  )
}
