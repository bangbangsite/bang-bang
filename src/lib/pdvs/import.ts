/**
 * Parses an .xlsx upload into a preview of what would be added / updated /
 * skipped. The caller then confirms and applies the changes via the usePDVs
 * hook so everything flows through the same override store.
 *
 * The expected schema mirrors the export format (same columns in any order).
 */
import type { PDV, PDVTipo, Tier, UF } from "@/lib/types/pdv"

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
  "outros": "Outros",
}

type RawRow = Record<string, unknown>

export interface ImportSkip {
  row: number
  reason: string
  nome?: string
}

export interface ImportPreview {
  filename: string
  totalRows: number
  toAdd: PDV[]
  toUpdate: Array<{ id: string; nome: string; patch: Partial<PDV> }>
  skipped: ImportSkip[]
}

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
function normalizeTier(raw: string): Tier {
  const t = raw.toUpperCase().trim()
  if (t === "A" || t === "B" || t === "C") return t
  return "B"
}
function isAtivo(v: unknown): boolean {
  const t = s(v).toUpperCase()
  if (t === "") return true // if the column is missing, assume active
  return t === "SIM" || t === "S" || t === "TRUE" || t === "1"
}

function genLocalId(): string {
  const n = Math.floor(Math.random() * 900000) + 100000
  return `LOCAL-${n}`
}

// Pick the first non-empty value among the provided column-name aliases.
function pick(row: RawRow, ...aliases: string[]): unknown {
  for (const a of aliases) {
    if (Object.hasOwn(row, a)) {
      const v = row[a]
      if (v !== "" && v !== null && v !== undefined) return v
    }
  }
  return ""
}

function parseRow(
  row: RawRow,
  rowIndex: number,
  existingIds: ReadonlySet<string>,
): { kind: "add"; pdv: PDV } | { kind: "update"; id: string; patch: Partial<PDV> } | { kind: "skip"; reason: string; nome?: string } {
  if (!isAtivo(pick(row, "Ativo", "ativo"))) {
    return { kind: "skip", reason: "linha marcada como Ativo=NAO" }
  }

  const uf = s(pick(row, "UF", "uf")).toUpperCase() as UF
  const nome = s(pick(row, "Nome do Estabelecimento", "Nome", "nome"))
  const cidade = s(pick(row, "Cidade", "cidade"))

  if (!nome) return { kind: "skip", reason: "nome ausente" }
  if (!VALID_UFS.has(uf)) return { kind: "skip", reason: `UF inválida (${uf || "vazia"})`, nome }
  if (!cidade) return { kind: "skip", reason: "cidade ausente", nome }

  const rawId = s(pick(row, "ID", "id"))
  const id = rawId || genLocalId()
  const tier = normalizeTier(s(pick(row, "tier", "Tier")))

  const pdv: PDV = {
    id,
    nome,
    tipo: normalizeTipo(s(pick(row, "Tipo", "tipo"))),
    tier,
    endereco: s(pick(row, "Endereço", "Endereco", "endereco")),
    numero: s(pick(row, "Número", "Numero", "numero")),
    complemento: s(pick(row, "Complemento", "complemento")),
    bairro: s(pick(row, "Bairro", "bairro")),
    cidade,
    uf,
    cep: s(pick(row, "CEP", "cep")).replace(/\D/g, ""),
    lat: numOrNull(pick(row, "Latitude", "lat")),
    lng: numOrNull(pick(row, "Longitude", "lng")),
    telefone: orNull(pick(row, "Telefone", "telefone")),
    horario: orNull(pick(row, "Horário de Funcionamento", "Horario", "horario")),
    mapsUrl: orNull(pick(row, "Link Google Maps", "mapsUrl")),
    deliveryUrl: orNull(pick(row, "Link Delivery", "deliveryUrl")),
    representante: orNull(pick(row, "Representante Responsável", "Representante", "representante")),
    observacoes: orNull(pick(row, "Observações", "Observacoes", "observacoes")),
    enriched: false,
  }

  if (existingIds.has(id) && rawId) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _dropId, ...patch } = pdv
    return { kind: "update", id, patch }
  }
  return { kind: "add", pdv }
}

export async function parseXLSX(
  file: File,
  existingIds: ReadonlySet<string>,
): Promise<ImportPreview> {
  const XLSX = await import("xlsx")
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: "array" })
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase() === "pdvs") ?? wb.SheetNames[0]
  if (!sheetName) {
    throw new Error("Planilha sem abas.")
  }
  const ws = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: "" })

  const toAdd: PDV[] = []
  const toUpdate: ImportPreview["toUpdate"] = []
  const skipped: ImportSkip[] = []

  for (let i = 0; i < rows.length; i++) {
    const result = parseRow(rows[i], i, existingIds)
    if (result.kind === "add") toAdd.push(result.pdv)
    else if (result.kind === "update")
      toUpdate.push({
        id: result.id,
        nome: s(result.patch.nome ?? ""),
        patch: result.patch,
      })
    else
      skipped.push({
        row: i + 2, // +2: +1 for header, +1 for 1-based display
        reason: result.reason,
        nome: result.nome,
      })
  }

  return {
    filename: file.name,
    totalRows: rows.length,
    toAdd,
    toUpdate,
    skipped,
  }
}
