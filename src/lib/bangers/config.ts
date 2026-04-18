/**
 * Banger applications — submissions from the public /seja-um-banger form.
 * Stored in localStorage until a backend is plugged in. Staff reads these
 * in the dashboard (/dashboard/bangers) and walks them through a status
 * pipeline (novo → em conversa → aprovado/parceiro, ou rejeitado).
 */

const KEY = "bb_bangers_v1"

export type BangerStatus =
  | "novo"
  | "em_conversa"
  | "aprovado"
  | "rejeitado"
  | "parceiro"

export const BANGER_STATUSES: BangerStatus[] = [
  "novo",
  "em_conversa",
  "aprovado",
  "rejeitado",
  "parceiro",
]

export const BANGER_STATUS_LABEL: Record<BangerStatus, string> = {
  novo: "Novo",
  em_conversa: "Em conversa",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  parceiro: "Parceiro ativo",
}

export type BangerNiche =
  | "nightlife"
  | "musica"
  | "gastro"
  | "festival"
  | "humor"
  | "lifestyle"
  | "esporte"
  | "moda"
  | "outro"

export const BANGER_NICHES: BangerNiche[] = [
  "nightlife",
  "musica",
  "gastro",
  "festival",
  "humor",
  "lifestyle",
  "esporte",
  "moda",
  "outro",
]

export const BANGER_NICHE_LABEL: Record<BangerNiche, string> = {
  nightlife: "Nightlife / Balada",
  musica: "Música / DJ",
  gastro: "Gastronomia / Bar",
  festival: "Festival / Shows",
  humor: "Humor / Entretenimento",
  lifestyle: "Lifestyle",
  esporte: "Esporte / Outdoor",
  moda: "Moda / Beleza",
  outro: "Outro",
}

export type PlatformId =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitch"
  | "kwai"
  | "x"
  | "outro"

export const PLATFORM_LABEL: Record<PlatformId, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitch: "Twitch",
  kwai: "Kwai",
  x: "X / Twitter",
  outro: "Outra",
}

export interface BangerRede {
  platform: PlatformId
  /** @ or URL — the form preserves the user's input verbatim. */
  handle: string
  /** Free-text follower count as the user typed (ex: "48k", "1.2M"). */
  seguidores: string
}

export interface BangerApplication {
  id: string
  nome: string
  email: string
  whatsapp: string
  cidade: string
  uf: string
  nicho: BangerNiche
  /** Ordered — index 0 is the principal channel. */
  redes: BangerRede[]
  motivacao: string
  status: BangerStatus
  /** Internal staff flag — surfaces a star in the table. */
  favorito: boolean
  /** Free-form internal notes (only visible in the dashboard). */
  notas: string
  /** ISO timestamp. */
  createdAt: string
  /** ISO timestamp — null until staff edits anything. */
  updatedAt: string | null
}

export const EMPTY_APPLICATION: Omit<BangerApplication, "id" | "createdAt" | "updatedAt"> = {
  nome: "",
  email: "",
  whatsapp: "",
  cidade: "",
  uf: "",
  nicho: "nightlife",
  redes: [],
  motivacao: "",
  status: "novo",
  favorito: false,
  notas: "",
}

// ----------------- storage -----------------
export function readBangers(): BangerApplication[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidApplication)
  } catch {
    return []
  }
}

export function writeBangers(next: BangerApplication[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota errors */
  }
}

export function resetBangers(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export const BANGERS_STORAGE_KEY = KEY

// ----------------- helpers -----------------

function isValidApplication(v: unknown): v is BangerApplication {
  if (!v || typeof v !== "object") return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === "string" &&
    typeof r.nome === "string" &&
    typeof r.email === "string" &&
    typeof r.createdAt === "string"
  )
}

export function newApplicationId(): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `bgr-${Date.now().toString(36)}-${rand}`
}

/** Sum the followers across a banger's networks — best-effort numeric parse
 * since users type "48k", "1.2M", "12 mil", etc. Returns 0 when unparseable. */
export function totalFollowers(redes: readonly BangerRede[]): number {
  return redes.reduce((sum, r) => sum + parseFollowers(r.seguidores), 0)
}

export function parseFollowers(raw: string): number {
  if (!raw) return 0
  const s = raw.toLowerCase().replace(/[\s.]/g, "").replace(/,/g, ".")
  const m = s.match(/^([\d.]+)\s*(k|m|mil|mi)?/i)
  if (!m) return 0
  const n = parseFloat(m[1])
  if (Number.isNaN(n)) return 0
  const unit = m[2]
  if (unit === "k" || unit === "mil") return Math.round(n * 1_000)
  if (unit === "m" || unit === "mi") return Math.round(n * 1_000_000)
  return Math.round(n)
}

/** Pretty-print follower counts. Mirrors what the form lets users type. */
export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(".0", "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(".0", "")}k`
  return `${n}`
}
