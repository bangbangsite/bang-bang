"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Search,
  X,
  Star,
  Users,
  Phone,
  Download,
  MoreHorizontal,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { BangerDetailModal } from "@/components/dashboard/BangerDetailModal"
import { Select, type SelectOption } from "@/components/shared/Select"
import {
  updateBangerStatus,
  toggleBangerFavorito,
  updateBangerNotas,
  deleteBanger,
} from "@/lib/bangers/actions"
import {
  BANGER_NICHE_LABEL,
  BANGER_NICHES,
  BANGER_STATUS_LABEL,
  BANGER_STATUSES,
  formatFollowers,
  parseFollowers,
  type BangerApplication,
  type BangerNiche,
  type BangerStatus,
} from "@/lib/bangers/config"
import { useMobileMenu } from "../mobile-menu-context"
import { cn } from "@/lib/utils"

const STATUS_DOT: Record<BangerStatus, string> = {
  novo:        "#E87A1E",
  em_conversa: "#F5A623",
  aprovado:    "#2E7D32",
  parceiro:    "#9C7428",
  rejeitado:   "#4A2C1A99",
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "agora"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  const days = Math.floor(diff / 86_400_000)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  return `${months}mês${months > 1 ? "es" : ""}`
}

function formatWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (!d) return "—"
  const core = d.startsWith("55") && d.length > 11 ? d.slice(2) : d
  if (core.length === 11) return `(${core.slice(0, 2)}) ${core.slice(2, 7)}-${core.slice(7)}`
  if (core.length === 10) return `(${core.slice(0, 2)}) ${core.slice(2, 6)}-${core.slice(6)}`
  return raw
}

function buildCsv(apps: readonly BangerApplication[]): string {
  const header = [
    "id", "nome", "email", "whatsapp", "cidade", "uf", "nicho",
    "status", "favorito", "redes", "alcance_total", "criado_em", "atualizado_em",
  ]
  const rows = apps.map((a) => [
    a.id,
    a.nome,
    a.email,
    a.whatsapp,
    a.cidade,
    a.uf,
    BANGER_NICHE_LABEL[a.nicho],
    BANGER_STATUS_LABEL[a.status],
    a.favorito ? "sim" : "",
    a.redes.map((r) => `${r.platform}:${r.handle} (${r.seguidores})`).join(" | "),
    String(a.redes.reduce((sum, r) => sum + parseFollowers(r.seguidores), 0)),
    a.createdAt,
    a.updatedAt ?? "",
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

interface BangersManagerProps {
  initialApplications: BangerApplication[]
}

export function BangersManager({ initialApplications }: BangersManagerProps) {
  // Local optimistic state — mutations call server actions then revalidatePath
  // refreshes the Server Component above, which re-passes updated props.
  const [applications, setApplications] = useState(initialApplications)
  const [, startTransition] = useTransition()

  const { open: openMobileMenu } = useMobileMenu()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | BangerStatus>("all")
  const [nichoFilter, setNichoFilter] = useState<"all" | BangerNiche>("all")
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [selected, setSelected] = useState<BangerApplication | null>(null)

  const total = applications.length

  const statusCounts = useMemo(() => {
    const m = {} as Record<BangerStatus, number>
    for (const s of BANGER_STATUSES) m[s] = 0
    for (const a of applications) m[a.status] = (m[a.status] ?? 0) + 1
    return m
  }, [applications])

  const nichoCounts = useMemo(() => {
    const m = {} as Record<BangerNiche, number>
    for (const n of BANGER_NICHES) m[n] = 0
    for (const a of applications) m[a.nicho] = (m[a.nicho] ?? 0) + 1
    return m
  }, [applications])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return applications
      .filter((a) => {
        if (statusFilter !== "all" && a.status !== statusFilter) return false
        if (nichoFilter !== "all" && a.nicho !== nichoFilter) return false
        if (onlyFavorites && !a.favorito) return false
        if (!q) return true
        const hay = [a.nome, a.email, a.whatsapp, a.cidade, a.uf, a.motivacao, ...a.redes.map((r) => r.handle)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => {
        if (a.favorito !== b.favorito) return a.favorito ? -1 : 1
        return b.createdAt.localeCompare(a.createdAt)
      })
  }, [applications, query, statusFilter, nichoFilter, onlyFavorites])

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (nichoFilter !== "all" ? 1 : 0) +
    (onlyFavorites ? 1 : 0) +
    (query.trim() ? 1 : 0)

  // ---------------------------------------------------------------------------
  // Handlers — optimistic updates + server action via useTransition
  // ---------------------------------------------------------------------------

  const handleSetStatus = (id: string, status: BangerStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a)),
    )
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status } : s))
    startTransition(() => { void updateBangerStatus(id, status) })
  }

  const handleToggleFavorito = (id: string) => {
    const next = !applications.find((a) => a.id === id)?.favorito
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: next, updatedAt: new Date().toISOString() } : a)),
    )
    if (selected?.id === id) setSelected((s) => (s ? { ...s, favorito: next } : s))
    startTransition(() => { void toggleBangerFavorito(id, next) })
  }

  const handleUpdateNotas = (id: string, notas: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notas, updatedAt: new Date().toISOString() } : a)),
    )
    if (selected?.id === id) setSelected((s) => (s ? { ...s, notas } : s))
    startTransition(() => { void updateBangerNotas(id, notas) })
  }

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id))
    if (selected?.id === id) setSelected(null)
    startTransition(() => { void deleteBanger(id) })
  }

  const handleExport = () => {
    if (filtered.length === 0) return
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(buildCsv(filtered), `bangbang-bangers-${date}.csv`)
  }

  return (
    <>
      <DashboardHeader
        title="Bangers"
        subtitle={`${total.toLocaleString("pt-BR")} ${
          total === 1 ? "candidato" : "candidatos"
        }${activeFilterCount > 0 ? ` · ${filtered.length} filtrados` : ""}`}
        onMenuOpen={openMobileMenu}
        actions={
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#4A2C1A]/8 bg-white text-[#2D1810] text-[13px] font-semibold hover:bg-[#FAFAF8] hover:border-[#4A2C1A]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        }
      />

      <div className="px-5 md:px-8 py-6 md:py-8 flex flex-col gap-5">
        {applications.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Pipeline status strip */}
            <section
              aria-label="Pipeline por status"
              className="rounded-2xl bg-white border border-[#4A2C1A]/8 p-4"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  aria-pressed={statusFilter === "all"}
                  className={cn(
                    "inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-[12px] font-semibold transition-colors",
                    statusFilter === "all"
                      ? "bg-[#FAFAF8] text-[#1A1A1A] shadow-[inset_0_0_0_1px_rgba(74,44,26,0.08)]"
                      : "text-[#4A2C1A]/65 hover:bg-[#FAFAF8] hover:text-[#1A1A1A]",
                  )}
                >
                  Todos
                  <span className="text-[10px] tabular-nums px-1.5 py-px rounded bg-[#4A2C1A]/8 text-[#4A2C1A]/55">
                    {total}
                  </span>
                </button>

                {BANGER_STATUSES.map((s) => {
                  const count = statusCounts[s] ?? 0
                  const isActive = statusFilter === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      aria-pressed={isActive}
                      className={cn(
                        "inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-[12px] font-semibold transition-colors",
                        isActive
                          ? "bg-[#FAFAF8] text-[#1A1A1A] shadow-[inset_0_0_0_1px_rgba(74,44,26,0.08)]"
                          : "text-[#4A2C1A]/65 hover:bg-[#FAFAF8] hover:text-[#1A1A1A]",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_DOT[s] }}
                      />
                      {BANGER_STATUS_LABEL[s]}
                      <span
                        className={cn(
                          "text-[10px] tabular-nums px-1.5 py-px rounded",
                          isActive
                            ? "bg-[#E87A1E]/15 text-[#C4650F]"
                            : "bg-[#4A2C1A]/8 text-[#4A2C1A]/55",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Filters bar */}
            <div className="flex items-center gap-2.5 flex-wrap rounded-2xl border border-[#4A2C1A]/8 bg-white p-2.5 md:p-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A2C1A]/45"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar nome, e-mail, @, cidade…"
                  className="w-full h-9 pl-9 pr-8 rounded-lg border border-[#4A2C1A]/8 bg-white text-[13px] text-[#2D1810] placeholder:text-[#4A2C1A]/40 focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-[#4A2C1A]/50 hover:text-[#2D1810] hover:bg-[#FAFAF8]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <Select<"all" | BangerNiche>
                id="bg-nicho"
                aria-label="Filtrar por nicho"
                size="sm"
                value={nichoFilter}
                onChange={setNichoFilter}
                active={nichoFilter !== "all"}
                options={[
                  { value: "all", label: "Nicho · todos" },
                  ...BANGER_NICHES.map<SelectOption<"all" | BangerNiche>>((n) => ({
                    value: n,
                    label: BANGER_NICHE_LABEL[n],
                    hint: nichoCounts[n]?.toString(),
                    disabled: (nichoCounts[n] ?? 0) === 0,
                  })),
                ]}
              />

              <button
                type="button"
                onClick={() => setOnlyFavorites((v) => !v)}
                aria-pressed={onlyFavorites}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold transition-colors",
                  onlyFavorites
                    ? "bg-[#E87A1E] text-white border border-[#E87A1E]"
                    : "bg-white text-[#4A2C1A]/70 border border-[#4A2C1A]/8 hover:bg-[#FAFAF8]",
                )}
              >
                <Star
                  size={12}
                  strokeWidth={2.4}
                  className={onlyFavorites ? "fill-white" : ""}
                />
                Favoritos
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setStatusFilter("all")
                    setNichoFilter("all")
                    setOnlyFavorites(false)
                  }}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold text-[#4A2C1A]/70 hover:bg-[#FAFAF8] transition-colors ml-auto"
                >
                  <X size={12} strokeWidth={2.5} />
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-[#4A2C1A]/15 p-10 text-center text-[#4A2C1A]/55 text-sm italic">
                Nenhum candidato bate com esses filtros.
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-[#4A2C1A]/8 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-[#FAFAF8] border-b border-[#4A2C1A]/8 text-[10px] tracking-[0.22em] uppercase text-[#4A2C1A]/55">
                        <th className="px-4 py-3 font-bold w-8" aria-label="Favorito" />
                        <th className="px-4 py-3 font-bold">Nome</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold">Nicho</th>
                        <th className="px-4 py-3 font-bold">Cidade</th>
                        <th className="px-4 py-3 font-bold">Alcance</th>
                        <th className="px-4 py-3 font-bold">Inscrito</th>
                        <th className="px-4 py-3 font-bold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a) => {
                        const totalReach = a.redes.reduce(
                          (sum, r) => sum + parseFollowers(r.seguidores),
                          0,
                        )
                        const wppDigits = a.whatsapp.replace(/\D/g, "")
                        const wppUrl = wppDigits
                          ? `https://wa.me/${wppDigits.startsWith("55") ? wppDigits : `55${wppDigits}`}`
                          : ""
                        return (
                          <tr
                            key={a.id}
                            onClick={() => setSelected(a)}
                            className="border-b last:border-0 border-[#4A2C1A]/8 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                          >
                            <td
                              className="px-4 py-3 align-middle"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleFavorito(a.id)}
                                aria-label={a.favorito ? "Tirar dos favoritos" : "Marcar como favorito"}
                                className={cn(
                                  "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                                  a.favorito
                                    ? "text-[#E87A1E] hover:bg-[#E87A1E]/10"
                                    : "text-[#4A2C1A]/30 hover:text-[#E87A1E] hover:bg-[#FAFAF8]",
                                )}
                              >
                                <Star
                                  size={14}
                                  strokeWidth={2.2}
                                  className={a.favorito ? "fill-[#E87A1E]" : ""}
                                />
                              </button>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="flex flex-col">
                                <span
                                  className="font-black uppercase text-[#2D1810] text-sm leading-tight"
                                  style={{
                                    fontFamily: "var(--font-heading-var)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {a.nome}
                                </span>
                                <span className="text-[11px] text-[#4A2C1A]/50 font-mono truncate max-w-[180px]">
                                  {a.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2D1810]">
                                <span
                                  aria-hidden="true"
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    background: STATUS_DOT[a.status],
                                    boxShadow: `0 0 6px ${STATUS_DOT[a.status]}66`,
                                  }}
                                />
                                {BANGER_STATUS_LABEL[a.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-middle text-[12px] text-[#4A2C1A]/75">
                              {BANGER_NICHE_LABEL[a.nicho]}
                            </td>
                            <td className="px-4 py-3 align-middle text-[12px] text-[#4A2C1A]/75">
                              {a.cidade}
                              {a.uf && <span className="text-[#4A2C1A]/45">/{a.uf}</span>}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span className="text-[13px] font-bold text-[#2D1810] tabular-nums">
                                {totalReach > 0 ? formatFollowers(totalReach) : "—"}
                              </span>
                              <span className="text-[10px] text-[#4A2C1A]/45 ml-1">
                                · {a.redes.length} {a.redes.length === 1 ? "rede" : "redes"}
                              </span>
                            </td>
                            <td
                              className="px-4 py-3 align-middle text-[11px] text-[#4A2C1A]/55 tabular-nums"
                              title={formatDate(a.createdAt)}
                            >
                              há {formatRelative(a.createdAt)}
                            </td>
                            <td
                              className="px-4 py-3 align-middle text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1 justify-end">
                                {wppUrl && (
                                  <a
                                    href={wppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center rounded-md text-[#25D366] hover:bg-[#25D366]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                                    aria-label={`WhatsApp ${formatWhatsapp(a.whatsapp)}`}
                                    title={`WhatsApp: ${formatWhatsapp(a.whatsapp)}`}
                                  >
                                    <Phone size={13} strokeWidth={2.2} />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelected(a)}
                                  className="w-8 h-8 flex items-center justify-center rounded-md text-[#4A2C1A]/65 hover:text-[#E87A1E] hover:bg-[#E87A1E]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]"
                                  aria-label={`Ver detalhes de ${a.nome}`}
                                  title="Ver detalhes"
                                >
                                  <MoreHorizontal size={14} strokeWidth={2.2} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BangerDetailModal
        application={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onStatusChange={handleSetStatus}
        onToggleFavorite={handleToggleFavorito}
        onUpdateNotes={handleUpdateNotas}
        onDelete={handleDelete}
      />
    </>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-[#4A2C1A]/15 p-12 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-[#E87A1E] flex items-center justify-center text-white">
        <Users size={24} strokeWidth={2} />
      </div>
      <p
        className="font-black uppercase text-[#1A1A1A] text-lg tracking-tight"
        style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
      >
        Sem candidatos ainda
      </p>
      <p className="text-sm text-[#4A2C1A]/60 max-w-sm">
        Quando alguém preencher o &quot;Quero ser Banger&quot; em{" "}
        <strong className="text-[#2D1810]">/seja-um-banger</strong>, a aplicação aparece aqui
        com nome, redes e métricas.
      </p>
    </div>
  )
}
