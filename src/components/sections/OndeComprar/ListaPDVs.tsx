"use client"

import { useMemo, useSyncExternalStore } from "react"
import { useOndeComprar } from "./store"
import { CardPDV } from "./CardPDV"
import { Button } from "@/components/shared/Button"

const VISIBLE_COUNT = 3

// SSR-safe "has the component mounted on the client" flag — lets us defer
// per-session randomization until after hydration so server and client HTML match.
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function ListaPDVs() {
  const { filteredPdvs, filter, clearFilter } = useOndeComprar()
  const mounted = useMounted()

  // Shuffle once per mount + whenever the filter changes (for fair rotation
  // across sessions). Pre-mount render keeps the original order so SSR matches.
  const displayed = useMemo(() => {
    if (!mounted) return filteredPdvs.slice(0, VISIBLE_COUNT)
    return shuffle(filteredPdvs).slice(0, VISIBLE_COUNT)
  }, [filteredPdvs, mounted])

  const total = filteredPdvs.length
  const headerLabel =
    total === 0
      ? "Nenhum PDV encontrado"
      : filter.kind === null
        ? `${total} PDVs ativos`
        : `${total} ${total === 1 ? "PDV encontrado" : "PDVs encontrados"}${
            filter.label ? ` em ${filter.label}` : ""
          }`

  return (
    <section id="onde-comprar-lista" aria-live="polite" className="scroll-mt-24">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
        <h3
          className="font-heading font-black uppercase text-[#2D1810] text-xl md:text-2xl tracking-wide"
          style={{ fontFamily: "var(--font-heading-var)" }}
        >
          {headerLabel}
        </h3>
        {filter.kind !== null && (
          <button
            type="button"
            onClick={clearFilter}
            className="text-sm font-semibold text-[#E87A1E] hover:text-[#C4650F] underline underline-offset-4 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] rounded"
          >
            Ver todos os PDVs
          </button>
        )}
      </header>

      {total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayed.map((pdv) => (
              <CardPDV key={pdv.id} pdv={pdv} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-2">
            <Button variant="outline" size="md" href="/onde-encontrar">
              Ver todos os PDVs
            </Button>
            <p className="text-xs text-[#4A2C1A]/50">
              {total > VISIBLE_COUNT
                ? `${total - VISIBLE_COUNT} PDVs restantes · mapa completo + busca`
                : "Mapa completo + busca por CEP"}
            </p>
          </div>
        </>
      )}
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-12 px-6 rounded-2xl bg-white border border-dashed border-[#4A2C1A]/15">
      <h4
        className="font-heading font-black uppercase text-[#2D1810] text-2xl md:text-3xl leading-tight max-w-lg"
        style={{ fontFamily: "var(--font-heading-var)" }}
      >
        Ainda não tem Bang Bang aqui.
      </h4>
      <p className="text-[#4A2C1A]/70 max-w-md">
        A gente tá expandindo cidade por cidade. Indica a sua cidade — quanto
        mais gente pedir, mais rápido a gente chega aí.
      </p>
      <Button variant="primary" size="lg" href="/onde-encontrar#quero-bang-bang">
        Quero Bang Bang na minha cidade
      </Button>
    </div>
  )
}
