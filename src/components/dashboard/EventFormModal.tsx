"use client"

import { useEffect, useRef, useActionState, useState } from "react"
import { X, Star } from "lucide-react"
import { Select } from "@/components/shared/Select"
import {
  EVENT_CATEGORIAS,
  type BangEvent,
  type EventCategoria,
} from "@/lib/events/config"
import { createEvent, updateEvent } from "@/lib/events/actions"
import type { EventActionResult } from "@/lib/events/actions"
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
  /** Called after a successful save so the parent can refresh its list. */
  onSaved?: (event: BangEvent) => void
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const INITIAL_STATE: EventActionResult = { ok: false, error: null }

export function EventFormModal({ initial, open, onClose, onSaved }: EventFormModalProps) {
  const isEdit = initial !== null
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Controlled state for the two custom Select components — they need value+onChange.
  // Hidden inputs carry these values into the FormData submitted to the server action.
  const [categoria, setCategoria] = useState<EventCategoria>(initial?.categoria ?? "Festa")
  const [uf, setUf] = useState<UF | "">(initial?.uf ?? "")
  const [destaque, setDestaque] = useState<boolean>(initial?.destaque ?? false)

  // Bind the action to the event id when editing.
  const boundAction = isEdit
    ? updateEvent.bind(null, initial.id)
    : createEvent

  const [state, formAction, isPending] = useActionState<EventActionResult, FormData>(
    boundAction,
    INITIAL_STATE,
  )

  // Close modal + notify parent on success.
  useEffect(() => {
    if (state.ok && state.event) {
      onSaved?.(state.event)
      onClose()
    }
  }, [state, onClose, onSaved])

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
        action={formAction}
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

        {/* Error banner */}
        {state.error && (
          <div
            role="alert"
            className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {state.error}
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="ev-nome" className={labelCls}>Nome do evento *</label>
            <input
              ref={firstFieldRef}
              id="ev-nome"
              name="nome"
              required
              defaultValue={initial?.nome ?? ""}
              placeholder="Ex: Bang Bang Rooftop CWB"
              className={inputCls}
            />
          </div>

          {/* Categoria — custom select + hidden input for FormData */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-cat" className={labelCls}>Categoria *</label>
            <input type="hidden" name="categoria" value={categoria} />
            <Select<EventCategoria>
              id="ev-cat"
              value={categoria}
              onChange={setCategoria}
              options={EVENT_CATEGORIAS.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-hora" className={labelCls}>Horário</label>
            <input
              id="ev-hora"
              name="hora"
              type="time"
              defaultValue={initial?.hora ?? ""}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-data" className={labelCls}>Data *</label>
            <input
              id="ev-data"
              name="data"
              type="date"
              required
              defaultValue={initial?.data ?? todayISO()}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-data-fim" className={labelCls}>Data fim (opcional)</label>
            <input
              id="ev-data-fim"
              name="dataFim"
              type="date"
              defaultValue={initial?.dataFim ?? ""}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-cidade" className={labelCls}>Cidade *</label>
            <input
              id="ev-cidade"
              name="cidade"
              required
              defaultValue={initial?.cidade ?? ""}
              placeholder="São Paulo"
              className={inputCls}
            />
          </div>

          {/* UF — custom select + hidden input for FormData */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-uf" className={labelCls}>UF</label>
            <input type="hidden" name="uf" value={uf} />
            <Select<UF | "">
              id="ev-uf"
              value={uf}
              onChange={setUf}
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
              name="venue"
              defaultValue={initial?.venue ?? ""}
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
              name="teaser"
              maxLength={120}
              defaultValue={initial?.teaser ?? ""}
              placeholder="Sunset, lata gelada e a cidade aos seus pés."
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="ev-cover" className={labelCls}>URL da imagem de capa (opcional)</label>
            <input
              id="ev-cover"
              name="coverUrl"
              type="url"
              defaultValue={initial?.coverUrl ?? ""}
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
              name="ticketUrl"
              type="url"
              defaultValue={initial?.ticketUrl ?? ""}
              placeholder="https://www.sympla.com.br/…"
              className={inputCls}
            />
            <p className="text-[11px] text-[#4A2C1A]/50">
              Quando preenchido, o card mostra o botão &quot;Comprar ingresso&quot;.
            </p>
          </div>

          {/* Destaque toggle — controlled, synced to a hidden input for FormData */}
          <div className="md:col-span-2">
            <input type="hidden" name="destaque" value={String(destaque)} />
            <button
              type="button"
              onClick={() => setDestaque((v) => !v)}
              aria-pressed={destaque}
              className={
                destaque
                  ? "w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#E87A1E]/40 bg-[#E87A1E]/8 text-[#C4650F] transition-colors"
                  : "w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#4A2C1A]/10 bg-white text-[#4A2C1A]/75 hover:bg-[#FAFAF8] transition-colors"
              }
            >
              <span className="flex items-center gap-2.5">
                <Star
                  size={16}
                  strokeWidth={2.4}
                  className={destaque ? "text-[#E87A1E] fill-[#E87A1E]" : "text-[#4A2C1A]/45"}
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
            disabled={isPending}
            className="h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/75 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-4 rounded-lg text-[13px] font-semibold bg-[#E87A1E] text-white hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)] disabled:opacity-70"
          >
            {isPending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar evento"}
          </button>
        </footer>
      </form>
    </div>
  )
}
