import { MapPin, Truck } from "lucide-react"
import type { PDV } from "@/lib/types/pdv"
import { cn } from "@/lib/utils"

interface CardPDVProps {
  pdv: PDV
  className?: string
}

export function CardPDV({ pdv, className }: CardPDVProps) {
  const hasMaps = Boolean(pdv.mapsUrl)
  const hasDelivery = Boolean(pdv.deliveryUrl)
  const isAddressHidden = pdv.tier === "C"

  return (
    <article
      className={cn(
        "group flex flex-col gap-3 p-4 rounded-2xl bg-white border border-[#4A2C1A]/10 hover:border-[#E87A1E]/40 hover:shadow-[0_16px_36px_-18px_rgba(232,122,30,0.3)] transition-all h-full",
        className,
      )}
    >
      {/* Top — tipo badge + delivery chip */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E87A1E] truncate">
          {pdv.tipo}
        </span>
        {hasDelivery && (
          <a
            href={pdv.deliveryUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.16em] px-2 h-5 rounded-full bg-[#E87A1E]/10 text-[#C4650F] hover:bg-[#E87A1E]/20 transition-colors shrink-0"
            aria-label={`Pedir delivery — ${pdv.nome}`}
          >
            <Truck size={10} strokeWidth={2.6} />
            Delivery
          </a>
        )}
      </div>

      {/* Title */}
      <h3
        className="font-black uppercase text-[#1A1A1A] text-[15px] leading-tight tracking-tight line-clamp-2"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        {pdv.nome}
      </h3>

      {/* Address block */}
      <div className="flex flex-col gap-0.5 text-[12px] text-[#4A2C1A]/65 leading-snug min-w-0">
        {isAddressHidden ? (
          <p className="italic text-[#4A2C1A]/55">Endereço sob consulta</p>
        ) : (
          <p className="truncate">
            {pdv.endereco}
            {pdv.numero ? `, ${pdv.numero}` : ""}
            {pdv.complemento ? ` — ${pdv.complemento}` : ""}
          </p>
        )}
        <p className="truncate">
          {pdv.bairro && (
            <>
              <span>{pdv.bairro}</span>
              <span className="text-[#4A2C1A]/30"> · </span>
            </>
          )}
          <span className="font-semibold text-[#2D1810]">
            {pdv.cidade}
            {pdv.cidade && pdv.uf ? "/" : ""}
            {pdv.uf}
          </span>
        </p>
        {pdv.horario && (
          <p className="text-[11px] text-[#4A2C1A]/55 truncate">{pdv.horario}</p>
        )}
      </div>

      {/* CTA — pinned to the bottom so all cards in a row align (mt-auto). */}
      {hasMaps ? (
        <a
          href={pdv.mapsUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#E87A1E] text-white text-[10px] font-black uppercase tracking-[0.16em] hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors"
          aria-label={`Ver ${pdv.nome} no Google Maps`}
        >
          <MapPin size={11} strokeWidth={2.6} />
          Ver no Maps
        </a>
      ) : (
        <span
          className="mt-auto inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#4A2C1A]/8 text-[#4A2C1A]/55 text-[10px] font-black uppercase tracking-[0.16em] cursor-default"
          aria-disabled="true"
          title="Endereço sem link no Maps"
        >
          <MapPin size={11} strokeWidth={2.6} />
          Endereço sob consulta
        </span>
      )}
    </article>
  )
}
