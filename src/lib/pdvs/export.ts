/**
 * Export the current PDV list to an .xlsx file that mirrors the column
 * layout of data/pdvs_bang_bang.xlsx (aba "PDVs"). The output can be re-used
 * as input for the build pipeline — round-trip friendly.
 *
 * Uses a dynamic import of `xlsx` so the library only ships to the browser
 * when the user actually clicks Exportar.
 */
import type { PDV } from "@/lib/types/pdv"
import type { PDVOverrides } from "./overrides"

const COLUMNS = [
  "tier",
  "ID",
  "Nome do Estabelecimento",
  "Tipo",
  "Endereço",
  "Número",
  "Bairro",
  "Cidade",
  "UF",
  "CEP",
  "Complemento",
  "Latitude",
  "Longitude",
  "Telefone",
  "Horário de Funcionamento",
  "Link Google Maps",
  "Link Delivery",
  "Ativo",
  "Representante Responsável",
  "Observações",
  "Data de Cadastro",
] as const

type Row = Record<(typeof COLUMNS)[number], string | number>

function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "")
  if (digits.length !== 8) return cep
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function formatDate(iso: string | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function pdvToRow(pdv: PDV, createdAt?: string): Row {
  return {
    tier: pdv.tier,
    ID: pdv.id,
    "Nome do Estabelecimento": pdv.nome,
    Tipo: pdv.tipo,
    Endereço: pdv.endereco,
    Número: pdv.numero,
    Bairro: pdv.bairro,
    Cidade: pdv.cidade,
    UF: pdv.uf,
    CEP: formatCep(pdv.cep),
    Complemento: pdv.complemento,
    Latitude: pdv.lat ?? "",
    Longitude: pdv.lng ?? "",
    Telefone: pdv.telefone ?? "",
    "Horário de Funcionamento": pdv.horario ?? "",
    "Link Google Maps": pdv.mapsUrl ?? "",
    "Link Delivery": pdv.deliveryUrl ?? "",
    Ativo: "SIM",
    "Representante Responsável": pdv.representante ?? "",
    Observações: pdv.observacoes ?? "",
    "Data de Cadastro": formatDate(createdAt),
  }
}

export function buildExportFilename(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `pdvs-bang-bang-${yyyy}-${mm}-${dd}-${hh}${mi}.xlsx`
}

export async function exportPDVsToXLSX(
  pdvs: readonly PDV[],
  overrides: PDVOverrides,
  filename: string = buildExportFilename(),
): Promise<void> {
  const XLSX = await import("xlsx")

  const rows = pdvs.map((p) => pdvToRow(p, overrides.createdAt[p.id]))
  const ws = XLSX.utils.json_to_sheet(rows, { header: [...COLUMNS] })

  // Column widths for readability when opened in Excel.
  ws["!cols"] = COLUMNS.map((col) => ({
    wch: Math.max(col.length + 2, 14),
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "PDVs")
  XLSX.writeFile(wb, filename)
}
