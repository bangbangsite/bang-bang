"use client"

import { useActionState, useState } from "react"
import { Check, Send, Sparkles, Plus, X, Star, Camera, Music, Video, Radio, Clapperboard, Hash } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { Select, type SelectOption } from "@/components/shared/Select"
import { submitBangerApplication, type SubmitBangerState } from "@/lib/bangers/actions"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

type Niche =
  | "nightlife"
  | "musica"
  | "gastro"
  | "festival"
  | "humor"
  | "lifestyle"
  | "esporte"
  | "moda"
  | "outro"

const NICHE_OPTIONS: SelectOption<Niche>[] = [
  { value: "nightlife", label: "Nightlife / Balada" },
  { value: "musica", label: "Música / DJ" },
  { value: "gastro", label: "Gastronomia / Bar" },
  { value: "festival", label: "Festival / Shows" },
  { value: "humor", label: "Humor / Entretenimento" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "esporte", label: "Esporte / Outdoor" },
  { value: "moda", label: "Moda / Beleza" },
  { value: "outro", label: "Outro" },
]

type PlatformId = "instagram" | "tiktok" | "youtube" | "twitch" | "kwai" | "x" | "outro"

interface PlatformDef {
  id: PlatformId
  label: string
  icon: React.ReactNode
  accent: string
  placeholder: string
}

const PLATFORMS: PlatformDef[] = [
  { id: "instagram", label: "Instagram",   icon: <Camera size={16} strokeWidth={2.4} />,       accent: "#ff3a8a", placeholder: "@seuinsta" },
  { id: "tiktok",    label: "TikTok",      icon: <Music size={16} strokeWidth={2.4} />,        accent: "#d4ff4d", placeholder: "@seutiktok" },
  { id: "youtube",   label: "YouTube",     icon: <Video size={16} strokeWidth={2.4} />,        accent: "#ff7a3a", placeholder: "@seucanal" },
  { id: "twitch",    label: "Twitch",      icon: <Clapperboard size={16} strokeWidth={2.4} />, accent: "#ffd36a", placeholder: "twitch.tv/voce" },
  { id: "kwai",      label: "Kwai",        icon: <Radio size={16} strokeWidth={2.4} />,        accent: "#8ae6ff", placeholder: "@seukwai" },
  { id: "x",         label: "X / Twitter", icon: <Hash size={16} strokeWidth={2.4} />,         accent: "#ffffff", placeholder: "@seux" },
  { id: "outro",     label: "Outra rede",  icon: <Plus size={16} strokeWidth={2.4} />,         accent: "#b3ff4d", placeholder: "nome da rede + @" },
]

interface RedeEntry {
  handle: string
  seguidores: string
}

interface FormFields {
  nome: string
  email: string
  whatsapp: string
  cidade: string
  uf: string
  redesOrdem: PlatformId[]
  redes: Partial<Record<PlatformId, RedeEntry>>
  nicho: Niche
  motivacao: string
  maiorDeIdade: boolean
}

const INITIAL_FIELDS: FormFields = {
  nome: "",
  email: "",
  whatsapp: "",
  cidade: "",
  uf: "",
  redesOrdem: [],
  redes: {},
  nicho: "nightlife",
  motivacao: "",
  maiorDeIdade: false,
}

const INITIAL_STATE: SubmitBangerState = { ok: false }

export function BangerForm() {
  const [state, formAction, pending] = useActionState(submitBangerApplication, INITIAL_STATE)
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS)

  // Build the redes array in order for the hidden input (JSONB payload)
  const redesPayload = fields.redesOrdem
    .map((id) => {
      const entry = fields.redes[id]
      if (!entry) return null
      return { platform: id, handle: entry.handle.trim(), seguidores: entry.seguidores.trim() }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  const update = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const togglePlatform = (id: PlatformId) => {
    setFields((prev) => {
      if (prev.redesOrdem.includes(id)) {
        const nextOrdem = prev.redesOrdem.filter((p) => p !== id)
        const nextRedes = { ...prev.redes }
        delete nextRedes[id]
        return { ...prev, redesOrdem: nextOrdem, redes: nextRedes }
      }
      return {
        ...prev,
        redesOrdem: [...prev.redesOrdem, id],
        redes: { ...prev.redes, [id]: { handle: "", seguidores: "" } },
      }
    })
  }

  const updateRede = (id: PlatformId, field: keyof RedeEntry, value: string) => {
    setFields((prev) => ({
      ...prev,
      redes: {
        ...prev.redes,
        [id]: { ...(prev.redes[id] ?? { handle: "", seguidores: "" }), [field]: value },
      },
    }))
  }

  const setAsPrincipal = (id: PlatformId) => {
    setFields((prev) => {
      if (!prev.redesOrdem.includes(id) || prev.redesOrdem[0] === id) return prev
      const rest = prev.redesOrdem.filter((p) => p !== id)
      return { ...prev, redesOrdem: [id, ...rest] }
    })
  }

  const handleReset = () => {
    setFields(INITIAL_FIELDS)
  }

  if (state.ok) {
    return <SuccessPanel onReset={handleReset} />
  }

  return (
    <section
      id="sou-banger"
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 80% 100%, rgba(212,255,77,0.18), transparent 50%), " +
          "radial-gradient(circle at 10% 10%, rgba(232,122,30,0.2), transparent 50%), " +
          "linear-gradient(180deg, #0a0606 0%, #14080a 50%, #1f0d08 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.15]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <Container className="relative z-10">
        <div className="py-20 md:py-28 grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-12 lg:gap-16 items-start">
          {/* Left — pitch */}
          <div className="lg:sticky lg:top-28">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-[#d4ff4d]/10 text-[#d4ff4d] border border-[#d4ff4d]/30">
              Aplica aí
              <Sparkles size={12} strokeWidth={2.4} />
            </span>
            <h2
              className="mt-5 font-black uppercase leading-[0.9] tracking-[-0.02em]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
              }}
            >
              Bora fazer <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #d4ff4d, #ffd36a 55%, #ff7a3a)",
                }}
              >
                barulho juntos.
              </span>
            </h2>
            <p className="mt-6 text-white/70 text-base md:text-lg leading-relaxed max-w-[40ch]">
              Leva uns 2 minutos. Pede só o essencial. A gente lê tudo e
              responde em até 14 dias. Zero bot, zero template automático.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {[
                "Zero fidelização ou exclusividade",
                "Pagamento por PIX em até 15 dias úteis",
                "Produto, suporte e lista VIP garantidos",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/75">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#d4ff4d" }}
                  >
                    <Check size={12} strokeWidth={3} className="text-[#0a0606]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <form
            action={formAction}
            className="relative rounded-[32px] border border-white/10 bg-black/35 backdrop-blur-md p-6 md:p-10 shadow-[0_40px_120px_-40px_rgba(212,255,77,0.25)]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none"
            >
              <div
                className="absolute -top-16 -right-12 w-72 h-72 rounded-full blur-3xl opacity-35"
                style={{ background: "#d4ff4d" }}
              />
              <div
                className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full blur-3xl opacity-25"
                style={{ background: "#E87A1E" }}
              />
            </div>

            {/* Hidden input carrying the redes JSONB payload */}
            <input type="hidden" name="redes" value={JSON.stringify(redesPayload)} />

            <div className="relative z-10 flex flex-col gap-5">
              {state.error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
                  {state.error}
                </div>
              )}

              {/* Row 1: nome + email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Seu nome" required>
                  <input
                    required
                    name="nome"
                    value={fields.nome}
                    onChange={(e) => update("nome", e.target.value)}
                    placeholder="Ex: Larissa Rocha"
                    className="banger-input"
                  />
                </Field>
                <Field label="E-mail" required>
                  <input
                    required
                    name="email"
                    type="email"
                    value={fields.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="banger-input"
                  />
                </Field>
              </div>

              {/* Row 2: WhatsApp + Cidade/UF */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_90px] gap-4">
                <Field label="WhatsApp" required>
                  <input
                    required
                    name="whatsapp"
                    value={fields.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="banger-input"
                  />
                </Field>
                <Field label="Cidade" required>
                  <input
                    required
                    name="cidade"
                    value={fields.cidade}
                    onChange={(e) => update("cidade", e.target.value)}
                    placeholder="São Paulo"
                    className="banger-input"
                  />
                </Field>
                <Field label="UF" required>
                  <input
                    required
                    name="uf"
                    maxLength={2}
                    value={fields.uf}
                    onChange={(e) => update("uf", e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="banger-input uppercase text-center"
                  />
                </Field>
              </div>

              {/* Section break */}
              <div className="mt-2 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#d4ff4d]">
                  Suas redes
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              {/* Smart platform picker */}
              <PlatformPicker
                fields={fields}
                onToggle={togglePlatform}
                onUpdate={updateRede}
                onSetPrincipal={setAsPrincipal}
              />

              {/* Nicho — hidden input mirrors Select value */}
              <input type="hidden" name="nicho" value={fields.nicho} />
              <Field label="Seu nicho / tipo de conteúdo" required>
                <Select
                  value={fields.nicho}
                  onChange={(v) => update("nicho", v)}
                  options={NICHE_OPTIONS}
                  variant="dark"
                  aria-label="Seu nicho ou tipo de conteúdo"
                />
              </Field>

              {/* Motivação */}
              <Field
                label="Por que você quer ser um Banger?"
                helper="Solta a vibe. A gente lê tudo."
                required
              >
                <textarea
                  required
                  name="motivacao"
                  rows={4}
                  value={fields.motivacao}
                  onChange={(e) => update("motivacao", e.target.value)}
                  placeholder="Conta pra gente o que te conecta com a Bang Bang e como você imagina que rolaria a parceria..."
                  className="banger-input resize-none"
                />
              </Field>

              {/* Idade check */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={fields.maiorDeIdade}
                  onChange={(e) => update("maiorDeIdade", e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#d4ff4d] cursor-pointer"
                />
                <span className="text-[13px] text-white/65 leading-relaxed">
                  Confirmo que tenho <strong className="text-white">18 anos ou mais</strong> e
                  concordo que a Bang Bang entre em contato pelos canais informados.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={fields.redesOrdem.length === 0 || pending}
                className="mt-3 group relative overflow-hidden inline-flex items-center justify-center gap-2.5 w-full h-14 rounded-lg font-black text-sm tracking-[0.15em] uppercase bg-[#d4ff4d] text-[#0a0606] hover:bg-[#b8ea38] transition-all hover:-translate-y-0.5 shadow-[0_20px_40px_-10px_rgba(212,255,77,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0606] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-[#d4ff4d]"
              >
                {pending ? "Enviando…" : "Quero ser Banger"}
                {!pending && (
                  <Send size={14} strokeWidth={2.8} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                )}
              </button>

              <p className="text-[11px] text-white/40 text-center uppercase tracking-[0.2em]">
                {fields.redesOrdem.length === 0
                  ? "Escolhe ao menos uma rede pra aplicar"
                  : "Resposta em até 14 dias úteis · Nada de spam"}
              </p>
            </div>
          </form>
        </div>
      </Container>

      {/* Shared input styles */}
      <style jsx>{`
        :global(.banger-input) {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 14px;
          transition: border-color 150ms ease, background 150ms ease,
            box-shadow 150ms ease;
          font-family: inherit;
        }
        :global(.banger-input::placeholder) {
          color: rgba(255, 255, 255, 0.35);
        }
        :global(.banger-input:hover) {
          border-color: rgba(255, 255, 255, 0.22);
        }
        :global(.banger-input:focus) {
          outline: none;
          border-color: #d4ff4d;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(212, 255, 77, 0.18);
        }
        :global(textarea.banger-input) {
          height: auto;
          padding: 14px;
          line-height: 1.5;
        }
      `}</style>
    </section>
  )
}

function PlatformPicker({
  fields,
  onToggle,
  onUpdate,
  onSetPrincipal,
}: {
  fields: FormFields
  onToggle: (id: PlatformId) => void
  onUpdate: (id: PlatformId, field: keyof RedeEntry, value: string) => void
  onSetPrincipal: (id: PlatformId) => void
}) {
  const principalId = fields.redesOrdem[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Onde você tá? <span className="text-[#d4ff4d]">*</span>
        </span>
        {fields.redesOrdem.length > 0 && (
          <span className="text-[11px] text-white/45 italic">
            {fields.redesOrdem.length}{" "}
            {fields.redesOrdem.length === 1 ? "rede" : "redes"} selecionada
            {fields.redesOrdem.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Chip grid */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => {
          const selected = fields.redesOrdem.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onToggle(p.id)}
              aria-pressed={selected}
              className="group/chip relative inline-flex items-center gap-2 h-10 pl-3.5 pr-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0606]"
              style={
                selected
                  ? {
                      background: `${p.accent}18`,
                      border: `1.5px solid ${p.accent}`,
                      color: p.accent,
                      boxShadow: `0 0 24px -4px ${p.accent}66, inset 0 0 0 1px ${p.accent}22`,
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1.5px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                    }
              }
            >
              <span style={{ color: selected ? p.accent : "rgba(255,255,255,0.55)" }}>
                {selected ? <Check size={14} strokeWidth={2.8} /> : p.icon}
              </span>
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Expanded entries per selected platform */}
      <div className="flex flex-col gap-3">
        {fields.redesOrdem.map((id) => {
          const def = PLATFORMS.find((p) => p.id === id)
          if (!def) return null
          const entry = fields.redes[id] ?? { handle: "", seguidores: "" }
          const isPrincipal = principalId === id

          return (
            <div
              key={id}
              className="relative rounded-2xl border bg-white/[0.03] pl-4 pr-3 py-3 animate-[bangerRedeIn_220ms_ease-out]"
              style={{
                borderColor: `${def.accent}44`,
                boxShadow: isPrincipal ? `inset 0 0 0 1px ${def.accent}33` : undefined,
              }}
            >
              {/* Accent strip */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{
                  background: def.accent,
                  boxShadow: `0 0 12px ${def.accent}88`,
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-[auto_1.4fr_1fr_auto] gap-3 items-center">
                {/* Platform label */}
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: `${def.accent}1a`,
                      color: def.accent,
                      boxShadow: `inset 0 0 0 1px ${def.accent}55`,
                    }}
                  >
                    {def.icon}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className="text-[12px] font-black uppercase tracking-wider"
                      style={{ color: def.accent }}
                    >
                      {def.label}
                    </span>
                    {isPrincipal && (
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/50 flex items-center gap-1">
                        <Star size={8} strokeWidth={3} fill="currentColor" />
                        principal
                      </span>
                    )}
                  </div>
                </div>

                {/* Handle */}
                <input
                  required
                  value={entry.handle}
                  onChange={(e) => onUpdate(id, "handle", e.target.value)}
                  placeholder={def.placeholder}
                  className="banger-input"
                  aria-label={`@ do perfil em ${def.label}`}
                />

                {/* Seguidores */}
                <input
                  required
                  value={entry.seguidores}
                  onChange={(e) => onUpdate(id, "seguidores", e.target.value)}
                  placeholder="Seguidores (ex: 48k)"
                  className="banger-input"
                  aria-label={`Seguidores em ${def.label}`}
                />

                {/* Actions */}
                <div className="flex items-center gap-1 justify-self-end">
                  {!isPrincipal && (
                    <button
                      type="button"
                      onClick={() => onSetPrincipal(id)}
                      aria-label={`Definir ${def.label} como rede principal`}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-white/15 text-white/55 hover:text-[#ffd36a] hover:border-[#ffd36a]/60 transition-colors"
                      title="Tornar principal"
                    >
                      <Star size={13} strokeWidth={2.4} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggle(id)}
                    aria-label={`Remover ${def.label}`}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-white/15 text-white/55 hover:text-[#ff6a6a] hover:border-[#ff6a6a]/60 transition-colors"
                  >
                    <X size={14} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {fields.redesOrdem.length === 0 && (
          <p className="text-[13px] text-white/40 italic">
            Escolhe as redes onde você posta. Cada uma abre um campo pra @ e
            seguidores. A primeira vira sua principal — dá pra mudar depois.
          </p>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  helper,
  required,
  children,
}: {
  label: string
  helper?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-1.5">
        {label}
        {required && <span className="text-[#d4ff4d]">*</span>}
      </span>
      {children}
      {helper && <span className="text-[11px] text-white/40">{helper}</span>}
    </label>
  )
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <section
      id="sou-banger"
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(212,255,77,0.22), transparent 60%), " +
          "linear-gradient(180deg, #0a0606 0%, #14080a 100%)",
      }}
    >
      <Container className="relative z-10">
        <div className="py-24 md:py-32 max-w-2xl mx-auto text-center">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-8"
            style={{
              background: "radial-gradient(circle, rgba(212,255,77,0.3), transparent 70%)",
              boxShadow: "inset 0 0 0 2px rgba(212,255,77,0.6), 0 0 60px -10px rgba(212,255,77,0.6)",
            }}
          >
            <Check size={36} strokeWidth={2.6} className="text-[#d4ff4d]" />
          </div>

          <h2
            className="font-black uppercase leading-[0.95] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-heading-var)",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
            }}
          >
            Recebemos.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #d4ff4d, #ffd36a)",
              }}
            >
              Agora é com a gente.
            </span>
          </h2>
          <p className="mt-6 text-white/75 text-lg leading-relaxed">
            A gente vai ler com carinho e volta em até 14 dias úteis no e-mail
            ou WhatsApp que você deixou. Enquanto isso, solta a lata e bora
            continuar fazendo barulho por aí.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm tracking-widest uppercase text-white border border-white/30 hover:bg-white/10 transition-colors"
          >
            Enviar outra aplicação
          </button>
        </div>
      </Container>
    </section>
  )
}
