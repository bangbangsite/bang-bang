"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Trash2,
  ExternalLink,
  Download,
  RotateCcw,
  X,
  MapPin,
  Phone,
  TrendingUp,
  Inbox,
  Sparkles,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { Select, type SelectOption } from "@/components/shared/Select"
import { useWishlist } from "@/lib/wishlist/useWishlist"
import { whatsappUrl } from "@/lib/contacts/useContacts"
import { useMobileMenu } from "../mobile-menu-context"
import type { CityRequest } from "@/lib/wishlist/config"
import type { UF } from "@/lib/types/pdv"
import { cn } from "@/lib/utils"

function formatWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (!d) return "—"
  const core = d.startsWith("55") && d.length > 11 ? d.slice(2) : d
  if (core.length === 11) return `(${core.slice(0, 2)}) ${core.slice(2, 7)}-${core.slice(7)}`
  if (core.length === 10) return `(${core.slice(0, 2)}) ${core.slice(2, 6)}-${core.slice(6)}`
  return d
}

function formatCep(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (d.length !== 8) return d || "—"
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function buildCsv(requests: readonly CityRequest[]): string {
  const header = [
    "nome", "whatsapp", "cep", "endereco", "numero", "complemento",
    "bairro", "cidade", "uf", "created_at",
  ]
  const rows = requests.map((r) => [
    r.nome, r.whatsapp, r.cep, r.endereco, r.numero, r.complemento,
    r.bairro, r.cidade, r.uf, r.createdAt,
  ])
  const escape = (v: string) => {
    const s = (v ?? "").toString()
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n")
}

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function SolicitacoesPage() {
  const { requests, total, removeRequest, resetAll, ranking, seedDemo } = useWishlist()
  const { open: openMobileMenu } = useMobileMenu()

  const [query, setQuery] = useState("")
  const [ufFilter, setUfFilter] = useState<"all" | UF>("all")
  const [confirmingDelete, setConfirmingDelete] = useState<CityRequest | null>(null)
  const [viewDetail, setViewDetail] = useState<CityRequest | null>(null)

  // UF options derived from actual data — only show UFs that have at least one request.
  const availableUfs = useMemo(() => {
    const set = new Map<UF, number>()
    for (const r of requests) if (r.uf) set.set(r.uf as UF, (set.get(r.uf as UF) ?? 0) + 1)
    return [...set.entries()].sort((a, b) => b[1] - a[1])
  }, [requests])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return requests.filter((r) => {
      if (ufFilter !== "all" && r.uf !== ufFilter) return false
      if (!q) return true
      const hay = [r.nome, r.whatsapp, r.cidade, r.uf, r.bairro, r.cep, r.endereco]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [requests, query, ufFilter])

  const handleExport = () => {
    if (requests.length === 0) return
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(buildCsv(requests), `bangbang-solicitacoes-${date}.csv`)
  }

  const handleReset = () => {
    if (window.confirm(`Apagar todas as ${total} solicitações? Essa ação não pode ser desfeita.`)) {
      resetAll()
    }
  }

  const handleConfirmDelete = () => {
    if (!confirmingDelete) return
    removeRequest(confirmingDelete.id)
    setConfirmingDelete(null)
  }

  const activeFilterCount = (ufFilter !== "all" ? 1 : 0) + (query.trim() ? 1 : 0)
  const topRanking = ranking.slice(0, 5)

  return (
    <>
      <DashboardHeader
        title="Solicitações"
        subtitle={`${total.toLocaleString("pt-BR")} ${
          total === 1 ? "pedido recebido" : "pedidos recebidos"
        }${activeFilterCount > 0 ? ` · ${filtered.length} filtrados` : ""}`}
        onMenuOpen={openMobileMenu}
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              disabled={requests.length === 0}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#4A2C1A]/8 bg-white text-[#2D1810] text-[13px] font-semibold hover:bg-[#FAFAF8] hover:border-[#4A2C1A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            {total > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-[#D32F2F]/80 border border-[#D32F2F]/20 hover:bg-[#D32F2F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] transition-colors"
              >
                <RotateCcw size={14} strokeWidth={2.2} />
                <span className="hidden sm:inline">Limpar tudo</span>
              </button>
            )}
          </>
        }
      />

      <div className="px-5 md:px-8 py-6 md:py-8 flex flex-col gap-6">
        {/* Top ranking strip — the 5 most-requested cities */}
        {topRanking.length > 0 && (
          <section
            aria-labelledby="ranking-title"
            className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-5 md:p-6"
          >
            <header className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} strokeWidth={2.2} className="text-[#E87A1E]" />
              <h2 id="ranking-title" className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4A2C1A]/55">
                Onde mais querem Bang Bang
              </h2>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {topRanking.map((row, i) => (
                <div
                  key={`${row.cidade}-${row.uf}-${i}`}
                  className="relative rounded-xl bg-[#FAFAF8] border border-[#4A2C1A]/8 p-3.5 overflow-hidden"
                >
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E87A1E] text-white text-[11px] font-black flex items-center justify-center tabular-nums">
                    {i + 1}
                  </span>
                  <div
                    className="font-black uppercase text-[#1A1A1A] text-lg leading-none tracking-tight truncate pr-6"
                    style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                  >
                    {row.cidade}
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/50 mt-1">
                    {row.uf || "—"}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-3 text-[#C4650F]">
                    <span
                      className="font-black text-2xl leading-none tabular-nums"
                      style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                    >
                      {row.count}
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/50">
                      {row.count === 1 ? "voto" : "votos"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters row */}
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
              placeholder="Buscar por nome, WhatsApp, cidade, CEP…"
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#4A2C1A]/15 bg-white text-sm text-[#2D1810] placeholder:text-[#4A2C1A]/40 focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#2D1810]/5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Select<"all" | UF>
            id="flt-uf"
            aria-label="Filtrar por estado"
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

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setUfFilter("all")
                setQuery("")
              }}
              className="inline-flex items-center gap-1.5 h-11 px-3 rounded-xl text-xs font-semibold text-[#4A2C1A]/70 hover:bg-[#2D1810]/5 transition-colors"
            >
              <X size={13} strokeWidth={2.5} />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Table */}
        {requests.length === 0 ? (
          <EmptyPanel onSeed={seedDemo} />
        ) : (
          <div className="rounded-2xl bg-white border border-[#4A2C1A]/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-[#FAFAF8] border-b border-[#4A2C1A]/8 text-[10px] tracking-[0.22em] uppercase text-[#4A2C1A]/55">
                    <th className="px-4 py-3 font-bold">Nome</th>
                    <th className="px-4 py-3 font-bold">WhatsApp</th>
                    <th className="px-4 py-3 font-bold">Cidade / UF</th>
                    <th className="px-4 py-3 font-bold">CEP</th>
                    <th className="px-4 py-3 font-bold">Quando</th>
                    <th className="px-4 py-3 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#4A2C1A]/50 italic">
                        Nenhuma solicitação bate com esses filtros.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const wppUrl = whatsappUrl(r.whatsapp)
                      return (
                        <tr
                          key={r.id}
                          className="border-b last:border-0 border-[#4A2C1A]/8 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                          onClick={() => setViewDetail(r)}
                        >
                          <td className="px-4 py-3 align-top">
                            <span
                              className="font-black uppercase text-[#2D1810] text-sm leading-tight block"
                              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                            >
                              {r.nome}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top text-[#4A2C1A]/80 font-mono text-[13px]">
                            {formatWhatsapp(r.whatsapp)}
                          </td>
                          <td className="px-4 py-3 align-top text-[#4A2C1A]/80">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} strokeWidth={2.2} className="text-[#E87A1E] shrink-0" />
                              <span>
                                {r.cidade || <span className="italic text-[#4A2C1A]/40">—</span>}
                                {r.uf && <span className="text-[#4A2C1A]/50">/{r.uf}</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-[#4A2C1A]/60 font-mono text-[12px]">
                            {formatCep(r.cep)}
                          </td>
                          <td className="px-4 py-3 align-top text-[#4A2C1A]/55 text-[12px]">
                            {formatDate(r.createdAt)}
                          </td>
                          <td className="px-4 py-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              {wppUrl && (
                                <a
                                  href={wppUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 flex items-center justify-center rounded-md text-[#25D366] hover:bg-[#25D366]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                                  aria-label={`Abrir WhatsApp de ${r.nome}`}
                                  title="Abrir WhatsApp"
                                >
                                  <Phone size={14} strokeWidth={2.2} />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => setViewDetail(r)}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/60 hover:text-[#E87A1E] hover:bg-[#E87A1E]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
                                aria-label={`Ver detalhes de ${r.nome}`}
                                title="Ver detalhes"
                              >
                                <ExternalLink size={14} strokeWidth={2.2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDelete(r)}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/60 hover:text-[#D32F2F] hover:bg-[#D32F2F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]"
                                aria-label={`Remover solicitação de ${r.nome}`}
                                title="Remover"
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
          </div>
        )}
      </div>

      {/* Detail modal */}
      {viewDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0A]/40 backdrop-blur-sm"
          onClick={() => setViewDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl p-6 md:p-7 border border-[#4A2C1A]/8 shadow-[0_30px_60px_-20px_rgba(45,24,16,0.35)]"
          >
            <header className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3
                  className="font-black uppercase text-[#1A1A1A] text-xl tracking-tight"
                  style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
                >
                  {viewDetail.nome}
                </h3>
                <p className="text-xs text-[#4A2C1A]/55 mt-0.5">
                  Registrado em {formatDate(viewDetail.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewDetail(null)}
                aria-label="Fechar"
                className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#2D1810]/5"
              >
                <X size={16} />
              </button>
            </header>

            <dl className="grid grid-cols-[100px_1fr] gap-y-2.5 text-sm">
              <Row label="WhatsApp" value={formatWhatsapp(viewDetail.whatsapp)} mono />
              <Row label="CEP" value={formatCep(viewDetail.cep)} mono />
              <Row
                label="Endereço"
                value={
                  [
                    viewDetail.endereco,
                    viewDetail.numero,
                    viewDetail.complemento,
                  ].filter(Boolean).join(", ") || "—"
                }
              />
              <Row label="Bairro" value={viewDetail.bairro || "—"} />
              <Row
                label="Cidade/UF"
                value={
                  viewDetail.cidade
                    ? `${viewDetail.cidade}${viewDetail.uf ? `/${viewDetail.uf}` : ""}`
                    : "—"
                }
              />
            </dl>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#4A2C1A]/8">
              {whatsappUrl(viewDetail.whatsapp) && (
                <a
                  href={whatsappUrl(viewDetail.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#1ea854] transition-colors"
                >
                  <Phone size={14} strokeWidth={2.4} />
                  Chamar no WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(viewDetail)
                  setViewDetail(null)
                }}
                className="h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/70 hover:bg-[#D32F2F]/5 hover:text-[#D32F2F] inline-flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} strokeWidth={2.2} />
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

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
              Remover solicitação?
            </h3>
            <p className="text-sm text-[#4A2C1A]/70 mt-2">
              Você está prestes a remover a solicitação de{" "}
              <strong>{confirmingDelete.nome}</strong>
              {confirmingDelete.cidade ? ` (${confirmingDelete.cidade}/${confirmingDelete.uf})` : ""}.
              Essa ação não pode ser desfeita.
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/50 pt-1">
        {label}
      </dt>
      <dd
        className={cn(
          "text-[#2D1810] text-sm leading-relaxed",
          mono && "font-mono text-[13px]",
        )}
      >
        {value}
      </dd>
    </>
  )
}

function EmptyPanel({ onSeed }: { onSeed: () => void }) {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-[#4A2C1A]/15 p-12 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
        <Inbox size={24} strokeWidth={2} />
      </div>
      <p
        className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        Ainda sem solicitações
      </p>
      <p className="text-sm text-[#4A2C1A]/60 max-w-sm">
        Quando alguém preencher o card &quot;Quero Bang Bang na minha cidade&quot; no site,
        o pedido aparece aqui com nome, WhatsApp e endereço.
      </p>
      <button
        type="button"
        onClick={onSeed}
        className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#E87A1E] text-white text-[13px] font-semibold hover:bg-[#C4650F] transition-colors shadow-[0_8px_18px_-8px_rgba(232,122,30,0.5)]"
      >
        <Sparkles size={14} strokeWidth={2.4} />
        Popular com 10 exemplos
      </button>
      <p className="text-[11px] text-[#4A2C1A]/50">Dados fake pra testar ranking e layout.</p>
    </div>
  )
}
