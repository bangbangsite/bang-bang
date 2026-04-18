"use client"

import { useEffect, useRef, useState } from "react"
import { X, Star } from "lucide-react"
import { Select } from "@/components/shared/Select"
import {
  EVENT_CATEGORIAS,
  slugify,
  type BangEvent,
  type EventCategoria,
} from "@/lib/events/config"
import type { UF } from "@/lib/types/pdv"

const UFS: UF[] = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]

interface EventFormModalProps {
  /** null = create mode. Pass an existing event to edit. */
  initial: BangEvent | null
  open: boolean
  onClose: () => void
  onSubmit: (event: BangEvent) => void
}

const EMPTY_EVENT: Omit<BangEvent, "id" | "createdAt" | "slug"> = {
  nome: "",
  categoria: "Festa",
  cidade: "",
  uf: "",
  data: "",
  dataFim: undefined,
  hora: "",
  venue: "",
  teaser: "",
  coverUrl: "",
  ticketUrl: "",
  destaque: false,
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function EventFormModal({ initial, open, onClose, onSubmit }: EventFormModalProps) {
  const [form, setForm] = useState<BangEvent>(() =>
    initial ?? {
      id: "",
      slug: "",
      ...EMPTY_EVENT,
      data: todayISO(),
      createdAt: new Date().toISOString(),
    },
  )
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => firstFieldRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const setField = <K extends keyof BangEvent>(key: K, value: BangEvent[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = form.nome.trim()
    if (!trimmed) return
    const cleaned: BangEvent = {
      ...form,
      nome: trimmed,
      slug: form.slug.trim() || slugify(trimmed),
      cidade: form.cidade.trim(),
      venue: form.venue?.trim() || undefined,
      teaser: form.teaser?.trim() || undefined,
      coverUrl: form.coverUrl?.trim() || undefined,
      ticketUrl: form.ticketUrl?.trim() || undefined,
      hora: form.hora?.trim() || undefined,
      dataFim: form.dataFim?.trim() || undefined,
    }
    onSubmit(cleaned)
  }

  const isEdit = initial !== null
  const labelCls = "text-[11px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/70"
  const inputCls =
    "h-10 px-3 rounded-lg border border-[#4A2C1A]/15 bg-white text-[#2D1810] text-sm focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors disabled:opacity-60"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0A]/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl border border-[#4A2C1A]/8 shadow-[0_30px_60px_-20px_rgba(45,24,16,0.35)] my-8 flex flex-col max-h-[calc(100vh-4rem)]"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#4A2C1A]/8">
          <div>
            <h2
              id="event-modal-title"
              className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              {isEdit ? "Editar evento" : "Novo evento"}
            </h2>
            <p className="text-xs text-[#4A2C1A]/55 mt-0.5">
              Aparece em <span className="font-semibold text-[#2D1810]">/eventos</span> assim que salvar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#4A2C1A]/55 hover:text-[#2D1810] hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
          >
            <X size={18} />
          </button>
        </header>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="ev-nome" className={labelCls}>Nome do evento *</label>
            <input
              ref={firstFieldRef}
              id="ev-nome"
              required
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              placeholder="Ex: Bang Bang Rooftop CWB"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-cat" className={labelCls}>Categoria *</label>
            <Select<EventCategoria>
              id="ev-cat"
              className="w-full block"
              value={form.categoria}
              onChange={(v) => setField("categoria", v)}
              options={EVENT_CATEGORIAS.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-hora" className={labelCls}>Horário</label>
            <input
              id="ev-hora"
              type="time"
              value={form.hora ?? ""}
              onChange={(e) => setField("hora", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-data" className={labelCls}>Data *</label>
            <input
              id="ev-data"
              type="date"
              required
              value={form.data}
              onChange={(e) => setField("data", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-data-fim" className={labelCls}>Data fim (opcional)</label>
            <input
              id="ev-data-fim"
              type="date"
              value={form.dataFim ?? ""}
              onChange={(e) => setField("dataFim", e.target.value || undefined)}
              min={form.data || undefined}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-cidade" className={labelCls}>Cidade *</label>
            <input
              id="ev-cidade"
              required
              value={form.cidade}
              onChange={(e) => setField("cidade", e.target.value)}
              placeholder="São Paulo"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-uf" className={labelCls}>UF</label>
            <Select<UF | "">
              id="ev-uf"
              className="w-full block"
              value={form.uf}
              onChange={(v) => setField("uf", v)}
              options={[
                { value: "", label: "—" },
                ...UFS.map((u) => ({ value: u as UF, label: u })),
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="ev-venue" className={labelCls}>Local / venue</label>
            <input
              id="ev-venue"
              value={form.venue ?? ""}
              onChange={(e) => setField("venue", e.target.value)}
              placeholder="Audio Club, Mineirinho, Praia do Porto da Barra…"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="ev-teaser" className={labelCls}>
              Teaser
              <span className="text-[10px] font-semibold normal-case tracking-normal text-[#4A2C1A]/40 ml-2">
                (frase curta no card · até 90 caracteres)
              </span>
            </label>
            <input
              id="ev-teaser"
              maxLength={120}
              value={form.teaser ?? ""}
              onChange={(e) => setField("teaser", e.target.value)}
              placeholder="Sunset, lata gelada e a cidade aos seus pés."
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="ev-cover" className={labelCls}>URL da imagem de capa (opcional)</label>
            <input
              id="ev-cover"
              type="url"
              value={form.coverUrl ?? ""}
              onChange={(e) => setField("coverUrl", e.target.value)}
              placeholder="https://…/cover.jpg"
              className={inputCls}
            />
            <p className="text-[11px] text-[#4A2C1A]/50">
              Sem capa? Sem stress — o card usa um placeholder gerado.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="ev-ticket" className={labelCls}>URL de ingresso (opcional)</label>
            <input
              id="ev-ticket"
              type="url"
              value={form.ticketUrl ?? ""}
              onChange={(e) => setField("ticketUrl", e.target.value)}
              placeholder="https://www.sympla.com.br/…"
              className={inputCls}
            />
            <p className="text-[11px] text-[#4A2C1A]/50">
              Quando preenchido, o card mostra o botão &quot;Comprar ingresso&quot;.
            </p>
          </div>

          {/* Destaque toggle — featured tag on cards */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setField("destaque", !form.destaque)}
              aria-pressed={Boolean(form.destaque)}
              className={
                form.destaque
                  ? "w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#E87A1E]/40 bg-[#E87A1E]/8 text-[#C4650F] transition-colors"
                  : "w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#4A2C1A]/10 bg-white text-[#4A2C1A]/75 hover:bg-[#FAFAF8] transition-colors"
              }
            >
              <span className="flex items-center gap-2.5">
                <Star
                  size={16}
                  strokeWidth={2.4}
                  className={form.destaque ? "text-[#E87A1E] fill-[#E87A1E]" : "text-[#4A2C1A]/45"}
                />
                <span className="text-[13px] font-semibold">
                  Marcar como destaque
                </span>
              </span>
              <span className="text-[11px] text-[#4A2C1A]/55">
                Aparece com selo &quot;Destaque&quot; no card
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#4A2C1A]/8 bg-[#FAFAF8] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/75 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-10 px-4 rounded-lg text-[13px] font-semibold bg-[#E87A1E] text-white hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
          >
            {isEdit ? "Salvar alterações" : "Criar evento"}
          </button>
        </footer>
      </form>
    </div>
  )
}
