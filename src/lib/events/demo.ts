/**
 * Demo events — 20 fake upcoming events distributed across categories, cities
 * and months. Seeded once per browser (flag bb_events_demo_seeded) so the
 * staff dashboard doesn't get fakes reinjected after it's cleared. Bumped to
 * v2 because the seed-flag layout changed.
 */

import type { BangEvent } from "./config"

const DEMO_SEED_FLAG = "bb_events_demo_seeded_v2"

/**
 * Offsets in days from today (first entry is the soonest event). Spread so
 * the month-filter chip column shows a healthy 5–6 buckets.
 */
const DAY_OFFSETS = [
  2, 6, 10, 14, 21, 28, 35, 42, 52, 72,
  50, 60, 78, 90, 100, 112, 125, 140, 158, 175,
]

interface DemoSeedInput {
  slug: string
  nome: string
  categoria: BangEvent["categoria"]
  cidade: string
  uf: BangEvent["uf"]
  hora?: string
  venue?: string
  teaser?: string
  ticketUrl?: string
  destaque?: boolean
  /** Optional multi-day end-offset (days after start). */
  multiDay?: number
}

const DEMO_BASE: DemoSeedInput[] = [
  {
    slug: "bang-bang-rooftop-bh",
    nome: "Bang Bang Rooftop",
    categoria: "Rooftop",
    cidade: "Belo Horizonte",
    uf: "MG",
    hora: "17:00",
    venue: "Mirante Savassi",
    teaser: "Sunset, lata gelada e a cidade aos seus pés.",
    ticketUrl: "https://www.sympla.com.br/",
    destaque: true,
  },
  {
    slug: "festa-bang-bang-rj",
    nome: "Festa Bang Bang — Copa",
    categoria: "Festa",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    hora: "22:00",
    venue: "Clube Atlântico",
    teaser: "Open bar com os 4 sabores. DJ residente até o sol nascer.",
    ticketUrl: "https://www.sympla.com.br/",
    destaque: true,
  },
  {
    slug: "show-trilha-sonora-sp",
    nome: "Trilha Sonora ao Vivo",
    categoria: "Show",
    cidade: "São Paulo",
    uf: "SP",
    hora: "20:00",
    venue: "Audio Club",
    teaser: "Line-up nacional com ativação Bang Bang no foyer.",
    ticketUrl: "https://www.sympla.com.br/",
  },
  {
    slug: "ativacao-uberlandia",
    nome: "Ativação Bang Bang Campus",
    categoria: "Ativação",
    cidade: "Uberlândia",
    uf: "MG",
    hora: "14:00",
    venue: "Praça Universitária",
    teaser: "Tasting gratuito + foto-box pra quem topar um brinde.",
  },
  {
    slug: "festival-areia-salvador",
    nome: "Festival Areia Quente",
    categoria: "Festival",
    cidade: "Salvador",
    uf: "BA",
    hora: "12:00",
    venue: "Praia do Porto da Barra",
    teaser: "Dois dias na areia com Bang Bang gelando o verão.",
    ticketUrl: "https://www.sympla.com.br/",
    destaque: true,
    multiDay: 1,
  },
  {
    slug: "rooftop-curitiba",
    nome: "Sunset Bang Bang CWB",
    categoria: "Rooftop",
    cidade: "Curitiba",
    uf: "PR",
    hora: "18:00",
    venue: "Rooftop Batel",
    teaser: "Pôr do sol + DJ set + lata na mão.",
    ticketUrl: "https://www.sympla.com.br/",
  },
  {
    slug: "festa-bang-bang-bh",
    nome: "Bang Bang no Mineirinho",
    categoria: "Festa",
    cidade: "Belo Horizonte",
    uf: "MG",
    hora: "23:00",
    venue: "Arena Savassi",
    teaser: "A festa que não espera a madrugada começar.",
  },
  {
    slug: "show-porto-alegre",
    nome: "Esquenta Bang Bang POA",
    categoria: "Show",
    cidade: "Porto Alegre",
    uf: "RS",
    hora: "19:30",
    venue: "Opinião",
    teaser: "Duas bandas locais e a Bang Bang abrindo a noite.",
    ticketUrl: "https://www.sympla.com.br/",
  },
  {
    slug: "ativacao-brasilia",
    nome: "Bang Bang Ativa BSB",
    categoria: "Ativação",
    cidade: "Brasília",
    uf: "DF",
    hora: "16:00",
    venue: "Parque da Cidade",
    teaser: "Domingo com ativação de marca e quiosque itinerante.",
  },
  {
    slug: "festival-floripa",
    nome: "Festival Bang Bang Floripa",
    categoria: "Festival",
    cidade: "Florianópolis",
    uf: "SC",
    hora: "14:00",
    venue: "Jurerê Open Shopping",
    teaser: "Três palcos, 14 horas de música, Bang Bang geladinha.",
    ticketUrl: "https://www.sympla.com.br/",
    destaque: true,
    multiDay: 2,
  },
  {
    slug: "festival-recife",
    nome: "Festival Bang Bang Recife",
    categoria: "Festival",
    cidade: "Recife",
    uf: "PE",
    hora: "15:00",
    venue: "Marco Zero",
    teaser: "Frevo, brega-funk e Bang Bang batendo no peito.",
    ticketUrl: "https://www.sympla.com.br/",
    multiDay: 2,
  },
  {
    slug: "madrugada-bang-bang-sp",
    nome: "Madrugada Bang Bang",
    categoria: "Festa",
    cidade: "São Paulo",
    uf: "SP",
    hora: "23:30",
    venue: "Cine Joia",
    teaser: "Pista cheia, lata gelada, sai quando o sol pedir.",
    ticketUrl: "https://www.sympla.com.br/",
  },
  {
    slug: "rooftop-lapa-rj",
    nome: "Rooftop Bang Bang Lapa",
    categoria: "Rooftop",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    hora: "17:30",
    venue: "Casa Camolese",
    teaser: "Vista dos Arcos com tasting guiado dos quatro sabores.",
    ticketUrl: "https://www.sympla.com.br/",
  },
  {
    slug: "esquenta-poa",
    nome: "Esquenta Bang Bang POA",
    categoria: "Festa",
    cidade: "Porto Alegre",
    uf: "RS",
    hora: "21:00",
    venue: "Workroom",
    teaser: "Open de Bang Bang até meia-noite — chega cedo.",
  },
  {
    slug: "acustico-floripa",
    nome: "Acústico Bang Bang Floripa",
    categoria: "Show",
    cidade: "Florianópolis",
    uf: "SC",
    hora: "20:00",
    venue: "John Bull Pub",
    teaser: "Voz, violão e a lata na mão. Sessão íntima.",
    ticketUrl: "https://www.sympla.com.br/",
  },
  {
    slug: "pelourinho-salvador",
    nome: "Pelourinho Bang Bang",
    categoria: "Festa",
    cidade: "Salvador",
    uf: "BA",
    hora: "20:30",
    venue: "Largo do Pelourinho",
    teaser: "Bloco Bang Bang descendo a ladeira.",
    destaque: true,
  },
  {
    slug: "festival-inverno-cwb",
    nome: "Festival Inverno Bang Bang",
    categoria: "Festival",
    cidade: "Curitiba",
    uf: "PR",
    hora: "13:00",
    venue: "Pedreira Paulo Leminski",
    teaser: "Dois dias de line-up nacional na pedreira.",
    ticketUrl: "https://www.sympla.com.br/",
    multiDay: 2,
  },
  {
    slug: "show-banda-bsb",
    nome: "Banda Bang Bang BSB",
    categoria: "Show",
    cidade: "Brasília",
    uf: "DF",
    hora: "21:30",
    venue: "Calaf Bar",
    teaser: "Trio brasiliense em show-residência mensal.",
    ticketUrl: "https://www.sympla.com.br/",
  },
  {
    slug: "ativacao-paulista",
    nome: "Ativação Av. Paulista",
    categoria: "Ativação",
    cidade: "São Paulo",
    uf: "SP",
    hora: "11:00",
    venue: "Av. Paulista (domingo aberto)",
    teaser: "Tasting + foto-box itinerante na Paulista.",
  },
  {
    slug: "festival-liberdade-bh",
    nome: "Festival Liberdade Bang Bang",
    categoria: "Festival",
    cidade: "Belo Horizonte",
    uf: "MG",
    hora: "12:00",
    venue: "Praça da Liberdade",
    teaser: "Praça inteira tomada por som, comida e Bang Bang.",
    ticketUrl: "https://www.sympla.com.br/",
    destaque: true,
    multiDay: 1,
  },
]

function formatIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, "0")
  const day = `${d.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function buildDemoEvents(now = new Date()): BangEvent[] {
  const createdAt = now.toISOString()
  return DEMO_BASE.map((d, i) => {
    const start = new Date(now)
    start.setDate(start.getDate() + DAY_OFFSETS[i])
    const end = d.multiDay ? new Date(start) : null
    if (end && d.multiDay) end.setDate(end.getDate() + d.multiDay)
    return {
      id: `evt-demo-${d.slug}`,
      slug: d.slug,
      nome: d.nome,
      categoria: d.categoria,
      cidade: d.cidade,
      uf: d.uf,
      data: formatIsoDate(start),
      dataFim: end ? formatIsoDate(end) : undefined,
      hora: d.hora,
      venue: d.venue,
      teaser: d.teaser,
      ticketUrl: d.ticketUrl,
      destaque: d.destaque,
      createdAt,
    }
  })
}

export function hasSeededDemoEvents(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(DEMO_SEED_FLAG) === "1"
  } catch {
    return true
  }
}

export function markEventsSeeded(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DEMO_SEED_FLAG, "1")
  } catch {
    /* ignore */
  }
}

export const EVENTS_DEMO_SEED_FLAG_KEY = DEMO_SEED_FLAG
