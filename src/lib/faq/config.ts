/**
 * FAQ content layer. The homepage FAQ section reads the merged list (base
 * defaults + staff overrides) via useFAQ. The dashboard manages the override
 * set here in localStorage until a real backend lands.
 */

const KEY = "bb_faq_v1"

export const MAX_FAQ_ITEMS = 6

export interface FAQItem {
  id: string
  question: string
  answer: string
}

// Seed copy — same content the site shipped with. Staff can freely overwrite.
export const DEFAULT_FAQ: FAQItem[] = [
  {
    id: "item-1",
    question: "Como faço para revender Bang Bang?",
    answer:
      "Entre em contato pelo WhatsApp comercial. Nossa equipe vai te orientar sobre pedido mínimo, condições e entrega na sua região.",
  },
  {
    id: "item-2",
    question: "Qual o pedido mínimo?",
    answer:
      "O pedido mínimo varia por região e canal. Fale com nosso comercial para receber a tabela atualizada.",
  },
  {
    id: "item-3",
    question: "Vocês atendem minha região?",
    answer:
      "Estamos expandindo cidade por cidade. Informe sua localização e verificamos a cobertura disponível.",
  },
  {
    id: "item-4",
    question: "Tem material de apoio para PDV?",
    answer:
      "Sim. Fornecemos material de PDV, kit de ativação para eventos e suporte de campanha para parceiros.",
  },
  {
    id: "item-5",
    question: "Como funciona para eventos?",
    answer:
      "Temos kit de cenografia reutilizável e suporte de ativação. Entre em contato com o briefing do evento e montamos a proposta.",
  },
  {
    id: "item-6",
    question: "Qual a margem de lucro?",
    answer:
      "A margem varia por canal e volume. Solicite a tabela comercial para ver as condições do seu perfil.",
  },
]

export interface FAQState {
  items: FAQItem[]
  /** ISO timestamp of the last dashboard save, null if never edited. */
  updatedAt: string | null
}

export const DEFAULT_FAQ_STATE: FAQState = {
  items: DEFAULT_FAQ,
  updatedAt: null,
}

// ------------- storage -------------
export function readFAQ(): FAQState {
  if (typeof window === "undefined") return DEFAULT_FAQ_STATE
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return DEFAULT_FAQ_STATE
    const parsed = JSON.parse(raw) as Partial<FAQState>
    const items = Array.isArray(parsed.items)
      ? (parsed.items as FAQItem[]).filter(
          (i) => typeof i?.question === "string" && typeof i?.answer === "string",
        )
      : DEFAULT_FAQ
    return {
      items: items.slice(0, MAX_FAQ_ITEMS),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    }
  } catch {
    return DEFAULT_FAQ_STATE
  }
}

export function writeFAQ(next: FAQState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function resetFAQ(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export const FAQ_STORAGE_KEY = KEY

// ------------- helpers -------------
export function genFAQId(): string {
  const rnd = Math.floor(Math.random() * 90000) + 10000
  return `faq-${rnd}`
}
