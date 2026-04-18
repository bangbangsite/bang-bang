"use client"

import { useState, useEffect, type FormEvent } from "react"
import { MessageCircle, Briefcase, PartyPopper, RotateCcw, Check, ExternalLink, Link as LinkIcon } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { useContacts, normalizeCustomLink } from "@/lib/contacts/useContacts"
import type { ContactsConfig } from "@/lib/contacts/config"
import { useMobileMenu } from "../mobile-menu-context"

interface CategoryMeta {
  key: "whatsappRevenda" | "whatsappDistribuidor" | "whatsappEventos"
  linkKey: "linkRevenda" | "linkDistribuidor" | "linkEventos"
  label: string
  sublabel: string
  icon: React.ReactNode
  /** Which buttons on the site use this channel — shown to the user for clarity. */
  usedIn: string[]
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: "whatsappRevenda",
    linkKey: "linkRevenda",
    label: "Revenda",
    sublabel: "Bares, restaurantes, mercados, conveniências",
    icon: <MessageCircle size={18} strokeWidth={2.25} />,
    usedIn: [
      "Botão \"Quero revender\" do header",
      "Botão \"Quero revender\" da seção Revenda",
      "Card \"Quero revender\" da seção final",
      "Botão \"Quero revender\" do footer",
    ],
  },
  {
    key: "whatsappDistribuidor",
    linkKey: "linkDistribuidor",
    label: "Distribuidor",
    sublabel: "Distribuição regional, exclusividade de território",
    icon: <Briefcase size={18} strokeWidth={2.25} />,
    usedIn: [
      "Botão \"Seja um distribuidor\" do header",
      "Botão \"Seja um distribuidor\" da seção Revenda",
      "Card \"Seja um distribuidor\" da seção final",
    ],
  },
  {
    key: "whatsappEventos",
    linkKey: "linkEventos",
    label: "Eventos",
    sublabel: "Produtores de evento, ativação de marca",
    icon: <PartyPopper size={18} strokeWidth={2.25} />,
    usedIn: [
      "Botão \"Quero Bang Bang no meu evento\" da seção Eventos",
      "Botão \"Sou produtor — quero conversar\" da seção Eventos",
      "Card \"Quero pra um evento\" da seção final",
    ],
  },
]

function formatPhonePreview(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return "—"
  const core = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits
  if (core.length === 11) return `(${core.slice(0, 2)}) ${core.slice(2, 7)}-${core.slice(7)}`
  if (core.length === 10) return `(${core.slice(0, 2)}) ${core.slice(2, 6)}-${core.slice(6)}`
  return digits
}

export default function ContatosPage() {
  const { config, urls, update, reset, hasAnyConfigured } = useContacts()
  const { open: openMobileMenu } = useMobileMenu()

  const [form, setForm] = useState<ContactsConfig>(config)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // Sync local form when config changes externally (another tab) — tracked-key
  // pattern avoids setState-in-effect.
  const extKey = JSON.stringify(config)
  const [trackedKey, setTrackedKey] = useState(extKey)
  if (extKey !== trackedKey) {
    setTrackedKey(extKey)
    setForm(config)
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(config)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    update(form)
    setSavedAt(Date.now())
  }

  const handleReset = () => {
    if (window.confirm("Limpar todos os links? Os CTAs voltam a usar o fallback (scroll pra seção final).")) {
      reset()
      setSavedAt(Date.now())
    }
  }

  useEffect(() => {
    if (savedAt === null) return
    const t = setTimeout(() => setSavedAt(null), 3000)
    return () => clearTimeout(t)
  }, [savedAt])

  const setField = (key: keyof ContactsConfig, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const inputCls =
    "h-11 px-3.5 rounded-xl border border-[#4A2C1A]/15 bg-white text-[#2D1810] text-sm focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"

  return (
    <>
      <DashboardHeader
        title="Contatos"
        subtitle="Um WhatsApp por categoria — usado em todos os CTAs da categoria"
        onMenuOpen={openMobileMenu}
      />

      <div className="px-5 md:px-8 py-6 md:py-8 flex flex-col gap-5">
        {/* Info banner — discreet inline strip */}
        <div className="rounded-xl bg-white border border-[#4A2C1A]/8 px-4 py-3 text-sm flex items-start gap-3">
          <span aria-hidden="true" className="w-2 h-2 mt-2 rounded-full bg-[#E87A1E] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#2D1810] text-[13px]">Como funciona</p>
            <p className="text-[12px] text-[#4A2C1A]/65 mt-0.5 leading-relaxed">
              Cada categoria abaixo tem <strong className="text-[#2D1810] font-semibold">1 WhatsApp</strong>. Quando você preenche, todos os botões daquela
              categoria no site passam a abrir o mesmo link (com mensagem padrão já preenchida).
              Os valores ficam salvos no seu navegador até conectarmos um backend.
            </p>
          </div>
        </div>

        {savedAt !== null && (
          <div className="rounded-xl bg-white border border-[#2E7D32]/30 text-[#1B5E20] px-4 py-2.5 text-sm flex items-center gap-2">
            <Check size={15} strokeWidth={2.4} />
            <span className="font-semibold">Links salvos.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => {
            const value = form[cat.key]
            const linkValue = form[cat.linkKey]
            const linkActive = Boolean(normalizeCustomLink(linkValue))
            const savedUrl = urls[cat.key === "whatsappRevenda" ? "revenda" : cat.key === "whatsappDistribuidor" ? "distribuidor" : "eventos"]
            return (
              <section
                key={cat.key}
                className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6"
              >
                <header className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FAFAF8] text-[#E87A1E] flex items-center justify-center border border-[#4A2C1A]/8">
                      {cat.icon}
                    </div>
                    <div>
                      <h2
                        className="font-black uppercase text-[#1A1A1A] text-base tracking-tight"
                        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                      >
                        {cat.label}
                      </h2>
                      <p className="text-xs text-[#4A2C1A]/60">{cat.sublabel}</p>
                    </div>
                  </div>

                  {/* Test link — opens current saved URL in a new tab */}
                  {savedUrl && (
                    <a
                      href={savedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#E87A1E] hover:text-[#C4650F] uppercase tracking-wider"
                    >
                      Testar <ExternalLink size={12} strokeWidth={2.5} />
                    </a>
                  )}
                </header>

                <div className="flex flex-col gap-4">
                  {/* Phone number */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`fld-${cat.key}`}
                      className={`text-[11px] font-bold tracking-[0.18em] uppercase transition-colors ${linkActive ? "text-[#4A2C1A]/35" : "text-[#4A2C1A]/70"}`}
                    >
                      Número do WhatsApp
                    </label>
                    <input
                      id={`fld-${cat.key}`}
                      type="tel"
                      inputMode="tel"
                      className={`${inputCls} ${linkActive ? "opacity-50" : ""}`}
                      placeholder="(31) 99999-9999"
                      value={value}
                      onChange={(e) => setField(cat.key, e.target.value)}
                      aria-describedby={`help-${cat.key}`}
                    />
                    <p id={`help-${cat.key}`} className="text-[11px] text-[#4A2C1A]/50">
                      {linkActive
                        ? "Ignorado — link customizado abaixo está ativo"
                        : value
                          ? `Vai abrir: ${formatPhonePreview(value)}`
                          : "Vazio = CTAs fazem scroll pra seção final"}
                    </p>
                  </div>

                  {/* Custom link override */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`lnk-${cat.key}`}
                      className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/70 flex items-center gap-1.5"
                    >
                      <LinkIcon size={11} strokeWidth={2.5} />
                      Link customizado
                      <span className="text-[10px] font-semibold normal-case tracking-normal text-[#4A2C1A]/40">
                        (opcional)
                      </span>
                    </label>
                    <input
                      id={`lnk-${cat.key}`}
                      type="url"
                      inputMode="url"
                      className={inputCls}
                      placeholder="https://wa.me/5531999999999?text=..."
                      value={linkValue}
                      onChange={(e) => setField(cat.linkKey, e.target.value)}
                      aria-describedby={`hlp-lnk-${cat.key}`}
                    />
                    <p id={`hlp-lnk-${cat.key}`} className="text-[11px] text-[#4A2C1A]/50">
                      {linkActive
                        ? "Prevalece sobre o número — CTAs vão abrir este link direto."
                        : linkValue
                          ? "Link inválido — use uma URL começando com http(s)://"
                          : "Cole um link pronto (wa.me, api.whatsapp.com, grupo, encurtador)."}
                    </p>
                  </div>
                </div>

                {/* Used-in list — helps the user understand the scope */}
                <details className="mt-4 group">
                  <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.2em] text-[#4A2C1A]/55 hover:text-[#4A2C1A] list-none [&::-webkit-details-marker]:hidden flex items-center gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="transition-transform group-open:rotate-90"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Onde aparece ({cat.usedIn.length})
                  </summary>
                  <ul className="mt-2 pl-5 flex flex-col gap-0.5 text-[11px] text-[#4A2C1A]/60">
                    {cat.usedIn.map((spot, i) => (
                      <li key={i} className="list-disc">{spot}</li>
                    ))}
                  </ul>
                </details>
              </section>
            )
          })}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="submit"
              disabled={!dirty}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#E87A1E] text-white text-[13px] font-semibold hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
            >
              <Check size={15} strokeWidth={2.4} />
              Salvar links
            </button>
            {hasAnyConfigured && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/70 border border-[#4A2C1A]/8 bg-white hover:bg-[#FAFAF8] transition-colors"
              >
                <RotateCcw size={14} strokeWidth={2.2} />
                Resetar tudo
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}
