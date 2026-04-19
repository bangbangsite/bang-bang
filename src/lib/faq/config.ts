/**
 * FAQ content layer. The homepage FAQ section reads items from Supabase
 * (faq_items table). The dashboard manages items via Server Actions.
 */

export const MAX_FAQ_ITEMS = 6

export interface FAQItem {
  id: string
  question: string
  answer: string
  /** Display order — lower value renders first. Managed server-side. */
  position: number
}

// Seed copy — mirrors the rows inserted by the initial seed migration.
// Used as a fallback if the Supabase fetch fails.
export const DEFAULT_FAQ: FAQItem[] = [
  {
    id: "item-1",
    position: 0,
    question: "Como faço para revender Bang Bang?",
    answer:
      "Entre em contato pelo WhatsApp comercial. Nossa equipe vai te orientar sobre pedido mínimo, condições e entrega na sua região.",
  },
  {
    id: "item-2",
    position: 1,
    question: "Qual o pedido mínimo?",
    answer:
      "O pedido mínimo varia por região e canal. Fale com nosso comercial para receber a tabela atualizada.",
  },
  {
    id: "item-3",
    position: 2,
    question: "Vocês atendem minha região?",
    answer:
      "Estamos expandindo cidade por cidade. Informe sua localização e verificamos a cobertura disponível.",
  },
  {
    id: "item-4",
    position: 3,
    question: "Tem material de apoio para PDV?",
    answer:
      "Sim. Fornecemos material de PDV, kit de ativação para eventos e suporte de campanha para parceiros.",
  },
  {
    id: "item-5",
    position: 4,
    question: "Como funciona para eventos?",
    answer:
      "Temos kit de cenografia reutilizável e suporte de ativação. Entre em contato com o briefing do evento e montamos a proposta.",
  },
  {
    id: "item-6",
    position: 5,
    question: "Qual a margem de lucro?",
    answer:
      "A margem varia por canal e volume. Solicite a tabela comercial para ver as condições do seu perfil.",
  },
]
