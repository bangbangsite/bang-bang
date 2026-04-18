"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useOndeComprar } from "./store"
import type { UF } from "@/lib/types/pdv"
import { cn } from "@/lib/utils"

const UF_NAMES: Record<UF, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
}

type Suggestion =
  | { kind: "uf"; uf: UF; label: string; count: number }
  | { kind: "cidade"; cidade: string; uf: UF; count: number; label: string }

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

function isCep(raw: string): boolean {
  return /^\d{8}$/.test(raw.replace(/\D/g, ""))
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

interface BuscaRapidaProps {
  /**
   * When set, a CEP lookup that resolves to a city we don't have PDVs in
   * (or to a UF we don't serve at all) sends the user to this URL with
   * `?cep=XXXXXXXX` instead of filtering locally. Used on the homepage so
   * the deep page takes over the "no results → wishlist form" flow.
   */
  missRedirectTo?: string
  /**
   * When set, any valid 8-digit CEP submitted (Enter or button) skips the
   * local ViaCEP lookup entirely and navigates to `${url}?cep=XXXXXXXX`.
   * Used on the home gateway so the user always lands on /onde-encontrar
   * with the CEP pre-applied — the dedicated page is built to consume it.
   */
  eagerCepRedirectTo?: string
  /** Notifies the parent every time the input value changes (uncontrolled
   * usage). Lets external CTAs read the current text without lifting full
   * state. */
  onInputChange?: (value: string) => void
}

export function BuscaRapida({
  missRedirectTo,
  eagerCepRedirectTo,
  onInputChange,
}: BuscaRapidaProps = {}) {
  const router = useRouter()
  const { activeUfs, cityIndex, filter, setFilter, clearFilter } = useOndeComprar()
  const [input, setInput] = useState(filter.label ?? filter.value ?? "")
  const [debounced, setDebounced] = useState(input)
  const [open, setOpen] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [highlight, setHighlight] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const resultsId = "onde-comprar-suggestions"

  // Debounce input → debounced (200ms)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 200)
    return () => clearTimeout(t)
  }, [input])

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = normalize(debounced)
    if (!q || isCep(debounced)) return []

    const ufHits: Suggestion[] = activeUfs
      .filter(({ uf }) => {
        const name = UF_NAMES[uf]
        return (
          uf.toLowerCase() === q ||
          uf.toLowerCase().startsWith(q) ||
          normalize(name).includes(q)
        )
      })
      .map(({ uf, count }) => ({
        kind: "uf" as const,
        uf,
        count,
        label: `${UF_NAMES[uf]} (${uf})`,
      }))

    const cidadeHits: Suggestion[] = cityIndex
      .filter(({ cidade }) => normalize(cidade).includes(q))
      .slice(0, 8)
      .map(({ cidade, uf, count }) => ({
        kind: "cidade" as const,
        cidade,
        uf,
        count,
        label: `${cidade}/${uf}`,
      }))

    return [...ufHits, ...cidadeHits].slice(0, 10)
  }, [debounced, activeUfs, cityIndex])

  // Reset highlight when list changes
  useEffect(() => {
    setHighlight(0)
  }, [suggestions])

  const applySuggestion = useCallback(
    (s: Suggestion) => {
      if (s.kind === "uf") {
        setFilter({ kind: "uf", value: s.uf, label: s.label })
      } else {
        setFilter({ kind: "cidade", value: s.cidade, label: s.label })
      }
      setInput(s.label)
      setOpen(false)
      setCepError(null)
      onInputChange?.(s.label)
    },
    [setFilter, onInputChange],
  )

  const handleCepSearch = useCallback(
    async (cepDigits: string) => {
      setCepLoading(true)
      setCepError(null)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
        if (!res.ok) throw new Error("network")
        const data: { localidade?: string; uf?: string; erro?: boolean } =
          await res.json()
        if (data.erro) {
          setCepError("CEP não encontrado.")
          return
        }
        const cidade = data.localidade ?? ""
        const uf = (data.uf ?? "").toUpperCase() as UF
        const match = cityIndex.find(
          (c) => c.uf === uf && normalize(c.cidade) === normalize(cidade),
        )
        if (match) {
          setFilter({
            kind: "cidade",
            value: match.cidade,
            label: `${match.cidade}/${match.uf}`,
          })
          setInput(`${match.cidade}/${match.uf}`)
          return
        }

        // No PDV in that city. On the homepage we hand off to /onde-encontrar
        // so the wishlist form takes over (and the full page can explain the
        // empty state properly). Otherwise we keep the CEP filter locally.
        if (missRedirectTo) {
          router.push(`${missRedirectTo}?cep=${cepDigits}`)
          return
        }
        setFilter({
          kind: "cep",
          value: cepDigits,
          label: `${cidade}/${uf} · CEP ${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}`,
        })
        setInput(`${cidade}/${uf}`)
      } catch {
        setCepError("Não consegui consultar o CEP agora. Tenta cidade ou estado.")
      } finally {
        setCepLoading(false)
        setOpen(false)
      }
    },
    [cityIndex, setFilter, missRedirectTo, router],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const digits = input.replace(/\D/g, "")
      if (isCep(input)) {
        // Eager mode (home gateway): hand the CEP off to the deep page
        // immediately, no ViaCEP round-trip. The deep page consumes ?cep=
        // on mount and resolves it there.
        if (eagerCepRedirectTo) {
          router.push(`${eagerCepRedirectTo}?cep=${digits}`)
          return
        }
        handleCepSearch(digits)
        return
      }
      if (suggestions.length > 0) {
        applySuggestion(suggestions[Math.min(highlight, suggestions.length - 1)])
      }
    },
    [input, suggestions, highlight, handleCepSearch, applySuggestion, eagerCepRedirectTo, router],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open || suggestions.length === 0) return
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlight((h) => Math.max(h - 1, 0))
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    },
    [open, suggestions.length],
  )

  const handleClear = useCallback(() => {
    setInput("")
    clearFilter()
    setCepError(null)
    onInputChange?.("")
  }, [clearFilter, onInputChange])

  const activeLabel = filter.kind !== null ? filter.label ?? filter.value : null

  return (
    <div className="flex flex-col gap-3 w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <label htmlFor="onde-comprar-input" className="sr-only">
          Buscar por CEP, cidade ou estado
        </label>

        <div className="relative flex items-center">
          <span className="absolute left-4 text-[#4A2C1A]/50 pointer-events-none">
            <SearchIcon />
          </span>

          <input
            id="onde-comprar-input"
            type="text"
            autoComplete="off"
            inputMode="search"
            aria-autocomplete="list"
            aria-controls={resultsId}
            aria-expanded={open}
            role="combobox"
            value={input}
            placeholder="CEP, cidade ou estado"
            onChange={(e) => {
              setInput(e.target.value)
              setOpen(true)
              setCepError(null)
              onInputChange?.(e.target.value)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            className="w-full h-14 pl-12 pr-12 rounded-xl border-2 border-[#4A2C1A]/15 bg-white text-[#2D1810] placeholder:text-[#4A2C1A]/40 text-base focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"
          />

          {input.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar busca"
              className="absolute right-3 w-8 h-8 flex items-center justify-center rounded-full text-[#4A2C1A]/60 hover:text-[#2D1810] hover:bg-[#4A2C1A]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* Suggestion list */}
        {open && suggestions.length > 0 && (
          <ul
            ref={listRef}
            id={resultsId}
            role="listbox"
            className="absolute z-10 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#4A2C1A]/15 shadow-lg max-h-72 overflow-y-auto"
          >
            {suggestions.map((s, i) => {
              const key = s.kind === "uf" ? `uf-${s.uf}` : `cidade-${s.cidade}-${s.uf}`
              return (
                <li
                  key={key}
                  role="option"
                  aria-selected={i === highlight}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    applySuggestion(s)
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm cursor-pointer",
                    i === highlight
                      ? "bg-[#E87A1E]/10 text-[#2D1810]"
                      : "text-[#4A2C1A]/80",
                  )}
                >
                  <span>
                    <span className="font-semibold">{s.label}</span>
                    {s.kind === "cidade" && (
                      <span className="ml-2 text-xs text-[#4A2C1A]/50">
                        {UF_NAMES[s.uf]}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[#4A2C1A]/50">
                    {s.count} {s.count === 1 ? "PDV" : "PDVs"}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {cepLoading && (
          <p className="mt-2 text-xs text-[#4A2C1A]/60">Consultando CEP…</p>
        )}
        {cepError && (
          <p className="mt-2 text-xs text-[#D32F2F]">{cepError}</p>
        )}
      </form>

      {activeLabel && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#4A2C1A]/60">Filtro ativo:</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E87A1E] text-white font-semibold">
            {activeLabel}
            <button
              type="button"
              onClick={handleClear}
              aria-label="Remover filtro"
              className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30"
            >
              <XIcon />
            </button>
          </span>
        </div>
      )}
    </div>
  )
}
