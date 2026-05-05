/**
 * Seeds the Supabase DB with realistic fake data for the admin dashboard demo.
 *
 *   - 15 rows in `wishlist_requests` (Quero Bang Bang na minha cidade)
 *   - 12 rows in `bangers`          (Seja um Banger applications)
 *
 * Uses SUPABASE_SECRET_KEY (service role) to bypass RLS. Safe to re-run:
 * entries are tagged with a nota/complemento prefix so the cleanup flag
 * below only removes demo rows, never real user submissions.
 *
 * Usage:
 *   npm run seed:demo          # insert demo data
 *   npm run seed:demo -- --clean   # remove previous demo rows first
 */
import { createClient } from "@supabase/supabase-js"
import * as fs from "node:fs"
import * as path from "node:path"

// ---------------------------------------------------------------------------
// Load .env.local manually (no dotenv dependency in this project)
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "..", ".env.local")
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, "utf8")
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}
loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// Tag used to identify demo rows so --clean only removes seeded data.
const DEMO_TAG = "[demo-seed]"

const args = process.argv.slice(2)
const CLEAN_ONLY = args.includes("--clean-only")
const CLEAN_FIRST = args.includes("--clean") || CLEAN_ONLY

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns an ISO timestamp N full days ago, with a deterministic hour/minute
 * offset so the timeline looks natural (not all at 00:00). */
function daysAgo(days: number, hour = 14, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// 15 city requests (wishlist_requests)
// ---------------------------------------------------------------------------

interface WishlistSeed {
  nome: string
  whatsapp: string
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  created_at: string
}

const WISHLIST_SEEDS: WishlistSeed[] = [
  // Heavy demand in Goiânia — 3 hits, ranking leader
  {
    nome: "Letícia Almeida",
    whatsapp: "62991234567",
    cep: "74150050",
    endereco: "Rua 9",
    numero: "482",
    complemento: `Apto 701 ${DEMO_TAG}`,
    bairro: "Setor Oeste",
    cidade: "Goiânia",
    uf: "GO",
    created_at: daysAgo(2, 20, 14),
  },
  {
    nome: "Matheus Carvalho",
    whatsapp: "62984561234",
    cep: "74663520",
    endereco: "Avenida T-63",
    numero: "1150",
    complemento: DEMO_TAG,
    bairro: "Setor Bueno",
    cidade: "Goiânia",
    uf: "GO",
    created_at: daysAgo(5, 22, 8),
  },
  {
    nome: "Isabela Freitas",
    whatsapp: "62996847210",
    cep: "74230030",
    endereco: "Rua 24",
    numero: "88",
    complemento: DEMO_TAG,
    bairro: "Setor Central",
    cidade: "Goiânia",
    uf: "GO",
    created_at: daysAgo(9, 18, 42),
  },
  // Curitiba — 2 hits
  {
    nome: "Rafael Schmidt",
    whatsapp: "41988764521",
    cep: "80420210",
    endereco: "Rua Comendador Araújo",
    numero: "324",
    complemento: `Bloco B ${DEMO_TAG}`,
    bairro: "Batel",
    cidade: "Curitiba",
    uf: "PR",
    created_at: daysAgo(3, 23, 10),
  },
  {
    nome: "Beatriz Nogueira",
    whatsapp: "41991203344",
    cep: "82820400",
    endereco: "Rua Paulo Gorski",
    numero: "1150",
    complemento: DEMO_TAG,
    bairro: "Cidade Industrial",
    cidade: "Curitiba",
    uf: "PR",
    created_at: daysAgo(12, 11, 30),
  },
  // Recife — 2 hits
  {
    nome: "João Victor Barros",
    whatsapp: "81987234562",
    cep: "51021020",
    endereco: "Rua dos Navegantes",
    numero: "1660",
    complemento: `Apto 902 ${DEMO_TAG}`,
    bairro: "Boa Viagem",
    cidade: "Recife",
    uf: "PE",
    created_at: daysAgo(1, 19, 55),
  },
  {
    nome: "Camila Siqueira",
    whatsapp: "81993451200",
    cep: "50050410",
    endereco: "Avenida Cruz Cabugá",
    numero: "540",
    complemento: DEMO_TAG,
    bairro: "Santo Amaro",
    cidade: "Recife",
    uf: "PE",
    created_at: daysAgo(8, 16, 5),
  },
  // Fortaleza
  {
    nome: "Lucas Bezerra",
    whatsapp: "85988445566",
    cep: "60160230",
    endereco: "Avenida Beira Mar",
    numero: "2300",
    complemento: `Apto 1502 ${DEMO_TAG}`,
    bairro: "Meireles",
    cidade: "Fortaleza",
    uf: "CE",
    created_at: daysAgo(4, 21, 33),
  },
  // Salvador
  {
    nome: "Maria Eduarda Tavares",
    whatsapp: "71996655443",
    cep: "41940110",
    endereco: "Rua Guillard Muniz",
    numero: "77",
    complemento: DEMO_TAG,
    bairro: "Pituba",
    cidade: "Salvador",
    uf: "BA",
    created_at: daysAgo(7, 17, 18),
  },
  // Florianópolis
  {
    nome: "Gabriel Koerich",
    whatsapp: "48991776655",
    cep: "88053100",
    endereco: "Rua Afonso Delambert Neto",
    numero: "440",
    complemento: `Apto 302 ${DEMO_TAG}`,
    bairro: "Trindade",
    cidade: "Florianópolis",
    uf: "SC",
    created_at: daysAgo(6, 13, 25),
  },
  // Manaus
  {
    nome: "Thiago Albuquerque",
    whatsapp: "92984123300",
    cep: "69050020",
    endereco: "Avenida Djalma Batista",
    numero: "1661",
    complemento: DEMO_TAG,
    bairro: "Chapada",
    cidade: "Manaus",
    uf: "AM",
    created_at: daysAgo(11, 15, 12),
  },
  // Natal
  {
    nome: "Priscila Dantas",
    whatsapp: "84987665544",
    cep: "59020001",
    endereco: "Rua Potengi",
    numero: "215",
    complemento: `Casa ${DEMO_TAG}`,
    bairro: "Petrópolis",
    cidade: "Natal",
    uf: "RN",
    created_at: daysAgo(14, 10, 48),
  },
  // Vitória
  {
    nome: "Henrique Pessoa",
    whatsapp: "27999112233",
    cep: "29055280",
    endereco: "Avenida Saturnino de Brito",
    numero: "410",
    complemento: `Apto 804 ${DEMO_TAG}`,
    bairro: "Praia do Canto",
    cidade: "Vitória",
    uf: "ES",
    created_at: daysAgo(10, 18, 0),
  },
  // Campo Grande
  {
    nome: "Larissa Moura",
    whatsapp: "67991885577",
    cep: "79020220",
    endereco: "Avenida Afonso Pena",
    numero: "3150",
    complemento: DEMO_TAG,
    bairro: "Centro",
    cidade: "Campo Grande",
    uf: "MS",
    created_at: daysAgo(18, 14, 22),
  },
  // Belém — short form (no address, just CEP + city)
  {
    nome: "Felipe Rocha",
    whatsapp: "91988776655",
    cep: "66055220",
    endereco: "",
    numero: "",
    complemento: DEMO_TAG,
    bairro: "",
    cidade: "Belém",
    uf: "PA",
    created_at: daysAgo(1, 23, 40),
  },
]

// ---------------------------------------------------------------------------
// 12 banger applications
// ---------------------------------------------------------------------------

interface BangerSeed {
  nome: string
  email: string
  whatsapp: string
  cidade: string
  uf: string
  nicho: string
  redes: { platform: string; handle: string; seguidores: string }[]
  motivacao: string
  status: string
  favorito: boolean
  notas: string
  created_at: string
  updated_at: string | null
}

const BANGER_SEEDS: BangerSeed[] = [
  {
    nome: "Giovanna Castilho",
    email: "gi.castilho@email.com",
    whatsapp: "11987123456",
    cidade: "São Paulo",
    uf: "SP",
    nicho: "nightlife",
    redes: [
      { platform: "instagram", handle: "@gicastilho", seguidores: "128k" },
      { platform: "tiktok", handle: "@gicastilho", seguidores: "340k" },
    ],
    motivacao:
      "Trampo em produção de festas no Cambuci e Augusta há 4 anos. Conheço a vibe da cena e curto comunicar sem roteiro pronto — quando recomendo é porque vivi.",
    status: "novo",
    favorito: true,
    notas: `${DEMO_TAG}`,
    created_at: daysAgo(1, 22, 14),
    updated_at: null,
  },
  {
    nome: "Pedro Henrique Galvão",
    email: "phgalvao@email.com",
    whatsapp: "21996812345",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    nicho: "musica",
    redes: [
      { platform: "instagram", handle: "@phgalvao.dj", seguidores: "76k" },
      { platform: "youtube", handle: "@phgalvao", seguidores: "22k" },
    ],
    motivacao:
      "DJ residente em dois clubes na Zona Sul. Conteúdo focado em sets ao vivo e bastidores. Bang Bang encaixa no que eu bebo na cabine mesmo — zero script.",
    status: "em_conversa",
    favorito: true,
    notas: `${DEMO_TAG} Conversando sobre ativação no Réveillon. Alinhar cachê + produto.`,
    created_at: daysAgo(4, 19, 35),
    updated_at: daysAgo(2, 11, 20),
  },
  {
    nome: "Juliana Mendonça",
    email: "juliana.mendonca@email.com",
    whatsapp: "31988234567",
    cidade: "Belo Horizonte",
    uf: "MG",
    nicho: "gastro",
    redes: [
      { platform: "instagram", handle: "@ju.comebebe", seguidores: "54k" },
    ],
    motivacao:
      "Faço review de bar e botequim mineiro há 3 anos. Meu público já pede RTD nos comentários. Quero levar Bang Bang pra mesa de quem me segue.",
    status: "novo",
    favorito: false,
    notas: DEMO_TAG,
    created_at: daysAgo(2, 15, 10),
    updated_at: null,
  },
  {
    nome: "Caio Tanaka",
    email: "caio.tanaka@email.com",
    whatsapp: "41991567890",
    cidade: "Curitiba",
    uf: "PR",
    nicho: "festival",
    redes: [
      { platform: "instagram", handle: "@caiotanaka", seguidores: "210k" },
      { platform: "tiktok", handle: "@caiotanaka", seguidores: "1.2M" },
      { platform: "youtube", handle: "@caiotanaka", seguidores: "88k" },
    ],
    motivacao:
      "Cobertura de festival é minha marca — Lolla, Primavera, João Rock. Quero um parceiro que entre junto nas trincheiras e não só mande kit.",
    status: "aprovado",
    favorito: true,
    notas: `${DEMO_TAG} Top performer na cobertura do Lolla 2025. Contrato semestral em negociação.`,
    created_at: daysAgo(21, 10, 0),
    updated_at: daysAgo(3, 14, 45),
  },
  {
    nome: "Ana Beatriz Rezende",
    email: "anabia.rezende@email.com",
    whatsapp: "51988776655",
    cidade: "Porto Alegre",
    uf: "RS",
    nicho: "lifestyle",
    redes: [
      { platform: "instagram", handle: "@anabiareze", seguidores: "92k" },
      { platform: "tiktok", handle: "@anabiareze", seguidores: "45k" },
    ],
    motivacao:
      "Conteúdo de dia-a-dia, rolês, amigos, sem filtro. Meu público é exatamente o Bang Bang — 22 a 30, classe B, noite é plano.",
    status: "novo",
    favorito: false,
    notas: DEMO_TAG,
    created_at: daysAgo(3, 20, 50),
    updated_at: null,
  },
  {
    nome: "Diego Sampaio",
    email: "diego.sampaio@email.com",
    whatsapp: "71987654321",
    cidade: "Salvador",
    uf: "BA",
    nicho: "humor",
    redes: [
      { platform: "instagram", handle: "@diegosamp", seguidores: "415k" },
      { platform: "tiktok", handle: "@diegosamp", seguidores: "890k" },
      { platform: "kwai", handle: "@diegosamp", seguidores: "120k" },
    ],
    motivacao:
      "Humor de botequim, linguagem baiana, audiência pesada no Nordeste todo. Sei vender produto sem parecer comercial — aí que tá a graça.",
    status: "em_conversa",
    favorito: false,
    notas: `${DEMO_TAG} Pedir 3 peças-piloto pra avaliar tom antes de fechar.`,
    created_at: daysAgo(6, 17, 22),
    updated_at: daysAgo(4, 9, 15),
  },
  {
    nome: "Marina Vieira",
    email: "marina.vieira@email.com",
    whatsapp: "48999887766",
    cidade: "Florianópolis",
    uf: "SC",
    nicho: "esporte",
    redes: [
      { platform: "instagram", handle: "@marinavieirasurf", seguidores: "68k" },
      { platform: "youtube", handle: "@marinavieira", seguidores: "15k" },
    ],
    motivacao:
      "Surf, praia, pôr do sol e aquela cerveja pós-sessão. O que rola depois do mar é onde a Bang Bang encaixa. Público fiel no litoral catarinense.",
    status: "novo",
    favorito: false,
    notas: DEMO_TAG,
    created_at: daysAgo(5, 18, 40),
    updated_at: null,
  },
  {
    nome: "Rodrigo Piovesan",
    email: "rodrigo.piovesan@email.com",
    whatsapp: "11996543210",
    cidade: "São Paulo",
    uf: "SP",
    nicho: "nightlife",
    redes: [
      { platform: "instagram", handle: "@rodrigopv", seguidores: "38k" },
    ],
    motivacao:
      "Trabalho com produção de festa underground em SP. Público pequeno mas altamente engajado — 8% de engagement médio.",
    status: "rejeitado",
    favorito: false,
    notas: `${DEMO_TAG} Audiência pequena demais pro ticket proposto. Revisitar em 6 meses.`,
    created_at: daysAgo(15, 14, 30),
    updated_at: daysAgo(10, 11, 0),
  },
  {
    nome: "Isadora Campos",
    email: "isa.campos@email.com",
    whatsapp: "85991334455",
    cidade: "Fortaleza",
    uf: "CE",
    nicho: "moda",
    redes: [
      { platform: "instagram", handle: "@isacampos", seguidores: "156k" },
      { platform: "tiktok", handle: "@isacampos", seguidores: "230k" },
    ],
    motivacao:
      "Conteúdo de moda praia + nightlife no Nordeste. Já fechei com marca de cosmético e calçado — quero entrar em bebida agora e Bang Bang é a mais interessante do mercado.",
    status: "novo",
    favorito: true,
    notas: DEMO_TAG,
    created_at: daysAgo(1, 16, 2),
    updated_at: null,
  },
  {
    nome: "Lucas Okamoto",
    email: "lucas.okamoto@email.com",
    whatsapp: "11987003322",
    cidade: "São Paulo",
    uf: "SP",
    nicho: "musica",
    redes: [
      { platform: "instagram", handle: "@lucasoka", seguidores: "520k" },
      { platform: "youtube", handle: "@lucasoka", seguidores: "180k" },
      { platform: "twitch", handle: "@lucasoka", seguidores: "45k" },
    ],
    motivacao:
      "Produtor musical + criador de conteúdo. Bastidor de estúdio, sessão com artista, tudo raw. Parcerias alinhadas com o estilo de vida do público.",
    status: "parceiro",
    favorito: true,
    notas: `${DEMO_TAG} Parceiro ativo desde o lançamento. Renovação 2026 em análise — propor exclusividade RTD.`,
    created_at: daysAgo(45, 10, 0),
    updated_at: daysAgo(7, 15, 30),
  },
  {
    nome: "Camila Barros",
    email: "camila.barros@email.com",
    whatsapp: "61988223344",
    cidade: "Brasília",
    uf: "DF",
    nicho: "lifestyle",
    redes: [
      { platform: "instagram", handle: "@camibarros", seguidores: "84k" },
      { platform: "tiktok", handle: "@camibarros", seguidores: "62k" },
    ],
    motivacao:
      "Conteúdo sobre viver em Brasília — bares de quadra, happy hour de servidor, fim de semana no clube. Audiência local fortíssima.",
    status: "em_conversa",
    favorito: false,
    notas: `${DEMO_TAG} Pedir proposta formal com números.`,
    created_at: daysAgo(8, 19, 12),
    updated_at: daysAgo(5, 16, 0),
  },
  {
    nome: "Fernando Queiroz",
    email: "fernando.queiroz@email.com",
    whatsapp: "81996887744",
    cidade: "Recife",
    uf: "PE",
    nicho: "outro",
    redes: [
      { platform: "x", handle: "@fequeiroz", seguidores: "32k" },
      { platform: "instagram", handle: "@fequeiroz", seguidores: "18k" },
    ],
    motivacao:
      "Faço threads sobre cultura pop e bebida no X. Público pequeno mas altamente qualificado — tipo Bang Bang encaixa perfeito no meu eixo irônico.",
    status: "novo",
    favorito: false,
    notas: DEMO_TAG,
    created_at: daysAgo(2, 23, 58),
    updated_at: null,
  },
]

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function cleanDemoRows() {
  console.log("[clean] removing previous demo rows…")

  // wishlist — complemento always contains the tag for demo rows
  const { error: wErr, count: wCount } = await supabase
    .from("wishlist_requests")
    .delete({ count: "exact" })
    .ilike("complemento", `%${DEMO_TAG}%`)

  if (wErr) console.error("[clean] wishlist error:", wErr.message)
  else console.log(`[clean] wishlist: removed ${wCount ?? 0} rows`)

  // bangers — notas always contains the tag
  const { error: bErr, count: bCount } = await supabase
    .from("bangers")
    .delete({ count: "exact" })
    .ilike("notas", `%${DEMO_TAG}%`)

  if (bErr) console.error("[clean] bangers error:", bErr.message)
  else console.log(`[clean] bangers: removed ${bCount ?? 0} rows`)
}

async function seed() {
  if (CLEAN_FIRST) await cleanDemoRows()
  if (CLEAN_ONLY) return

  console.log(`[seed] inserting ${WISHLIST_SEEDS.length} wishlist_requests…`)
  const { error: wErr } = await supabase.from("wishlist_requests").insert(WISHLIST_SEEDS)
  if (wErr) {
    console.error("[seed] wishlist error:", wErr.message)
    process.exit(1)
  }
  console.log(`[seed] wishlist: ok`)

  console.log(`[seed] inserting ${BANGER_SEEDS.length} bangers…`)
  // DB has NOT NULL on updated_at — fall back to created_at for untouched rows.
  const bangersPayload = BANGER_SEEDS.map((b) => ({
    ...b,
    updated_at: b.updated_at ?? b.created_at,
  }))
  const { error: bErr } = await supabase.from("bangers").insert(bangersPayload)
  if (bErr) {
    console.error("[seed] bangers error:", bErr.message)
    process.exit(1)
  }
  console.log(`[seed] bangers: ok`)

  console.log("[seed] done.")
}

seed().catch((err) => {
  console.error("[seed] fatal:", err)
  process.exit(1)
})
