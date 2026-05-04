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
    question: "Qual o pedido mínimo pra fechar distribuição?",
    answer:
      "Depende da região e do plano de penetração combinado. Nossa equipe comercial monta a proposta com você caso a caso — sem letra miúda. Fala no WhatsApp comercial e a gente alinha.",
  },
  {
    id: "item-2",
    position: 1,
    question: "Vocês trabalham com território exclusivo?",
    answer:
      "Sim. Distribuidor fechado tem área protegida, sem canibalização interna. Plano comercial e meta de sell-out são alinhados antes de assinar.",
  },
  {
    id: "item-3",
    position: 2,
    question: "Qual a margem do distribuidor?",
    answer:
      "Tabela dedicada por volume, com preço sugerido pro PDV que protege margem em toda a cadeia. Condições fechadas em reunião comercial — não publicamos no site.",
  },
  {
    id: "item-4",
    position: 3,
    question: "Como funciona a logística e o prazo de entrega?",
    answer:
      "Pallet PBR com 176 packs (2.112 latas), 1.000 kg, 1,96 m³. Saída de fábrica em janela combinada por pedido. Reposição planejada via sell-out monitorado.",
  },
  {
    id: "item-5",
    position: 4,
    question: "Tem suporte de marketing e material de PDV?",
    answer:
      "Sim. Geladeira branded, material de ponto, ativações em datas-chave e suporte de campo. Verba de marketing co-op alinhada por canal e volume.",
  },
  {
    id: "item-6",
    position: 5,
    question: "A categoria RTD vende mesmo no Brasil?",
    answer:
      "RTD é o segmento de maior crescimento em bebidas alcoólicas no Brasil. Bang Bang surfa essa onda com 4 SKUs prontos pra prateleira e marca consolidada em eventos e redes.",
  },
]
