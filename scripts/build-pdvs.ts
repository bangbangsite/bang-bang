/**
 * Reads data/pdvs_bang_bang.xlsx (aba "PDVs") → enriches Tier B via ViaCEP,
 * geocodes Tier A+B via Nominatim, computes Tier C city center, and emits:
 *   - src/data/pdvs.json
 *   - src/data/pdvs-active-ufs.json
 *   - src/data/pdvs-meta.json
 *
 * Caches at data/.viacep-cache.json and data/.geocoding-cache.json.
 * Runs ViaCEP and Nominatim concurrently (separate rate limiters at 1 req/s).
 *
 * Usage:
 *   npm run pdvs:refresh              # full run
 *   npm run pdvs:refresh -- --limit 10  # dry-run on first 10 rows
 *   npm run pdvs:refresh -- --no-net   # cache-only, no network (CI-safe)
 */
import * as fs from "node:fs"
import * as path from "node:path"
import * as XLSX from "xlsx"
import type {
  PDV,
  PDVTipo,
  PDVsByUF,
  PDVsMeta,
  Tier,
  UF,
} from "../src/lib/types/pdv"

const ROOT = path.resolve(__dirname, "..")
const XLSX_PATH = path.join(ROOT, "data", "pdvs_bang_bang.xlsx")
const OUT_DIR = path.join(ROOT, "src", "data")
const VIACEP_CACHE = path.join(ROOT, "data", ".viacep-cache.json")
const GEOCODE_CACHE = path.join(ROOT, "data", ".geocoding-cache.json")
const SHEET = "PDVs"

const USER_AGENT =
  "BangBangSiteBuilder/1.0 (contato: grupoaccellera@gmail.com)"

// -----------------------------
// Parse CLI flags
// -----------------------------
const args = process.argv.slice(2)
function flag(name: string): number | boolean | null {
  const i = args.indexOf(name)
  if (i === -1) return null
  const next = args[i + 1]
  if (next && !next.startsWith("--")) return Number(next)
  return true
}
const LIMIT = typeof flag("--limit") === "number" ? (flag("--limit") as number) : null
const NO_NET = flag("--no-net") === true
/** Skip Nominatim geocoding entirely. mapsUrl will use text-based Google Maps search. */
const SKIP_GEOCODE = flag("--skip-geocode") === true || flag("--skip-geo") === true

// -----------------------------
// Constants
// -----------------------------
const VALID_UFS: ReadonlySet<UF> = new Set<UF>([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
])

const TIPO_MAP: Record<string, PDVTipo> = {
  "bar": "Bar",
  "restaurante": "Restaurante",
  "casa noturna": "Casa Noturna",
  "balada": "Casa Noturna",
  "mercado": "Mercado",
  "supermercado": "Mercado",
  "conveniência": "Conveniência",
  "conveniencia": "Conveniência",
  "distribuidora": "Distribuidora",
  "distribuidor": "Distribuidora",
  "rooftop": "Rooftop",
}

// -----------------------------
// Utils
// -----------------------------
type RawRow = Record<string, unknown>

function s(v: unknown): string {
  if (v === null || v === undefined) return ""
  return String(v).trim()
}
function orNull(v: unknown): string | null {
  const t = s(v)
  return t.length > 0 ? t : null
}
function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."))
  return Number.isFinite(n) ? n : null
}
function normalizeTipo(raw: string): PDVTipo {
  const key = raw.toLowerCase().trim()
  return TIPO_MAP[key] ?? "Outros"
}
function isAtivo(v: unknown): boolean {
  const t = s(v).toUpperCase()
  return t === "SIM" || t === "S" || t === "TRUE" || t === "1"
}
function normalizeTier(raw: string): Tier | null {
  const t = raw.toUpperCase().trim()
  if (t === "A" || t === "B" || t === "C") return t
  return null
}

/**
 * Valida telefone brasileiro: 10 dígitos (fixo 2-5 prefix) ou 11 dígitos (móvel 9 prefix).
 * PDV-0193 "(55) 31988-5967" cai aqui — 9 dígitos após DDD começando com 3 → inválido.
 */
function validPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 10 || digits.length > 11) return null
  const rest = digits.slice(2)
  if (rest.length === 9 && !rest.startsWith("9")) return null
  if (rest.length === 8 && !/^[2-5]/.test(rest)) return null
  return raw
}

function loadCache<T>(file: string): Record<string, T> {
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, T>
  } catch {
    return {}
  }
}
function saveCache<T>(file: string, data: Record<string, T>) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

// -----------------------------
// Rate-limited queue (one per endpoint)
// -----------------------------
class Queue {
  private lastAt = 0
  constructor(private readonly minGapMs: number) {}
  async next<T>(fn: () => Promise<T>): Promise<T> {
    const wait = this.lastAt + this.minGapMs - Date.now()
    if (wait > 0) await sleep(wait)
    this.lastAt = Date.now()
    return fn()
  }
}

// -----------------------------
// ViaCEP
// -----------------------------
interface ViaCEPHit {
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
  _ts: number
}

async function viaCEPLookup(
  cepDigits: string,
  cache: Record<string, ViaCEPHit>,
  queue: Queue,
): Promise<ViaCEPHit> {
  if (cache[cepDigits]) return cache[cepDigits]
  if (NO_NET) {
    const miss: ViaCEPHit = { erro: true, _ts: Date.now() }
    cache[cepDigits] = miss
    return miss
  }
  return queue.next(async () => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
        headers: { "User-Agent": USER_AGENT },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Omit<ViaCEPHit, "_ts">
      const hit: ViaCEPHit = { ...data, _ts: Date.now() }
      cache[cepDigits] = hit
      return hit
    } catch {
      const miss: ViaCEPHit = { erro: true, _ts: Date.now() }
      cache[cepDigits] = miss
      return miss
    }
  })
}

// -----------------------------
// Nominatim
// -----------------------------
interface GeoHit {
  lat: number | null
  lng: number | null
  source: "nominatim" | "nominatim-city" | "cache-miss" | "skipped"
  _ts: number
}

function geoKey(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim()
}

async function geocode(
  query: string,
  cache: Record<string, GeoHit>,
  queue: Queue,
): Promise<GeoHit> {
  const key = geoKey(query)
  if (cache[key]) return cache[key]
  if (NO_NET) {
    const miss: GeoHit = { lat: null, lng: null, source: "cache-miss", _ts: Date.now() }
    cache[key] = miss
    return miss
  }
  return queue.next(async () => {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search")
      url.searchParams.set("q", query)
      url.searchParams.set("format", "json")
      url.searchParams.set("countrycodes", "br")
      url.searchParams.set("limit", "1")
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const arr = (await res.json()) as Array<{ lat: string; lon: string }>
      if (arr.length === 0) {
        const miss: GeoHit = { lat: null, lng: null, source: "nominatim", _ts: Date.now() }
        cache[key] = miss
        return miss
      }
      const hit: GeoHit = {
        lat: Number(arr[0].lat),
        lng: Number(arr[0].lon),
        source: "nominatim",
        _ts: Date.now(),
      }
      cache[key] = hit
      return hit
    } catch {
      const miss: GeoHit = { lat: null, lng: null, source: "cache-miss", _ts: Date.now() }
      cache[key] = miss
      return miss
    }
  })
}

// -----------------------------
// Main
// -----------------------------
interface ParsedRow {
  raw: RawRow
  id: string
  nome: string
  tipo: PDVTipo
  tier: Tier
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: UF
  cep: string
  telefone: string | null
  horario: string | null
  mapsUrl: string | null
  deliveryUrl: string | null
  representante: string | null
  observacoes: string | null
  lat: number | null
  lng: number | null
  enriched: boolean
}

function parseRow(row: RawRow, idx: number): ParsedRow | null {
  const uf = s(row["UF"]).toUpperCase() as UF
  if (!VALID_UFS.has(uf)) {
    console.warn(`[build-pdvs] linha ${idx + 2}: UF inválida "${row["UF"]}", ignorada`)
    return null
  }
  const nome = s(row["Nome do Estabelecimento"])
  if (!nome) {
    console.warn(`[build-pdvs] linha ${idx + 2}: Nome vazio, ignorada`)
    return null
  }
  const tier = normalizeTier(s(row["tier"] ?? row["Tier"]))
  if (!tier) {
    console.warn(`[build-pdvs] linha ${idx + 2}: tier inválido, ignorada`)
    return null
  }
  const telRaw = s(row["Telefone"])
  const phone = telRaw ? validPhone(telRaw) : null

  return {
    raw: row,
    id: s(row["ID"]) || `pdv-${idx}`,
    nome,
    tipo: normalizeTipo(s(row["Tipo"])),
    tier,
    endereco: s(row["Endereço"]),
    numero: s(row["Número"]),
    complemento: s(row["Complemento"]),
    bairro: s(row["Bairro"]),
    cidade: s(row["Cidade"]),
    uf,
    cep: s(row["CEP"]).replace(/\D/g, ""),
    telefone: phone,
    horario: orNull(row["Horário de Funcionamento"]),
    mapsUrl: orNull(row["Link Google Maps"]),
    deliveryUrl: orNull(row["Link Delivery"]),
    representante: orNull(row["Representante Responsável"]),
    observacoes: orNull(row["Observações"]),
    lat: numOrNull(row["Latitude"]),
    lng: numOrNull(row["Longitude"]),
    enriched: false,
  }
}

function geoQuery(p: ParsedRow, viaCep: ViaCEPHit | null): string {
  if (p.tier === "C") return `${p.cidade}, ${p.uf}, Brasil`
  const rua = (viaCep?.logradouro ?? p.endereco).trim()
  const num = p.numero
  const base = [rua && num ? `${rua}, ${num}` : rua, p.bairro, `${p.cidade}, ${p.uf}`]
    .filter((x) => x && x.length > 0)
    .join(", ")
  return `${base}, Brasil`
}

async function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`[build-pdvs] arquivo não encontrado: ${XLSX_PATH}`)
    process.exit(1)
  }

  console.log(`[build-pdvs] lendo ${XLSX_PATH}…`)
  const wb = XLSX.readFile(XLSX_PATH)
  if (!wb.SheetNames.includes(SHEET)) {
    console.error(`[build-pdvs] aba "${SHEET}" não encontrada. Abas: ${wb.SheetNames.join(", ")}`)
    process.exit(1)
  }
  const rows = XLSX.utils.sheet_to_json<RawRow>(wb.Sheets[SHEET], { defval: "" })
  console.log(`[build-pdvs] ${rows.length} linhas brutas`)

  const ativos = rows.filter((r) => isAtivo(r["Ativo"] ?? r["Ativo (SIM/NAO)"]))
  console.log(`[build-pdvs] ${ativos.length} com Ativo=SIM`)

  const limit = LIMIT !== null ? Math.min(LIMIT, ativos.length) : ativos.length
  const scope = ativos.slice(0, limit)
  if (LIMIT !== null) console.log(`[build-pdvs] modo --limit ${LIMIT}: processando ${scope.length}`)

  const parsed: ParsedRow[] = []
  let skipped = 0
  for (let i = 0; i < scope.length; i++) {
    const p = parseRow(scope[i], i)
    if (p) parsed.push(p)
    else skipped++
  }
  console.log(`[build-pdvs] ${parsed.length} parseadas (${skipped} skip)`)

  const byTierCount = parsed.reduce<Record<Tier, number>>(
    (acc, p) => ((acc[p.tier] = (acc[p.tier] ?? 0) + 1), acc),
    { A: 0, B: 0, C: 0 },
  )
  console.log(`[build-pdvs] tier A=${byTierCount.A} B=${byTierCount.B} C=${byTierCount.C}`)

  // Load caches
  const viacepCache = loadCache<ViaCEPHit>(VIACEP_CACHE)
  const geoCache = loadCache<GeoHit>(GEOCODE_CACHE)
  const viacepInitial = Object.keys(viacepCache).length
  const geoInitial = Object.keys(geoCache).length
  console.log(`[build-pdvs] cache: viacep=${viacepInitial} geocoding=${geoInitial}`)

  const viacepQueue = new Queue(1000) // 1 req/s
  const geocodeQueue = new Queue(1000) // 1 req/s

  // Phase 1: ViaCEP enrichment for Tier B (concurrent with Phase 2 below)
  const needsViacep = parsed.filter((p) => p.tier === "B" && p.cep.length === 8)
  console.log(`[build-pdvs] ViaCEP: ${needsViacep.length} CEPs pra buscar (já em cache muitos)`)

  let viacepHits = 0
  let viacepMisses = 0
  let viacepDone = 0
  const viacepResults = new Map<string, ViaCEPHit>()
  await Promise.all(
    needsViacep.map(async (p) => {
      const hit = await viaCEPLookup(p.cep, viacepCache, viacepQueue)
      viacepResults.set(p.id, hit)
      viacepDone++
      if (hit.erro) viacepMisses++
      else viacepHits++
      if (viacepDone % 50 === 0 || viacepDone === needsViacep.length) {
        console.log(`[build-pdvs] viacep progress ${viacepDone}/${needsViacep.length}`)
      }
    }),
  )

  // Apply enrichment to parsed rows (sync, no I/O)
  for (const p of parsed) {
    if (p.tier !== "B") continue
    const hit = viacepResults.get(p.id)
    if (!hit || hit.erro) {
      p.enriched = false
      continue
    }
    if (hit.logradouro && hit.logradouro.trim().length > 0) {
      p.endereco = hit.logradouro
      if (!p.bairro && hit.bairro) p.bairro = hit.bairro
      p.enriched = true
    } else {
      p.enriched = false
    }
  }

  let geoHits = 0
  let geoMisses = 0
  if (SKIP_GEOCODE) {
    console.log(`[build-pdvs] --skip-geocode: pulando Nominatim; lat/lng ficam null e mapsUrl usa busca por texto`)
    for (const p of parsed) {
      if (p.lat !== null && p.lng !== null) geoHits++
      else geoMisses++
    }
  } else {
    // Phase 2a: Full-address geocoding (Tier C uses city-only query — Phase 2b fills misses)
    console.log(`[build-pdvs] Geocoding phase A: ${parsed.length} endereços completos`)
    let geoDone = 0
    await Promise.all(
      parsed.map(async (p) => {
        if (p.lat !== null && p.lng !== null) {
          geoDone++
          return
        }
        const q = geoQuery(p, viacepResults.get(p.id) ?? null)
        const hit = await geocode(q, geoCache, geocodeQueue)
        if (hit.lat !== null && hit.lng !== null) {
          p.lat = hit.lat
          p.lng = hit.lng
        }
        geoDone++
        if (geoDone % 100 === 0 || geoDone === parsed.length) {
          console.log(`[build-pdvs] geocode A progress ${geoDone}/${parsed.length}`)
        }
      }),
    )
    const afterA = parsed.filter((p) => p.lat !== null && p.lng !== null).length
    console.log(`[build-pdvs] phase A: ${afterA} com coords precisas, ${parsed.length - afterA} pra fallback`)

    // Phase 2b: City centroid fallback
    const needCity = parsed.filter((p) => p.lat === null || p.lng === null)
    const uniqueCities = new Map<string, { cidade: string; uf: UF }>()
    for (const p of needCity) {
      const key = `${p.cidade}|${p.uf}`.toLowerCase()
      if (!uniqueCities.has(key) && p.cidade) uniqueCities.set(key, { cidade: p.cidade, uf: p.uf })
    }
    console.log(`[build-pdvs] Geocoding phase B: ${uniqueCities.size} cidades únicas (centroides)`)
    const cityCentroids = new Map<string, { lat: number | null; lng: number | null }>()
    let cityDone = 0
    await Promise.all(
      [...uniqueCities.values()].map(async ({ cidade, uf }) => {
        const query = `${cidade}, ${uf}, Brasil`
        const hit = await geocode(query, geoCache, geocodeQueue)
        cityCentroids.set(`${cidade}|${uf}`.toLowerCase(), { lat: hit.lat, lng: hit.lng })
        cityDone++
        if (cityDone % 20 === 0 || cityDone === uniqueCities.size) {
          console.log(`[build-pdvs] geocode B progress ${cityDone}/${uniqueCities.size}`)
        }
      }),
    )
    let geoCityHits = 0
    for (const p of needCity) {
      const centroid = cityCentroids.get(`${p.cidade}|${p.uf}`.toLowerCase())
      if (centroid && centroid.lat !== null && centroid.lng !== null) {
        p.lat = centroid.lat
        p.lng = centroid.lng
        geoCityHits++
      }
    }
    geoHits = parsed.filter((p) => p.lat !== null && p.lng !== null).length
    geoMisses = parsed.length - geoHits
    console.log(
      `[build-pdvs] phase B: +${geoCityHits} via centroide. Total com coords: ${geoHits} / miss: ${geoMisses}`,
    )
  }

  // Persist caches
  saveCache(VIACEP_CACHE, viacepCache)
  saveCache(GEOCODE_CACHE, geoCache)
  console.log(
    `[build-pdvs] cache final: viacep=${Object.keys(viacepCache).length} (+${
      Object.keys(viacepCache).length - viacepInitial
    }) geocoding=${Object.keys(geoCache).length} (+${Object.keys(geoCache).length - geoInitial})`,
  )

  // Build final PDV records + mapsUrl fallback.
  // Priority: xlsx-provided > lat/lng coords > text search (always works, even without geocoding).
  const pdvs: PDV[] = parsed.map((p) => {
    let mapsUrl = p.mapsUrl
    if (!mapsUrl && p.lat !== null && p.lng !== null) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
    }
    if (!mapsUrl) {
      const addressText =
        p.tier === "C"
          ? `${p.cidade}, ${p.uf}, Brasil`
          : [
              [p.endereco, p.numero].filter(Boolean).join(", "),
              p.bairro,
              `${p.cidade}, ${p.uf}`,
              "Brasil",
            ]
              .filter((x) => x && x.length > 0)
              .join(", ")
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`
    }
    return {
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      tier: p.tier,
      endereco: p.endereco,
      numero: p.numero,
      complemento: p.complemento,
      bairro: p.bairro,
      cidade: p.cidade,
      uf: p.uf,
      cep: p.cep,
      lat: p.lat,
      lng: p.lng,
      telefone: p.telefone,
      horario: p.horario,
      mapsUrl,
      deliveryUrl: p.deliveryUrl,
      representante: p.representante,
      observacoes: p.observacoes,
      enriched: p.enriched,
    }
  })

  // Aggregate
  const ufMap = new Map<UF, number>()
  for (const p of pdvs) ufMap.set(p.uf, (ufMap.get(p.uf) ?? 0) + 1)
  const activeUfs: PDVsByUF[] = [...ufMap.entries()]
    .map(([uf, count]) => ({ uf, count }))
    .sort((a, b) => a.uf.localeCompare(b.uf))

  const tipoMap = new Map<PDVTipo, number>()
  for (const p of pdvs) tipoMap.set(p.tipo, (tipoMap.get(p.tipo) ?? 0) + 1)
  const byTipo = [...tipoMap.entries()]
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count)

  const byTier = (["A", "B", "C"] as Tier[])
    .map((tier) => ({ tier, count: pdvs.filter((p) => p.tier === tier).length }))
    .filter((x) => x.count > 0)

  const meta: PDVsMeta = {
    total: pdvs.length,
    byUF: activeUfs,
    byTier,
    byTipo,
    generatedAt: new Date().toISOString(),
    source: {
      file: path.relative(ROOT, XLSX_PATH),
      sheet: SHEET,
      rawRows: rows.length,
      activeRows: ativos.length,
      skipped,
    },
    enrichment: { viacepHits, viacepMisses, geocodeHits: geoHits, geocodeMisses: geoMisses },
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, "pdvs.json"), JSON.stringify(pdvs, null, 2))
  fs.writeFileSync(path.join(OUT_DIR, "pdvs-active-ufs.json"), JSON.stringify(activeUfs, null, 2))
  fs.writeFileSync(path.join(OUT_DIR, "pdvs-meta.json"), JSON.stringify(meta, null, 2))

  console.log(`\n[build-pdvs] ═══ resumo ═══`)
  console.log(`[build-pdvs] ✓ ${pdvs.length} PDVs em ${activeUfs.length} UFs`)
  console.log(`[build-pdvs] ✓ tier: A=${byTier.find((t) => t.tier === "A")?.count ?? 0}, B=${byTier.find((t) => t.tier === "B")?.count ?? 0}, C=${byTier.find((t) => t.tier === "C")?.count ?? 0}`)
  console.log(`[build-pdvs] ✓ viacep: ${viacepHits} hits / ${viacepMisses} misses`)
  console.log(`[build-pdvs] ✓ geocoding: ${geoHits} hits / ${geoMisses} misses`)
  console.log(`[build-pdvs] ✓ escrito em ${path.relative(ROOT, OUT_DIR)}`)
}

main().catch((err) => {
  console.error("[build-pdvs] fatal:", err)
  process.exit(1)
})
