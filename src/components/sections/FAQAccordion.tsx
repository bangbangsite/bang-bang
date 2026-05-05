"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import type { FAQItem } from "@/lib/faq/config"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

interface FAQAccordionProps {
  items: FAQItem[]
}

/** Interactive accordion panel. Receives items from the parent Server Component. */
export function FAQAccordion({ items }: FAQAccordionProps) {
  const firstItem = items[0]

  return (
    <div
      // DS lg radius (24) + Espresso shadow tint
      className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_18px_40px_-18px_rgba(39,12,8,0.45)]"
      style={{
        // DS validated dark gradient: Espresso → Brand Dark → Mule BG → Chocolate
        // Highlight uses DS Brand Amber (rgb 192,120,40)
        background:
          "radial-gradient(circle at 50% 0%, rgba(192,120,40,0.22), transparent 55%), linear-gradient(160deg, #270C08 0%, #2C1505 30%, #4A2008 60%, #8C4515 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <div className="relative z-10 p-2 md:p-4">
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-white/60 text-sm italic">
            Nenhuma pergunta configurada. Fale com a gente pra tirar suas dúvidas.
          </p>
        ) : (
          <Accordion defaultValue={firstItem ? [firstItem.id] : []} className="flex flex-col">
            {items.map(({ id, question, answer }, i) => (
              <AccordionItem
                key={id}
                value={id}
                className={
                  i < items.length - 1
                    ? "border-b border-white/10"
                    : undefined
                }
              >
                <AccordionTrigger
                  // DS Caramel #C8902C as warm accent on dark surfaces
                  className="w-full text-left px-4 md:px-5 py-5 text-base md:text-lg uppercase text-white hover:text-[#C8902C] hover:no-underline transition-colors [&_svg]:text-white/50 [&[aria-expanded=true]_svg]:text-[#C8902C] data-[panel-open]:text-[#C8902C]"
                  // DS H3 Oswald Bold; small letter-spacing
                  style={{
                    fontFamily: "var(--font-heading-var)",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                >
                  {question}
                </AccordionTrigger>
                <AccordionContent
                  className="text-white/80 text-base px-4 md:px-5 leading-relaxed whitespace-pre-wrap"
                  // DS body = Oswald, line-height 1.7
                  style={{ fontFamily: "var(--font-heading-var)", fontWeight: 400, lineHeight: 1.7 }}
                >
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}
