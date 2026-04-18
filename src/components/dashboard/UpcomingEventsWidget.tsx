"use client"

import Link from "next/link"
import { CalendarDays, ArrowUpRight, MapPin, PartyPopper, Star, Ticket } from "lucide-react"
import { useEvents } from "@/lib/events/useEvents"
import type { BangEvent, EventCategoria } from "@/lib/events/config"

const MONTH_ABBR = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
]

const CATEGORIA_COLOR: Record<EventCategoria, string> = {
  Festa: "#D12B72",
  Show: "#7EB619",
  Festival: "#E87A1E",
  Rooftop: "#C4650F",
  Ativação: "#2E8AB0",
}

function parseISOLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

function dayMonth(iso: string): { day: string; month: string } {
  const d = parseISOLocal(iso)
  return { day: `${d.getDate()}`, month: MONTH_ABBR[d.getMonth()] }
}

function daysFromNow(iso: string): number {
  const target = parseISOLocal(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const ms = target.getTime() - today.getTime()
  return Math.round(ms / 86_400_000)
}

function relativeLabel(iso: string): string {
  const days = daysFromNow(iso)
  if (days === 0) return "Hoje"
  if (days === 1) return "Amanhã"
  if (days <= 7) return `Em ${days} dias`
  if (days <= 30) return `Em ${days} dias`
  const weeks = Math.round(days / 7)
  return `Em ${weeks} ${weeks === 1 ? "semana" : "semanas"}`
}

/**
 * Compact widget shown on the dashboard home — next 4 upcoming events. Drives
 * the staff's "what's coming up?" reflex without needing them to click into
 * /dashboard/eventos every time.
 */
export function UpcomingEventsWidget() {
  const { upcoming } = useEvents()
  const next4 = upcoming.slice(0, 4)

  return (
    <section
      aria-labelledby="upcoming-events-title"
      className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6 flex flex-col"
    >
      <header className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.22em] uppercase text-[#E87A1E] mb-1.5">
            <CalendarDays size={12} strokeWidth={2.5} />
            Próximos eventos
          </div>
          <h2
            id="upcoming-events-title"
            className="font-black uppercase text-[#1A1A1A] text-lg md:text-xl tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            O que tá vindo
          </h2>
          <p className="text-[11px] text-[#4A2C1A]/55 mt-1">
            Próximos {next4.length} eventos confirmados na agenda
          </p>
        </div>
        <Link
          href="/dashboard/eventos"
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#E87A1E] hover:text-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] rounded"
        >
          Gerenciar
          <ArrowUpRight size={12} strokeWidth={2.5} />
        </Link>
      </header>

      {next4.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
            <PartyPopper size={16} strokeWidth={2.2} />
          </div>
          <p className="text-sm font-semibold text-[#4A2C1A]/70">
            Nenhum evento na agenda
          </p>
          <p className="text-xs text-[#4A2C1A]/50 max-w-xs leading-relaxed">
            Cria o primeiro em <strong>Eventos</strong> pra ele aparecer aqui e em /eventos.
          </p>
          <Link
            href="/dashboard/eventos?new=1"
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E87A1E] hover:text-[#C4650F]"
          >
            Criar evento
            <ArrowUpRight size={11} strokeWidth={2.6} />
          </Link>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {next4.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ol>
      )}
    </section>
  )
}

function EventRow({ event }: { event: BangEvent }) {
  const { day, month } = dayMonth(event.data)
  const color = CATEGORIA_COLOR[event.categoria]

  return (
    <li className="relative flex items-center gap-3 p-2.5 rounded-xl bg-[#FAFAF8] border border-[#4A2C1A]/8 hover:border-[#4A2C1A]/15 transition-colors">
      {/* Avatar — date tile padronizado com o resto da dashboard:
          círculo laranja sólido, dia/mês em branco. A cor da categoria
          continua visível no label do body (badge da categoria). */}
      <div className="w-12 h-12 rounded-full shrink-0 flex flex-col items-center justify-center text-white bg-[#E87A1E]">
        <span
          className="text-[14px] font-black leading-none tabular-nums"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {day}
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.18em] mt-0.5 opacity-95">
          {month}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span
            className="text-[9px] font-black uppercase tracking-[0.2em]"
            style={{ color }}
          >
            {event.categoria}
          </span>
          {event.destaque && (
            <Star
              size={10}
              strokeWidth={2.4}
              className="text-[#E87A1E] fill-[#E87A1E]"
              aria-label="Destaque"
            />
          )}
        </div>
        <h3
          className="font-black uppercase text-[#1A1A1A] text-[13px] leading-tight tracking-tight line-clamp-1"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {event.nome}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-[#4A2C1A]/65 min-w-0 mt-0.5">
          <MapPin size={9} strokeWidth={2.5} className="text-[#E87A1E] shrink-0" />
          <span className="truncate">
            {event.cidade}
            {event.uf && `/${event.uf}`}
          </span>
        </div>
      </div>

      {/* Right meta — relative time + ticket icon */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#4A2C1A]/55 tabular-nums">
          {relativeLabel(event.data)}
        </span>
        {event.ticketUrl && (
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded text-[#E87A1E]"
            title="Ingresso à venda"
          >
            <Ticket size={11} strokeWidth={2.4} />
          </span>
        )}
      </div>
    </li>
  )
}

