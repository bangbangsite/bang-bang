"use client"

import { useEffect, useState } from "react"
import {
  X,
  Star,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Camera,
  Music,
  Video,
  Radio,
  Clapperboard,
  Hash,
  Plus,
} from "lucide-react"
import {
  BANGER_NICHE_LABEL,
  BANGER_STATUSES,
  BANGER_STATUS_LABEL,
  PLATFORM_LABEL,
  formatFollowers,
  parseFollowers,
  type BangerApplication,
  type BangerStatus,
  type PlatformId,
} from "@/lib/bangers/config"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<BangerStatus, { bg: string; text: string; ring: string }> = {
  novo:        { bg: "#E87A1E14", text: "#C4650F", ring: "#E87A1E33" },
  em_conversa: { bg: "#F5A62314", text: "#9A6300", ring: "#F5A62333" },
  aprovado:    { bg: "#2E7D3214", text: "#2E7D32", ring: "#2E7D3233" },
  parceiro:    { bg: "#9C742814", text: "#6D5018", ring: "#9C742855" },
  rejeitado:   { bg: "#4A2C1A0A", text: "#4A2C1A99", ring: "#4A2C1A22" },
}

const PLATFORM_ICON: Record<PlatformId, React.ReactNode> = {
  instagram: <Camera size={14} strokeWidth={2.2} />,
  tiktok:    <Music size={14} strokeWidth={2.2} />,
  youtube:   <Video size={14} strokeWidth={2.2} />,
  twitch:    <Clapperboard size={14} strokeWidth={2.2} />,
  kwai:      <Radio size={14} strokeWidth={2.2} />,
  x:         <Hash size={14} strokeWidth={2.2} />,
  outro:     <Plus size={14} strokeWidth={2.2} />,
}

interface BangerDetailModalProps {
  application: BangerApplication | null
  open: boolean
  onClose: () => void
  onStatusChange: (id: string, status: BangerStatus) => void
  onToggleFavorite: (id: string) => void
  onUpdateNotes: (id: string, notas: string) => void
  onDelete: (id: string) => void
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (!d) return raw
  const core = d.startsWith("55") && d.length > 11 ? d.slice(2) : d
  if (core.length === 11) return `(${core.slice(0, 2)}) ${core.slice(2, 7)}-${core.slice(7)}`
  if (core.length === 10) return `(${core.slice(0, 2)}) ${core.slice(2, 6)}-${core.slice(6)}`
  return raw
}

function whatsappUrl(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (!d) return ""
  const number = d.startsWith("55") ? d : `55${d}`
  return `https://wa.me/${number}`
}

export function BangerDetailModal({
  application,
  open,
  onClose,
  onStatusChange,
  onToggleFavorite,
  onUpdateNotes,
  onDelete,
}: BangerDetailModalProps) {
  const [notes, setNotes] = useState(application?.notas ?? "")
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Sync notes when a different application is opened — tracked-key pattern
  // avoids the setState-in-effect anti-pattern.
  const trackKey = `${application?.id ?? ""}|${application?.notas ?? ""}`
  const [trackedKey, setTrackedKey] = useState(trackKey)
  if (trackKey !== trackedKey) {
    setTrackedKey(trackKey)
    setNotes(application?.notas ?? "")
    setConfirmDelete(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !application) return null

  const a = application
  const totalReach = a.redes.reduce((sum, r) => sum + parseFollowers(r.seguidores), 0)
  const wppUrl = whatsappUrl(a.whatsapp)
  const notesDirty = notes !== a.notas

  const handleSaveNotes = () => onUpdateNotes(a.id, notes)

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(a.id)
    onClose()
  }

  const status = STATUS_COLORS[a.status]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="banger-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0A]/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl border border-[#4A2C1A]/8 shadow-[0_30px_60px_-20px_rgba(45,24,16,0.35)] my-8 flex flex-col max-h-[calc(100vh-4rem)]"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 px-6 py-5 border-b border-[#4A2C1A]/8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded-full"
                style={{
                  background: status.bg,
                  color: status.text,
                  border: `1px solid ${status.ring}`,
                }}
              >
                {BANGER_STATUS_LABEL[a.status]}
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#4A2C1A]/45">
                {BANGER_NICHE_LABEL[a.nicho]}
              </span>
            </div>
            <h2
              id="banger-detail-title"
              className="font-black uppercase text-[#1A1A1A] text-xl md:text-2xl leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-heading-var)", fontWeight: 700 }}
            >
              {a.nome}
            </h2>
            <p className="text-xs text-[#4A2C1A]/55 mt-1 tabular-nums">
              Inscrito em {formatDate(a.createdAt)}
              {a.updatedAt && ` · atualizado ${formatDate(a.updatedAt)}`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(a.id)}
              aria-label={a.favorito ? "Tirar dos favoritos" : "Marcar como favorito"}
              title={a.favorito ? "Tirar dos favoritos" : "Marcar como favorito"}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-md transition-colors",
                a.favorito
                  ? "text-[#E87A1E] bg-[#E87A1E]/10 hover:bg-[#E87A1E]/15"
                  : "text-[#4A2C1A]/45 hover:text-[#E87A1E] hover:bg-[#FAFAF8]",
              )}
            >
              <Star
                size={16}
                strokeWidth={2.2}
                className={a.favorito ? "fill-[#E87A1E]" : ""}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-9 h-9 flex items-center justify-center rounded-md text-[#4A2C1A]/55 hover:text-[#2D1810] hover:bg-[#FAFAF8]"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Status pipeline picker */}
          <section>
            <h3 className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4A2C1A]/55 mb-2">
              Status do candidato
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {BANGER_STATUSES.map((s) => {
                const isActive = a.status === s
                const colors = STATUS_COLORS[s]
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatusChange(a.id, s)}
                    aria-pressed={isActive}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-semibold transition-all",
                      isActive ? "scale-105" : "opacity-60 hover:opacity-100",
                    )}
                    style={
                      isActive
                        ? {
                            background: colors.text,
                            color: "#FFFFFF",
                            boxShadow: `0 4px 10px -3px ${colors.text}55`,
                          }
                        : {
                            background: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.ring}`,
                          }
                    }
                  >
                    {BANGER_STATUS_LABEL[s]}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Contact + location */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ContactRow
              icon={<Phone size={14} strokeWidth={2.2} />}
              label="WhatsApp"
              value={formatWhatsapp(a.whatsapp)}
              href={wppUrl || undefined}
              hrefLabel="Abrir conversa"
            />
            <ContactRow
              icon={<Mail size={14} strokeWidth={2.2} />}
              label="E-mail"
              value={a.email}
              href={`mailto:${a.email}`}
              hrefLabel="Enviar e-mail"
            />
            <ContactRow
              icon={<MapPin size={14} strokeWidth={2.2} />}
              label="Localização"
              value={a.cidade ? `${a.cidade}${a.uf ? `/${a.uf}` : ""}` : "—"}
            />
            <ContactRow
              icon={<Star size={14} strokeWidth={2.2} />}
              label="Alcance total estimado"
              value={totalReach > 0 ? formatFollowers(totalReach) : "—"}
            />
          </section>

          {/* Redes — networks list */}
          <section>
            <h3 className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4A2C1A]/55 mb-2">
              Redes ({a.redes.length})
            </h3>
            {a.redes.length === 0 ? (
              <p className="text-sm text-[#4A2C1A]/50 italic">Nenhuma rede informada.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {a.redes.map((r, i) => {
                  const isPrincipal = i === 0
                  return (
                    <li
                      key={`${r.platform}-${i}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#4A2C1A]/8 bg-[#FAFAF8]"
                    >
                      <span
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          isPrincipal
                            ? "bg-[#E87A1E] text-white"
                            : "bg-white border border-[#4A2C1A]/8 text-[#4A2C1A]/65",
                        )}
                      >
                        {PLATFORM_ICON[r.platform]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#1A1A1A]">
                            {PLATFORM_LABEL[r.platform]}
                          </span>
                          {isPrincipal && (
                            <span className="text-[8px] font-black tracking-[0.2em] uppercase px-1.5 py-0.5 rounded bg-[#E87A1E]/12 text-[#C4650F]">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#4A2C1A]/65 truncate">
                          {r.handle || <span className="italic">sem handle</span>}
                        </p>
                      </div>
                      <span className="text-[12px] font-bold text-[#2D1810] tabular-nums shrink-0">
                        {r.seguidores || "—"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Motivacao */}
          <section>
            <h3 className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4A2C1A]/55 mb-2">
              Por que quer ser Banger
            </h3>
            <div className="rounded-xl bg-[#FAFAF8] border border-[#4A2C1A]/8 p-4 text-[13px] text-[#2D1810] leading-relaxed whitespace-pre-wrap">
              {a.motivacao || <span className="italic text-[#4A2C1A]/45">Sem texto.</span>}
            </div>
          </section>

          {/* Internal notes */}
          <section>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4A2C1A]/55">
                Notas internas
              </h3>
              {notesDirty && (
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="text-[11px] font-semibold text-[#E87A1E] hover:text-[#C4650F]"
                >
                  Salvar nota
                </button>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Onde tá a conversa, o que falta, próximos passos…"
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-[#4A2C1A]/8 bg-[#FAFAF8] text-sm text-[#2D1810] focus:border-[#E87A1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87A1E]/40 transition-colors resize-none leading-relaxed"
            />
            <p className="text-[11px] text-[#4A2C1A]/45 mt-1">
              Só você (staff) vê. O candidato nunca lê isso.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-2 px-6 py-4 border-t border-[#4A2C1A]/8 bg-[#FAFAF8] rounded-b-2xl flex-wrap">
          <button
            type="button"
            onClick={handleDelete}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus-visible:ring-offset-2",
              confirmDelete
                ? "bg-[#D32F2F] text-white hover:bg-[#B71C1C]"
                : "text-[#4A2C1A]/65 hover:text-[#D32F2F] hover:bg-white",
            )}
          >
            <Trash2 size={14} strokeWidth={2.2} />
            {confirmDelete ? "Confirmar — remover" : "Remover candidato"}
          </button>
          <div className="flex items-center gap-2">
            {wppUrl && (
              <a
                href={wppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#1ea854] transition-colors"
              >
                <Phone size={14} strokeWidth={2.4} />
                Chamar no WhatsApp
                <ExternalLink size={11} strokeWidth={2.4} className="opacity-70" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg text-[13px] font-semibold text-[#4A2C1A]/75 hover:bg-white"
            >
              Fechar
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
  href,
  hrefLabel,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
  hrefLabel?: string
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl border border-[#4A2C1A]/8 bg-white">
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] uppercase text-[#4A2C1A]/55">
        <span className="text-[#E87A1E]">{icon}</span>
        {label}
      </div>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{value}</span>
        {href && hrefLabel && (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#E87A1E] hover:text-[#C4650F] uppercase tracking-wider shrink-0"
          >
            {hrefLabel}
            <ExternalLink size={10} strokeWidth={2.4} />
          </a>
        )}
      </div>
    </div>
  )
}
