export type UF =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO"
  | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI"
  | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO"

export type PDVTipo =
  | "Bar"
  | "Restaurante"
  | "Casa Noturna"
  | "Mercado"
  | "Conveniência"
  | "Distribuidora"
  | "Rooftop"
  | "Outros"

/**
 * A: endereço completo, vai direto pro site.
 * B: tem CEP+número, logradouro enriquecido via ViaCEP em build-time.
 * C: tem cidade+UF mas falta CEP/número — exibido só no nível da cidade.
 */
export type Tier = "A" | "B" | "C"

export interface PDV {
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
  lat: number | null
  lng: number | null
  telefone: string | null
  horario: string | null
  mapsUrl: string | null
  deliveryUrl: string | null
  representante: string | null
  observacoes: string | null
  /** true = endereço foi enriquecido via ViaCEP. false = ficou como veio do xlsx. */
  enriched: boolean
}

export interface PDVsByUF {
  uf: UF
  count: number
}

export interface PDVsMeta {
  total: number
  byUF: PDVsByUF[]
  byTier: { tier: Tier; count: number }[]
  byTipo: { tipo: PDVTipo; count: number }[]
  generatedAt: string
  source: {
    file: string
    sheet: string
    rawRows: number
    activeRows: number
    skipped: number
  }
  enrichment: {
    viacepHits: number
    viacepMisses: number
    geocodeHits: number
    geocodeMisses: number
  }
}
