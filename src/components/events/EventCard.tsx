"use client"

import Image from "next/image"
import { MapPin, Ticket } from "lucide-react"
import type { BangEvent } from "@/lib/events/config"
import { EventCoverPlaceholder } from "./EventCoverPlaceholder"

interface EventCardProps {
  event: BangEvent
}

const MONTH_ABBR = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
]

function parseISOLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function formatDateCompact(event: BangEvent): { day: string; month: string } {
  const start = parseISOLocal(event.data)
  return {
    day: `${start.getDate()}`,
    month: MONTH_ABBR[start.getMonth()].toUpperCase(),
  }
}

function formatDurationHint(event: BangEvent): string | null {
  if (!event.dataFim) return null
  const start = parseISOLocal(event.data)
  const end = parseISOLocal(event.dataFim)
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  return `+${days} ${days === 1 ? "dia" : "dias"}`
}

function formatHora(hora?: string): string {
  if (!hora) return ""
  return hora.replace(/^(\d{1,2}):(\d{2})$/, "$1h$2").replace(/h00$/, "h")
}

export function EventCard({ event }: EventCardProps) {
  const hasCover = Boolean(event.coverUrl && event.coverUrl.trim())
  const cityTag = event.cidade
    ? `${event.cidade}${event.uf ? `, ${event.uf}` : ""}`
    : "Brasil"
  const { day, month } = formatDateCompact(event)
  const durationHint = formatDurationHint(event)

  return (
    <article className="group flex flex-col gap-3 p-3 rounded-2xl bg-white border border-[#4A2C1A]/10 hover:border-[#E87A1E]/40 hover:shadow-[0_16px_36px_-18px_rgba(232,122,30,0.3)] transition-all h-full">
      {/* Cover — inset inside the card (not edge-to-edge) like the reference */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
        {hasCover ? (
          <Image
            src={event.coverUrl!}
            alt={event.nome}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <EventCoverPlaceholder seed={event.id} />
        )}

        {/* Date badge — top-left, compact day/month stack */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-white/95 backdrop-blur-sm shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)] leading-none">
          <span
            className="text-[15px] font-black text-[#2D1810] tabular-nums"
            style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
          >
            {day}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.14em] text-[#E87A1E] mt-0.5">
            {month}
          </span>
        </div>

        {/* Featured ribbon — top right, only when marked. Low-key so it doesn't
            scream louder than the date/city. */}
        {event.destaque && (
          <span className="absolute top-2.5 right-2.5 h-5 px-1.5 inline-flex items-center rounded-full bg-[#E87A1E] text-white text-[8px] font-black uppercase tracking-[0.16em] shadow-[0_4px_10px_-2px_rgba(232,122,30,0.5)]">
            Destaque
          </span>
        )}

        {/* City chip — bottom-right overlay, glass treatment like the reference */}
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 max-w-[calc(100%-1.25rem)] truncate h-7 px-2.5 rounded-full bg-[#2D1810]/75 backdrop-blur-md text-white text-[11px] font-semibold shadow-[0_4px_12px_-4px_rgba(0,0,0,0.35)]">
          <MapPin size={11} strokeWidth={2.5} className="text-[#ffd36a] shrink-0" />
          <span className="truncate">{cityTag}</span>
        </span>
      </div>

      {/* Body — flex-1 so the CTA always sits at the card bottom, equalizing
          card heights inside a grid row. */}
      <div className="flex-1 flex flex-col gap-1.5 px-1 pb-1 min-w-0">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E87A1E]">
          {event.categoria}
        </span>
        <h3
          className="font-black uppercase text-[#1A1A1A] text-[15px] leading-tight tracking-tight line-clamp-2"
          style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
        >
          {event.nome}
        </h3>

        {event.teaser && (
          <p className="text-[12px] text-[#4A2C1A]/65 leading-snug line-clamp-2">
            {event.teaser}
          </p>
        )}

        {/* Meta row — venue on its own line (truncates) so duration/time never
            shove it into a 60% box; secondary row stacks time + duration. */}
        <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-[#4A2C1A]/60 min-w-0">
          {event.venue && (
            <span className="font-semibold text-[#2D1810] truncate">
              {event.venue}
            </span>
          )}
          {(event.hora || durationHint) && (
            <span className="flex items-center gap-1.5">
              {event.hora && <span>{formatHora(event.hora)}</span>}
              {event.hora && durationHint && (
                <span aria-hidden="true" className="text-[#4A2C1A]/30">·</span>
              )}
              {durationHint && (
                <span className="text-[#E87A1E] font-semibold">{durationHint}</span>
              )}
            </span>
          )}
        </div>

        {/* CTA — `mt-auto` pins it to the bottom of the body so cards in the
            same grid row line up regardless of teaser/meta variation. */}
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#E87A1E] text-white text-[10px] font-black uppercase tracking-[0.16em] hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors"
          >
            <Ticket size={11} strokeWidth={2.6} />
            Comprar ingresso
          </a>
        )}
      </div>
    </article>
  )
}
