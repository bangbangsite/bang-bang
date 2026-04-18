/**
 * Demo banger applications — 6 fakes spread across niches/cities/statuses
 * so the dashboard has something to show on first visit. Seeded once per
 * browser (flag bb_bangers_demo_seeded).
 */

import {
  newApplicationId,
  type BangerApplication,
  type BangerStatus,
  type BangerNiche,
  type BangerRede,
} from "./config"

const DEMO_SEED_FLAG = "bb_bangers_demo_seeded"

interface DemoSeed {
  nome: string
  email: string
  whatsapp: string
  cidade: string
  uf: string
  nicho: BangerNiche
  redes: BangerRede[]
  motivacao: string
  status: BangerStatus
  favorito?: boolean
  notas?: string
  /** Days ago this fake application was "submitted". */
  daysAgo: number
}

const DEMO_BASE: DemoSeed[] = [
  {
    nome: "Larissa Rocha",
    email: "larissa@exemplo.com",
    whatsapp: "(11) 98741-2389",
    cidade: "São Paulo",
    uf: "SP",
    nicho: "nightlife",
    redes: [
      { platform: "instagram", handle: "@larissarocha", seguidores: "82k" },
      { platform: "tiktok", handle: "@larirocha", seguidores: "120k" },
    ],
    motivacao:
      "Faço cobertura de festa há 4 anos, adoraria levar Bang Bang pros eventos que cubro toda semana. Já participo da line de SP toda.",
    status: "novo",
    daysAgo: 1,
  },
  {
    nome: "Gabriel Maciel",
    email: "gabe@maciel.dj",
    whatsapp: "(31) 99012-4421",
    cidade: "Belo Horizonte",
    uf: "MG",
    nicho: "musica",
    redes: [
      { platform: "instagram", handle: "@gabemaciel", seguidores: "45k" },
      { platform: "youtube", handle: "@gabemacielsets", seguidores: "12k" },
    ],
    motivacao:
      "DJ residente no Mineirinho, faço sets toda quinta. A Bang Bang Rooftop seria match perfeito com meu público de open format.",
    status: "em_conversa",
    favorito: true,
    notas: "Já trocou WhatsApp com Carla. Aguardando enviar deck de eventos.",
    daysAgo: 5,
  },
  {
    nome: "Fer Carvalho",
    email: "fer@cocktailfer.com",
    whatsapp: "(21) 97712-0001",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    nicho: "gastro",
    redes: [
      { platform: "instagram", handle: "@cocktailfer", seguidores: "210k" },
      { platform: "youtube", handle: "@cocktailfer", seguidores: "58k" },
      { platform: "tiktok", handle: "@cocktailfer", seguidores: "94k" },
    ],
    motivacao:
      "Especializada em RTD review, já fiz vídeo orgânico sobre Bang Bang. Conteúdo casa com a marca naturalmente.",
    status: "aprovado",
    favorito: true,
    notas: "Contrato de 3 meses fechado em 2025-04-20. Primeira entrega: vídeo no IG até 10/05.",
    daysAgo: 12,
  },
  {
    nome: "Pedro Antunes",
    email: "pedrohumor@gmail.com",
    whatsapp: "(41) 99988-3322",
    cidade: "Curitiba",
    uf: "PR",
    nicho: "humor",
    redes: [
      { platform: "tiktok", handle: "@pedroantunes", seguidores: "1.4M" },
      { platform: "instagram", handle: "@pedroantunesx", seguidores: "320k" },
    ],
    motivacao:
      "Stand-up + sketch sobre vida noturna. Topo fazer skits orgânicos com o produto sem parecer publi forçada.",
    status: "novo",
    daysAgo: 2,
  },
  {
    nome: "Marina Lopes",
    email: "marinalopesoficial@gmail.com",
    whatsapp: "(85) 98230-7765",
    cidade: "Fortaleza",
    uf: "CE",
    nicho: "lifestyle",
    redes: [
      { platform: "instagram", handle: "@marinalopes", seguidores: "28k" },
    ],
    motivacao:
      "Amo a marca e queria fazer parte. Já consumo Bang Bang há tempos.",
    status: "rejeitado",
    notas: "Engajamento baixo + nicho não bate com nightlife/eventos. Resposta enviada 2025-04-15.",
    daysAgo: 18,
  },
  {
    nome: "DJ Tati Lima",
    email: "tati@tatilima.dj",
    whatsapp: "(81) 99125-8841",
    cidade: "Recife",
    uf: "PE",
    nicho: "musica",
    redes: [
      { platform: "instagram", handle: "@djtatilima", seguidores: "640k" },
      { platform: "tiktok", handle: "@tatilima", seguidores: "1.1M" },
      { platform: "youtube", handle: "@djtatilima", seguidores: "180k" },
    ],
    motivacao:
      "DJ residente no Carnaval do Recife. Sets autorais + cobertura de festival. Engajamento médio 8% no IG.",
    status: "parceiro",
    favorito: true,
    notas: "Parceira desde Carnaval 2025. Renovação prevista pra 2026. Contato direto via WhatsApp.",
    daysAgo: 60,
  },
]

function isoFromDaysAgo(now: Date, days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export function buildDemoBangers(now = new Date()): BangerApplication[] {
  return DEMO_BASE.map((d) => ({
    id: newApplicationId(),
    nome: d.nome,
    email: d.email,
    whatsapp: d.whatsapp,
    cidade: d.cidade,
    uf: d.uf,
    nicho: d.nicho,
    redes: d.redes,
    motivacao: d.motivacao,
    status: d.status,
    favorito: d.favorito ?? false,
    notas: d.notas ?? "",
    createdAt: isoFromDaysAgo(now, d.daysAgo),
    updatedAt: d.notas || d.status !== "novo" ? isoFromDaysAgo(now, Math.max(0, d.daysAgo - 1)) : null,
  }))
}

export function hasSeededDemoBangers(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(DEMO_SEED_FLAG) === "1"
  } catch {
    return true
  }
}

export function markBangersSeeded(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DEMO_SEED_FLAG, "1")
  } catch {
    /* ignore */
  }
}

export const BANGERS_DEMO_SEED_FLAG_KEY = DEMO_SEED_FLAG
