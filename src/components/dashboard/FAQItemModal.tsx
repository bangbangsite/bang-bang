"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import type { FAQItem } from "@/lib/faq/config"

interface FAQItemModalProps {
  initial: FAQItem | null
  open: boolean
  onClose: () => void
  onSubmit: (patch: { question: string; answer: string }) => void
}

export function FAQItemModal({ initial, open, onClose, onSubmit }: FAQItemModalProps) {
  const [question, setQuestion] = useState(initial?.question ?? "")
  const [answer, setAnswer] = useState(initial?.answer ?? "")
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = question.trim()
    const a = answer.trim()
    if (!q || !a) return
    onSubmit({ question: q, answer: a })
  }

  const isEdit = initial !== null
  const labelCls = "text-[11px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/70"
  const questionChars = question.length
  const answerChars = answer.length
  const MAX_Q = 140
  const MAX_A = 500

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0A]/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-2xl border border-[#4A2C1A]/8 shadow-[0_30px_60px_-20px_rgba(45,24,16,0.35)] my-8 flex flex-col max-h-[calc(100vh-4rem)]"
      >
        <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#4A2C1A]/8">
          <h2
            className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {isEdit ? "Editar pergunta" : "Adicionar pergunta"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#4A2C1A]/55 hover:text-[#2D1810] hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="faq-q" className={labelCls}>Pergunta *</label>
              <span className={`text-[10px] tabular-nums ${questionChars > MAX_Q ? "text-[#D32F2F]" : "text-[#4A2C1A]/40"}`}>
                {questionChars}/{MAX_Q}
              </span>
            </div>
            <input
              ref={firstFieldRef}
              id="faq-q"
              required
              maxLength={MAX_Q}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Como faço para revender?"
              className="h-11 px-3.5 rounded-xl border border-[#4A2C1A]/15 bg-white text-[#2D1810] text-sm focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="faq-a" className={labelCls}>Resposta *</label>
              <span className={`text-[10px] tabular-nums ${answerChars > MAX_A ? "text-[#D32F2F]" : "text-[#4A2C1A]/40"}`}>
                {answerChars}/{MAX_A}
              </span>
            </div>
            <textarea
              id="faq-a"
              required
              rows={5}
              maxLength={MAX_A}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Resposta direta, 2-3 frases no máximo."
              className="px-3.5 py-2.5 rounded-xl border border-[#4A2C1A]/15 bg-white text-[#2D1810] text-sm focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors resize-none leading-relaxed"
            />
            <p className="text-[11px] text-[#4A2C1A]/50">
              Quebras de linha ficam preservadas no site.
            </p>
          </div>
        </div>

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
            disabled={!question.trim() || !answer.trim()}
            className="h-10 px-4 rounded-lg text-[13px] font-semibold bg-[#E87A1E] text-white hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
          >
            {isEdit ? "Salvar alterações" : "Adicionar"}
          </button>
        </footer>
      </form>
    </div>
  )
}
