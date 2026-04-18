/**
 * Demo seed — 10 example wishlist requests spread across a handful of cities
 * so the ranking widget shows a realistic distribution (ties, singletons,
 * a clear top-3). Seeded once per browser via a flag in localStorage; if
 * the staff clears everything, the seed does NOT come back — that's
 * intentional so real data isn't mixed with fakes.
 */

import type { CityRequest } from "./config"

const DEMO_SEED_FLAG = "bb_wishlist_demo_seeded"

/** Offsets in minutes from "now" — newest first. */
const OFFSETS_MIN = [12, 95, 260, 420, 780, 1440, 2880, 3600, 5040, 6720]

/** Stable IDs so React keys don't thrash if the list is re-rendered. */
const DEMO_REQUESTS: Omit<CityRequest, "createdAt">[] = [
  {
    id: "req-demo-salvador-01",
    nome: "Mariana Costa",
    whatsapp: "(71) 98765-4321",
    cep: "40020300",
    endereco: "Rua do Comércio",
    numero: "212",
    complemento: "",
    bairro: "Pelourinho",
    cidade: "Salvador",
    uf: "BA",
  },
  {
    id: "req-demo-salvador-02",
    nome: "Tiago Ferreira",
    whatsapp: "(71) 99111-2233",
    cep: "40110440",
    endereco: "Av. Sete de Setembro",
    numero: "1480",
    complemento: "apto 502",
    bairro: "Vitória",
    cidade: "Salvador",
    uf: "BA",
  },
  {
    id: "req-demo-salvador-03",
    nome: "Rebeca Andrade",
    whatsapp: "(71) 98822-7711",
    cep: "40060010",
    endereco: "Rua Chile",
    numero: "45",
    complemento: "",
    bairro: "Centro",
    cidade: "Salvador",
    uf: "BA",
  },
  {
    id: "req-demo-curitiba-01",
    nome: "Juliano Schmitt",
    whatsapp: "(41) 99876-5432",
    cep: "80020310",
    endereco: "Rua XV de Novembro",
    numero: "880",
    complemento: "",
    bairro: "Centro",
    cidade: "Curitiba",
    uf: "PR",
  },
  {
    id: "req-demo-curitiba-02",
    nome: "Camila Oliveira",
    whatsapp: "(41) 98111-2233",
    cep: "80240000",
    endereco: "Alameda Dr. Carlos de Carvalho",
    numero: "1234",
    complemento: "sala 08",
    bairro: "Batel",
    cidade: "Curitiba",
    uf: "PR",
  },
  {
    id: "req-demo-campinas-01",
    nome: "Rafael Almeida",
    whatsapp: "(19) 99234-5678",
    cep: "13010070",
    endereco: "Rua Barão de Jaguara",
    numero: "1310",
    complemento: "",
    bairro: "Centro",
    cidade: "Campinas",
    uf: "SP",
  },
  {
    id: "req-demo-campinas-02",
    nome: "Letícia Moraes",
    whatsapp: "(19) 99555-4444",
    cep: "13015904",
    endereco: "Av. Francisco Glicério",
    numero: "935",
    complemento: "fundos",
    bairro: "Centro",
    cidade: "Campinas",
    uf: "SP",
  },
  {
    id: "req-demo-manaus-01",
    nome: "Pedro Henrique Lima",
    whatsapp: "(92) 99422-1000",
    cep: "69020030",
    endereco: "Av. Eduardo Ribeiro",
    numero: "620",
    complemento: "",
    bairro: "Centro",
    cidade: "Manaus",
    uf: "AM",
  },
  {
    id: "req-demo-porto-alegre-01",
    nome: "Luana Silveira",
    whatsapp: "(51) 98333-9999",
    cep: "90010150",
    endereco: "Rua dos Andradas",
    numero: "1200",
    complemento: "loja 4",
    bairro: "Centro Histórico",
    cidade: "Porto Alegre",
    uf: "RS",
  },
  {
    id: "req-demo-floripa-01",
    nome: "Gabriel Souza",
    whatsapp: "(48) 99123-4567",
    cep: "88010400",
    endereco: "Rua Felipe Schmidt",
    numero: "330",
    complemento: "",
    bairro: "Centro",
    cidade: "Florianópolis",
    uf: "SC",
  },
]

export function buildDemoRequests(nowMs = Date.now()): CityRequest[] {
  return DEMO_REQUESTS.map((r, i) => ({
    ...r,
    createdAt: new Date(nowMs - OFFSETS_MIN[i] * 60_000).toISOString(),
  }))
}

export function hasSeededDemo(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(DEMO_SEED_FLAG) === "1"
  } catch {
    return true
  }
}

export function markSeeded(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DEMO_SEED_FLAG, "1")
  } catch {
    /* ignore */
  }
}

export const DEMO_SEED_FLAG_KEY = DEMO_SEED_FLAG
