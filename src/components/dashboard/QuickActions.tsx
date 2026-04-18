"use client"

import Link from "next/link"
import { Plus, Upload, Download, MessageCircleQuestion, MessageCircle } from "lucide-react"

interface QuickAction {
  href: string
  label: string
  hint: string
  icon: React.ReactNode
  /** When true, uses filled/primary style. One featured action keeps the row anchored. */
  featured?: boolean
}

const ACTIONS: QuickAction[] = [
  {
    href: "/dashboard/pdvs?new=1",
    label: "Novo PDV",
    hint: "Abrir cadastro direto",
    icon: <Plus size={18} strokeWidth={2.5} />,
    featured: true,
  },
  {
    href: "/dashboard/pdvs?import=1",
    label: "Importar planilha",
    hint: "Subir XLSX de PDVs",
    icon: <Upload size={18} strokeWidth={2.25} />,
  },
  {
    href: "/dashboard/pdvs?export=1",
    label: "Exportar planilha",
    hint: "Baixar base atual",
    icon: <Download size={18} strokeWidth={2.25} />,
  },
  {
    href: "/dashboard/faq?new=1",
    label: "Nova pergunta FAQ",
    hint: "Adicionar pergunta na home",
    icon: <MessageCircleQuestion size={18} strokeWidth={2.25} />,
  },
  {
    href: "/dashboard/contatos",
    label: "Configurar WhatsApp",
    hint: "Links dos CTAs do site",
    icon: <MessageCircle size={18} strokeWidth={2.25} />,
  },
]

export function QuickActions() {
  return (
    <section
      aria-label="Atalhos rápidos"
      className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-4 md:p-5"
    >
      <header className="flex items-center justify-between mb-3.5">
        <h2 className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4A2C1A]/55">
          Atalhos rápidos
        </h2>
      </header>

      {/* Featured action takes 2 cols on sm+ so "Novo PDV" reads as the
          primary jump. Secondary actions share the remaining tracks. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={
              action.featured
                ? "group col-span-2 flex flex-col gap-1.5 rounded-xl p-4 md:p-5 bg-[#E87A1E] text-white hover:bg-[#C4650F] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-all duration-200 shadow-[0_12px_28px_-12px_rgba(232,122,30,0.55)]"
                : "group flex flex-col gap-1 rounded-xl p-3.5 bg-[#FAFAF8] border border-[#4A2C1A]/8 text-[#2D1810] hover:bg-white hover:border-[#E87A1E]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] transition-colors"
            }
          >
            <div
              className={
                action.featured
                  ? "w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center"
                  : "w-9 h-9 rounded-lg bg-white text-[#E87A1E] flex items-center justify-center border border-[#4A2C1A]/8 group-hover:border-[#E87A1E]/30"
              }
            >
              {action.icon}
            </div>
            <span
              className={
                action.featured
                  ? "text-[15px] md:text-[16px] font-black uppercase tracking-tight mt-1.5 leading-tight"
                  : "text-[13px] font-semibold tracking-tight mt-1 leading-tight"
              }
              style={
                action.featured
                  ? { fontFamily: "var(--font-heading-var)", fontWeight: 700 }
                  : undefined
              }
            >
              {action.label}
            </span>
            <span
              className={
                action.featured
                  ? "text-[12px] text-white/85 leading-tight"
                  : "text-[11px] text-[#4A2C1A]/55 leading-tight"
              }
            >
              {action.hint}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
