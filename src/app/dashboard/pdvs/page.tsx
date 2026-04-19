"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  RotateCcw,
  UserCog,
  SlidersHorizontal,
  X,
  Download,
  Upload,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { PDVFormModal } from "@/components/dashboard/PDVFormModal"
import { ImportPreviewModal } from "@/components/dashboard/ImportPreviewModal"
import { IOLogPanel } from "@/components/dashboard/IOLogPanel"
import { Select, type SelectOption } from "@/components/shared/Select"
import { usePDVs } from "@/lib/pdvs/usePDVs"
import { useIOLog } from "@/lib/pdvs/io-log"
import { importPDVOverridesBatch } from "@/lib/pdvs/actions"
import type { ImportPreview } from "@/lib/pdvs/import"
import { useMobileMenu } from "../mobile-menu-context"
import type { PDV, PDVTipo, Tier, UF } from "@/lib/types/pdv"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

const ALL_TIPOS: PDVTipo[] = [
  "Bar",
  "Restaurante",
  "Casa Noturna",
  "Mercado",
  "Conveniência",
  "Distribuidora",
  "Rooftop",
  "Outros",
]

const ALL_TIERS: Tier[] = ["A", "B", "C"]

export default function PDVsPage() {
  const { pdvs, overrides, addPDV, updatePDV, deletePDV, resetAll, isAdded, isEdited, loading, refresh } = usePDVs()
  const { add: addLogEvent } = useIOLog()
  const { open: openMobileMenu } = useMobileMenu()

  // useTransition keeps the UI responsive while server actions are in-flight.
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState("")
  const [ufFilter, setUfFilter] = useState<"all" | UF>("all")
  const [tipoFilter, setTipoFilter] = useState<"all" | PDVTipo>("all")
  const [tierSelected, setTierSelected] = useState<Set<Tier>>(
    () => new Set(ALL_TIERS),
  )
  const [onlyMine, setOnlyMine] = useState(false)

  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<PDV | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState<PDV | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Build UF options from the live list — sorted by PDV count desc so busiest
  // states are at the top of the dropdown.
  const availableUfs = useMemo(() => {
    const map = new Map<UF, number>()
    for (const p of pdvs) map.set(p.uf, (map.get(p.uf) ?? 0) + 1)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [pdvs])

  // Same idea for tipo — counts show on the option labels for quick scan.
  const tipoCounts = useMemo(() => {
    const map = new Map<PDVTipo, number>()
    for (const p of pdvs) map.set(p.tipo, (map.get(p.tipo) ?? 0) + 1)
    return map
  }, [pdvs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pdvs.filter((p) => {
      if (ufFilter !== "all" && p.uf !== ufFilter) return false
      if (tipoFilter !== "all" && p.tipo !== tipoFilter) return false
      if (!tierSelected.has(p.tier)) return false
      if (onlyMine && !isAdded(p.id) && !isEdited(p.id)) return false
      if (q) {
        const hay = [
          p.nome, p.tipo, p.cidade, p.uf, p.bairro, p.cep, p.endereco,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [pdvs, query, ufFilter, tipoFilter, tierSelected, onlyMine, isAdded, isEdited])

  // Reset page whenever filters shift so the user doesn't land on an empty page.
  const filterKey = `${query}|${ufFilter}|${tipoFilter}|${[...tierSelected].sort().join("")}|${onlyMine}`
  const [trackedFilterKey, setTrackedFilterKey] = useState(filterKey)
  if (filterKey !== trackedFilterKey) {
    setTrackedFilterKey(filterKey)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const activeFilterCount =
    (ufFilter !== "all" ? 1 : 0) +
    (tipoFilter !== "all" ? 1 : 0) +
    (tierSelected.size < ALL_TIERS.length ? 1 : 0) +
    (onlyMine ? 1 : 0) +
    (query.trim() !== "" ? 1 : 0)

  const hasNonSearchFilter = activeFilterCount > (query.trim() !== "" ? 1 : 0)

  const clearFilters = () => {
    setUfFilter("all")
    setTipoFilter("all")
    setTierSelected(new Set(ALL_TIERS))
    setOnlyMine(false)
  }
  const clearAll = () => {
    clearFilters()
    setQuery("")
  }

  const toggleTier = (t: Tier) => {
    setTierSelected((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (pdv: PDV) => {
    setEditing(pdv)
    setModalOpen(true)
  }

  const handleSubmit = (pdv: PDV) => {
    startTransition(async () => {
      if (editing) await updatePDV(editing.id, pdv)
      else await addPDV(pdv)
    })
    setModalOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!confirmingDelete) return
    const pdv = confirmingDelete
    setConfirmingDelete(null)
    startTransition(async () => {
      await deletePDV(pdv.id)
    })
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const { exportPDVsToXLSX, buildExportFilename } = await import("@/lib/pdvs/export")
      const filename = buildExportFilename()
      await exportPDVsToXLSX(pdvs, overrides, filename)
      addLogEvent({
        kind: "export",
        filename,
        summary: `${pdvs.length.toLocaleString("pt-BR")} PDVs exportados`,
      })
    } catch (err) {
      console.error("Falha ao exportar planilha:", err)
      window.alert("Não consegui gerar a planilha agora. Tenta de novo em alguns segundos.")
    } finally {
      setExporting(false)
    }
  }

  const handlePickImport = () => {
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Clear the input so the same file can be picked again later.
    e.target.value = ""
    if (!file) return
    setImportError(null)
    try {
      const { parseXLSX } = await import("@/lib/pdvs/import")
      const existingIds = new Set(pdvs.map((p) => p.id))
      const preview = await parseXLSX(file, existingIds)
      setImportPreview(preview)
      setImportOpen(true)
    } catch (err) {
      console.error("Falha ao ler planilha:", err)
      setImportError(
        err instanceof Error
          ? `Não consegui ler a planilha: ${err.message}`
          : "Não consegui ler a planilha.",
      )
    }
  }

  const handleConfirmImport = () => {
    if (!importPreview) return
    const preview = importPreview
    setImportOpen(false)
    setImportPreview(null)
    startTransition(async () => {
      await importPDVOverridesBatch({
        toAdd: preview.toAdd,
        toUpdate: preview.toUpdate,
      })
      await refresh()
      addLogEvent({
        kind: "import",
        filename: preview.filename,
        summary:
          `${preview.toAdd.length} novos · ` +
          `${preview.toUpdate.length} atualizados · ` +
          `${preview.skipped.length} ignorados`,
      })
    })
  }

  const totalChanges =
    overrides.added.length +
    Object.keys(overrides.edited).length +
    overrides.deletedIds.length

  // Quick-action deep links from the dashboard home: ?new=1 | ?import=1 | ?export=1.
  // Fires once on mount then strips the param so a refresh won't re-trigger.
  const autoTriggered = useRef(false)
  useEffect(() => {
    if (autoTriggered.current) return
    autoTriggered.current = true
    const params = new URLSearchParams(window.location.search)
    const intent = params.get("new")
      ? "new"
      : params.get("import")
        ? "import"
        : params.get("export")
          ? "export"
          : null
    if (!intent) return
    const url = new URL(window.location.href)
    url.searchParams.delete("new")
    url.searchParams.delete("import")
    url.searchParams.delete("export")
    window.history.replaceState({}, "", url.pathname + (url.search || ""))
    if (intent === "new") openCreate()
    else if (intent === "import") handlePickImport()
    else if (intent === "export") handleExport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isBusy = loading || isPending

  return (
    <>
      <DashboardHeader
        title="PDVs"
        subtitle={
          loading
            ? "Carregando…"
            : `${filtered.length.toLocaleString("pt-BR")} ${
                filtered.length === 1 ? "ponto" : "pontos"
              } de venda${activeFilterCount > 0 ? " (filtrados)" : ""}`
        }
        onMenuOpen={openMobileMenu}
        actions={
          <>
            <button
              type="button"
              onClick={handlePickImport}
              disabled={isBusy}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#4A2C1A]/8 bg-white text-[#2D1810] text-[13px] font-semibold hover:bg-[#FAFAF8] hover:border-[#4A2C1A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Importar planilha Excel no formato padrão"
            >
              <Upload size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || pdvs.length === 0 || isBusy}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#4A2C1A]/8 bg-white text-[#2D1810] text-[13px] font-semibold hover:bg-[#FAFAF8] hover:border-[#4A2C1A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={`Baixar ${pdvs.length.toLocaleString("pt-BR")} PDVs como planilha Excel`}
            >
              <Download size={15} strokeWidth={2} />
              <span className="hidden sm:inline">
                {exporting ? "Gerando…" : "Exportar"}
              </span>
            </button>
            <button
              type="button"
              onClick={openCreate}
              disabled={isBusy}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#E87A1E] text-white text-[13px] font-semibold hover:bg-[#C4650F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] focus-visible:ring-offset-2 transition-colors shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={15} strokeWidth={2.4} />
              <span className="hidden sm:inline">Adicionar PDV</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileChosen}
              className="hidden"
              aria-hidden="true"
            />
          </>
        }
      />

      <div className="px-5 md:px-8 py-6 md:py-8 flex flex-col gap-4">
        {importError && (
          <div className="rounded-xl bg-white border border-[#D32F2F]/30 text-[#991B1B] px-4 py-3 text-sm flex items-start justify-between gap-3">
            <p>{importError}</p>
            <button
              type="button"
              onClick={() => setImportError(null)}
              className="shrink-0 text-[#991B1B]/70 hover:text-[#991B1B]"
              aria-label="Fechar aviso"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ============ Row 1: Search ============ */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-xl">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A2C1A]/50"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, cidade, UF, tipo, CEP…"
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#4A2C1A]/15 bg-white text-sm text-[#2D1810] placeholder:text-[#4A2C1A]/40 focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#2D1810]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {totalChanges > 0 && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                if (
                  window.confirm(
                    `Descartar as ${totalChanges} alterações? Isso não afeta a base original.`,
                  )
                ) {
                  startTransition(async () => {
                    await resetAll()
                  })
                }
              }}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-sm font-semibold text-[#4A2C1A]/70 border border-[#4A2C1A]/15 hover:bg-[#2D1810]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} strokeWidth={2.2} />
              Descartar alterações ({totalChanges})
            </button>
          )}
        </div>

        {/* ============ Row 2: Filters ============ */}
        <div className="flex items-center gap-2.5 flex-wrap rounded-2xl border border-[#4A2C1A]/8 bg-white p-2.5 md:p-3">
          <span className="inline-flex items-center gap-2 px-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4A2C1A]/50">
            <SlidersHorizontal size={13} strokeWidth={2.2} />
            Filtros
          </span>

          {/* UF */}
          <Select<"all" | UF>
            id="flt-uf"
            aria-label="Filtrar por estado"
            size="sm"
            value={ufFilter}
            onChange={setUfFilter}
            active={ufFilter !== "all"}
            options={[
              { value: "all", label: "Estado · todos" },
              ...availableUfs.map<SelectOption<"all" | UF>>(([uf, count]) => ({
                value: uf,
                label: uf,
                hint: count.toString(),
              })),
            ]}
          />

          {/* Tipo */}
          <Select<"all" | PDVTipo>
            id="flt-tipo"
            aria-label="Filtrar por tipo"
            size="sm"
            value={tipoFilter}
            onChange={setTipoFilter}
            active={tipoFilter !== "all"}
            options={[
              { value: "all", label: "Tipo · todos" },
              ...ALL_TIPOS.map<SelectOption<"all" | PDVTipo>>((t) => {
                const c = tipoCounts.get(t) ?? 0
                return {
                  value: t,
                  label: t,
                  hint: c.toString(),
                  disabled: c === 0,
                }
              }),
            ]}
          />

          {/* Tier — independent toggles */}
          <div
            role="group"
            aria-label="Tier"
            className="inline-flex items-center h-10 px-1 rounded-xl border border-[#4A2C1A]/15 bg-white gap-0.5"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A2C1A]/50 px-2">
              Tier
            </span>
            {ALL_TIERS.map((t) => {
              const active = tierSelected.has(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTier(t)}
                  aria-pressed={active}
                  className={cn(
                    "w-7 h-7 rounded-md text-xs font-black uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
                    active
                      ? "bg-[#E87A1E] text-white"
                      : "text-[#4A2C1A]/40 hover:text-[#2D1810] hover:bg-[#2D1810]/5",
                  )}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {/* Só meus (novos/editados) */}
          <ToggleChip
            active={onlyMine}
            onToggle={() => setOnlyMine((v) => !v)}
            icon={<UserCog size={13} strokeWidth={2.2} />}
            label="Só meus edits"
          />

          {/* Clear */}
          {hasNonSearchFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold text-[#4A2C1A]/70 hover:bg-[#2D1810]/5 transition-colors ml-auto"
            >
              <X size={13} strokeWidth={2.5} />
              Limpar filtros
            </button>
          )}
        </div>

        {/* ============ Table ============ */}
        <div className="rounded-2xl bg-white border border-[#4A2C1A]/8 overflow-hidden">
          {isBusy && (
            <div className="px-4 py-2 text-xs text-[#4A2C1A]/50 bg-[#FAFAF8] border-b border-[#4A2C1A]/8 text-center">
              {loading ? "Carregando dados…" : "Salvando…"}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-[#FAFAF8] border-b border-[#4A2C1A]/8 text-[10px] tracking-[0.22em] uppercase text-[#4A2C1A]/55">
                  <th className="px-4 py-3 font-bold">Nome</th>
                  <th className="px-4 py-3 font-bold">Tipo</th>
                  <th className="px-4 py-3 font-bold">Cidade / UF</th>
                  <th className="px-4 py-3 font-bold">Tier</th>
                  <th className="px-4 py-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#4A2C1A]/50">
                      <div className="flex flex-col items-center gap-2">
                        <p className="italic">
                          {loading
                            ? "Carregando pontos de venda…"
                            : "Nenhum PDV bate com esses filtros."}
                        </p>
                        {!loading && activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs font-semibold text-[#E87A1E] underline underline-offset-2 hover:text-[#C4650F]"
                          >
                            Limpar tudo
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((pdv) => {
                    const added = isAdded(pdv.id)
                    const edited = !added && isEdited(pdv.id)
                    return (
                      <tr
                        key={pdv.id}
                        className="border-b last:border-0 border-[#4A2C1A]/8 hover:bg-[#FAFAF8] transition-colors"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className="font-black uppercase text-[#2D1810] text-sm leading-tight"
                              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                            >
                              {pdv.nome}
                            </span>
                            <span className="text-[11px] text-[#4A2C1A]/50 font-mono">
                              {pdv.id}
                              {added && (
                                <span className="ml-2 inline-block px-1.5 py-0.5 rounded-full bg-[#E87A1E]/15 text-[#C4650F] text-[9px] font-bold tracking-wider uppercase">
                                  novo
                                </span>
                              )}
                              {edited && (
                                <span className="ml-2 inline-block px-1.5 py-0.5 rounded-full bg-[#ffd36a]/25 text-[#8a5a0a] text-[9px] font-bold tracking-wider uppercase">
                                  editado
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-[#4A2C1A]/80">
                          {pdv.tipo}
                        </td>
                        <td className="px-4 py-3 align-top text-[#4A2C1A]/80">
                          {pdv.cidade}/{pdv.uf}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="inline-block w-6 h-6 rounded-full bg-[#E87A1E]/10 text-[#C4650F] text-[11px] font-black text-center leading-6">
                            {pdv.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="inline-flex items-center gap-1">
                            {pdv.mapsUrl && (
                              <a
                                href={pdv.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/50 hover:text-[#E87A1E] hover:bg-[#E87A1E]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
                                aria-label={`Abrir ${pdv.nome} no Maps`}
                              >
                                <ExternalLink size={14} strokeWidth={2.2} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => openEdit(pdv)}
                              disabled={isBusy}
                              className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/70 hover:text-[#E87A1E] hover:bg-[#E87A1E]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] disabled:opacity-40"
                              aria-label={`Editar ${pdv.nome}`}
                            >
                              <Pencil size={14} strokeWidth={2.2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingDelete(pdv)}
                              disabled={isBusy}
                              className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/70 hover:text-[#D32F2F] hover:bg-[#D32F2F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] disabled:opacity-40"
                              aria-label={`Remover ${pdv.nome}`}
                            >
                              <Trash2 size={14} strokeWidth={2.2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#4A2C1A]/8 text-xs text-[#4A2C1A]/60 bg-[#FAFAF8]">
              <span className="tabular-nums">
                Página {safePage} de {totalPages} · {filtered.length.toLocaleString("pt-BR")}{" "}
                {filtered.length === 1 ? "PDV" : "PDVs"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="h-8 px-3 rounded-md border border-[#4A2C1A]/8 bg-white text-xs font-semibold text-[#2D1810] hover:bg-[#FAFAF8] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="h-8 px-3 rounded-md border border-[#4A2C1A]/8 bg-white text-xs font-semibold text-[#2D1810] hover:bg-[#FAFAF8] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============ History panel (discreet, collapsible) ============ */}
        <IOLogPanel />
      </div>

      <PDVFormModal
        key={modalOpen ? (editing?.id ?? "__create__") : "__closed__"}
        initial={editing}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ImportPreviewModal
        preview={importPreview}
        open={importOpen}
        onClose={() => {
          setImportOpen(false)
          setImportPreview(null)
        }}
        onConfirm={handleConfirmImport}
      />

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
              Remover PDV?
            </h3>
            <p className="text-sm text-[#4A2C1A]/70 mt-2">
              Você está prestes a remover <strong>{confirmingDelete.nome}</strong> ({confirmingDelete.cidade}/{confirmingDelete.uf}). A operação pode ser desfeita em <strong>Descartar alterações</strong>.
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

// -----------------------------------------------------------------------------
// Local component — pill-style toggle used for quick boolean filters.
// -----------------------------------------------------------------------------
function ToggleChip({
  active,
  onToggle,
  icon,
  label,
}: {
  active: boolean
  onToggle: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]",
        active
          ? "bg-[#E87A1E] text-white border border-[#E87A1E]"
          : "border border-[#4A2C1A]/8 text-[#4A2C1A]/70 bg-white hover:bg-[#FAFAF8]",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
