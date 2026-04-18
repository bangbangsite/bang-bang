"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Select } from "@/components/shared/Select"
import type { PDV, PDVTipo, Tier, UF } from "@/lib/types/pdv"

const TIPOS: PDVTipo[] = [
  "Bar",
  "Restaurante",
  "Casa Noturna",
  "Mercado",
  "Conveniência",
  "Distribuidora",
  "Rooftop",
  "Outros",
]

const TIERS: Tier[] = ["A", "B", "C"]

const UFS: UF[] = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]

interface PDVFormModalProps {
  /** null = create mode. Pass an existing PDV to edit. */
  initial: PDV | null
  open: boolean
  onClose: () => void
  onSubmit: (pdv: PDV) => void
}

const EMPTY_PDV: Omit<PDV, "id"> = {
  nome: "",
  tipo: "Bar",
  tier: "B",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "SP",
  cep: "",
  lat: null,
  lng: null,
  telefone: null,
  horario: null,
  mapsUrl: null,
  deliveryUrl: null,
  representante: null,
  observacoes: null,
  enriched: false,
}

function emptyId(): string {
  // Simple client-side id — "LOCAL-XXXX" to visually mark it as staff-created.
  const n = Math.floor(Math.random() * 90000) + 10000
  return `LOCAL-${n}`
}

export function PDVFormModal({ initial, open, onClose, onSubmit }: PDVFormModalProps) {
  // Form state is seeded from props once via the lazy initializer. The parent
  // resets it by passing a new `key` (pattern recommended by React for "reset
  // state when a prop changes") — no effect-driven setState needed.
  const [form, setForm] = useState<PDV>(() => initial ?? { id: emptyId(), ...EMPTY_PDV })
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

  const setField = <K extends keyof PDV>(key: K, value: PDV[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned: PDV = {
      ...form,
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
      numero: form.numero.trim(),
      complemento: form.complemento.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      cep: form.cep.replace(/\D/g, ""),
      telefone: form.telefone?.trim() || null,
      horario: form.horario?.trim() || null,
      mapsUrl: form.mapsUrl?.trim() || null,
      deliveryUrl: form.deliveryUrl?.trim() || null,
      representante: form.representante?.trim() || null,
      observacoes: form.observacoes?.trim() || null,
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
      aria-labelledby="pdv-modal-title"
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
              id="pdv-modal-title"
              className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              {isEdit ? "Editar PDV" : "Adicionar PDV"}
            </h2>
            <p className="text-xs text-[#4A2C1A]/60 mt-0.5">
              ID: <span className="font-mono">{form.id}</span>
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
            <label htmlFor="f-nome" className={labelCls}>Nome do estabelecimento *</label>
            <input
              ref={firstFieldRef}
              id="f-nome"
              required
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-tipo" className={labelCls}>Tipo *</label>
            <Select<PDVTipo>
              id="f-tipo"
              className="w-full block"
              value={form.tipo}
              onChange={(v) => setField("tipo", v)}
              options={TIPOS.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-tier" className={labelCls}>Tier (completude) *</label>
            <Select<Tier>
              id="f-tier"
              className="w-full block"
              value={form.tier}
              onChange={(v) => setField("tier", v)}
              options={TIERS.map((t) => ({
                value: t,
                label: `${t} — ${t === "A" ? "endereço completo" : t === "B" ? "endereço a confirmar" : "só cidade"}`,
              }))}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="f-endereco" className={labelCls}>Endereço (rua/avenida)</label>
            <input
              id="f-endereco"
              value={form.endereco}
              onChange={(e) => setField("endereco", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-numero" className={labelCls}>Número</label>
            <input
              id="f-numero"
              value={form.numero}
              onChange={(e) => setField("numero", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-complemento" className={labelCls}>Complemento</label>
            <input
              id="f-complemento"
              value={form.complemento}
              onChange={(e) => setField("complemento", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-bairro" className={labelCls}>Bairro</label>
            <input
              id="f-bairro"
              value={form.bairro}
              onChange={(e) => setField("bairro", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-cep" className={labelCls}>CEP</label>
            <input
              id="f-cep"
              value={form.cep}
              onChange={(e) => setField("cep", e.target.value)}
              inputMode="numeric"
              placeholder="00000000"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-cidade" className={labelCls}>Cidade *</label>
            <input
              id="f-cidade"
              required
              value={form.cidade}
              onChange={(e) => setField("cidade", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-uf" className={labelCls}>UF *</label>
            <Select<UF>
              id="f-uf"
              className="w-full block"
              value={form.uf}
              onChange={(v) => setField("uf", v)}
              options={UFS.map((u) => ({ value: u, label: u }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-telefone" className={labelCls}>Telefone</label>
            <input
              id="f-telefone"
              value={form.telefone ?? ""}
              onChange={(e) => setField("telefone", e.target.value || null)}
              placeholder="(00) 00000-0000"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-horario" className={labelCls}>Horário</label>
            <input
              id="f-horario"
              value={form.horario ?? ""}
              onChange={(e) => setField("horario", e.target.value || null)}
              placeholder="Seg-Sex 18h-02h"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="f-maps" className={labelCls}>Link Google Maps</label>
            <input
              id="f-maps"
              type="url"
              value={form.mapsUrl ?? ""}
              onChange={(e) => setField("mapsUrl", e.target.value || null)}
              placeholder="https://maps.google.com/…"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="f-rep" className={labelCls}>Representante responsável</label>
            <input
              id="f-rep"
              value={form.representante ?? ""}
              onChange={(e) => setField("representante", e.target.value || null)}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="f-obs" className={labelCls}>Observações</label>
            <textarea
              id="f-obs"
              value={form.observacoes ?? ""}
              onChange={(e) => setField("observacoes", e.target.value || null)}
              rows={3}
              className="px-3 py-2 rounded-lg border border-[#4A2C1A]/15 bg-white text-[#2D1810] text-sm focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors resize-none"
            />
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
            {isEdit ? "Salvar alterações" : "Adicionar PDV"}
          </button>
        </footer>
      </form>
    </div>
  )
}
