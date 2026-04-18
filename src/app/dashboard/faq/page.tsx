"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, RotateCcw, MessageCircleQuestion } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { FAQItemModal } from "@/components/dashboard/FAQItemModal"
import { useFAQ } from "@/lib/faq/useFAQ"
import type { FAQItem } from "@/lib/faq/config"
import { useMobileMenu } from "../mobile-menu-context"

export default function FAQPage() {
  const { items, count, max, canAdd, addItem, updateItem, removeItem, moveUp, moveDown, reset, updatedAt } = useFAQ()
  const { open: openMobileMenu } = useMobileMenu()

  const [editing, setEditing] = useState<FAQItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState<FAQItem | null>(null)

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  // Quick-action deep link from the dashboard home: ?new=1 opens the create modal.
  const autoTriggered = useRef(false)
  useEffect(() => {
    if (autoTriggered.current) return
    autoTriggered.current = true
    const params = new URLSearchParams(window.location.search)
    if (!params.get("new")) return
    const url = new URL(window.location.href)
    url.searchParams.delete("new")
    window.history.replaceState({}, "", url.pathname + (url.search || ""))
    if (canAdd) handleCreate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEdit = (item: FAQItem) => {
    setEditing(item)
    setModalOpen(true)
  }

  const handleSubmit = (patch: { question: string; answer: string }) => {
    if (editing) updateItem(editing.id, patch)
    else addItem(patch)
    setModalOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!confirmingDelete) return
    removeItem(confirmingDelete.id)
    setConfirmingDelete(null)
  }

  const updatedLabel = updatedAt
    ? `Última edição: ${new Date(updatedAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Exibindo perguntas padrão — ainda sem edição"

  return (
    <>
      <DashboardHeader
        title="FAQ"
        subtitle={`${count}/${max} perguntas · ${updatedLabel}`}
        onMenuOpen={openMobileMenu}
        actions={
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canAdd}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#E87A1E] text-white text-[13px] font-semibold hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
            title={canAdd ? "Adicionar nova pergunta" : `Limite de ${max} perguntas atingido`}
          >
            <Plus size={15} strokeWidth={2.4} />
            <span className="hidden sm:inline">Adicionar pergunta</span>
          </button>
        }
      />

      <div className="px-5 md:px-8 py-6 md:py-8 flex flex-col gap-5">
        {/* Info banner — discreet inline strip */}
        <div className="rounded-xl bg-white border border-[#4A2C1A]/8 px-4 py-3 text-sm flex items-start gap-3">
          <span aria-hidden="true" className="w-2 h-2 mt-2 rounded-full bg-[#E87A1E] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#2D1810] text-[13px]">Perguntas que aparecem no site</p>
            <p className="text-[12px] text-[#4A2C1A]/65 mt-0.5 leading-relaxed">
              Até <strong className="text-[#2D1810] font-semibold">{max}</strong> perguntas. A ordem aqui é a ordem que aparece no site.
              Use as setas pra reordenar · edite · remova · adicione — alterações instantâneas.
            </p>
          </div>
        </div>

        {/* Capacity indicator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[#4A2C1A]/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(count / max) * 100}%`,
                background:
                  count === max
                    ? "linear-gradient(90deg, #ffd36a 0%, #E87A1E 60%, #C4650F 100%)"
                    : "linear-gradient(90deg, #ffd36a 0%, #E87A1E 100%)",
              }}
            />
          </div>
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/60 tabular-nums shrink-0">
            {count}/{max}
          </span>
        </div>

        {/* FAQ list */}
        {items.length === 0 ? (
          <div className="rounded-2xl bg-white border border-dashed border-[#4A2C1A]/15 p-10 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
              <MessageCircleQuestion size={24} strokeWidth={2} />
            </div>
            <p
              className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)" }}
            >
              Nenhuma pergunta
            </p>
            <p className="text-sm text-[#4A2C1A]/60 max-w-sm">
              Adicione até {max} perguntas pra aparecerem na seção FAQ do site.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              className="mt-2 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#E87A1E] text-white text-[13px] font-semibold hover:bg-[#C4650F] transition-colors shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
            >
              <Plus size={15} strokeWidth={2.4} />
              Adicionar primeira pergunta
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item, i) => {
              const isFirst = i === 0
              const isLast = i === items.length - 1
              return (
                <li
                  key={item.id}
                  className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 hover:border-[#4A2C1A]/15 transition-colors flex gap-4"
                >
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveUp(item.id)}
                      disabled={isFirst}
                      aria-label="Mover pra cima"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[#4A2C1A]/50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
                    >
                      <ArrowUp size={14} strokeWidth={2.5} />
                    </button>
                    <span className="text-[10px] font-bold text-center tabular-nums text-[#4A2C1A]/40">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveDown(item.id)}
                      disabled={isLast}
                      aria-label="Mover pra baixo"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#2D1810]/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[#4A2C1A]/50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
                    >
                      <ArrowDown size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <h3
                      className="font-black uppercase text-[#1A1A1A] text-base leading-tight tracking-tight"
                      style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                    >
                      {item.question}
                    </h3>
                    <p className="text-sm text-[#4A2C1A]/70 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      aria-label="Editar pergunta"
                      className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/70 hover:text-[#E87A1E] hover:bg-[#E87A1E]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
                    >
                      <Pencil size={14} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(item)}
                      aria-label="Remover pergunta"
                      className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/70 hover:text-[#D32F2F] hover:bg-[#D32F2F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]"
                    >
                      <Trash2 size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Reset to defaults */}
        {updatedAt !== null && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Voltar pra lista padrão? Suas edições serão perdidas.")) {
                  reset()
                }
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-[11px] font-semibold text-[#4A2C1A]/60 hover:text-[#D32F2F] transition-colors"
            >
              <RotateCcw size={12} strokeWidth={2.2} />
              Voltar pra lista padrão
            </button>
          </div>
        )}
      </div>

      {/* key forces fresh form state when switching between add/edit */}
      <FAQItemModal
        key={modalOpen ? (editing?.id ?? "__create__") : "__closed__"}
        initial={editing}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      {confirmingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0A]/40 backdrop-blur-sm"
          onClick={() => setConfirmingDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#4A2C1A]/8 shadow-[0_30px_60px_-20px_rgba(45,24,16,0.35)]"
          >
            <h3
              className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              Remover pergunta?
            </h3>
            <p className="text-sm text-[#4A2C1A]/70 mt-2 line-clamp-3">
              <strong>{confirmingDelete.question}</strong>
            </p>
            <p className="text-xs text-[#4A2C1A]/50 mt-2">
              Você pode voltar pra lista padrão depois com o botão no fim da página.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setConfirmingDelete(null)}
                className="h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/75 hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-10 px-4 rounded-lg text-[13px] font-semibold bg-[#D32F2F] text-white hover:bg-[#B71C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
