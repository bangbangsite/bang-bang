const ITEMS = [
  "Alto giro de estoque",
  "Sem preparo, sem perda",
  "4 sabores na linha",
  "RTD que mais cresce",
  "Presente em todo o Brasil",
  "PDVs parceiros",
  "Suporte completo da marca",
  "Margem real pro seu negócio",
]

// Content is doubled so the seamless loop works: marquee scrolls translateX(-50%)
// meaning the first half scrolls out while the second half takes its place.
const DOUBLED_ITEMS = [...ITEMS, ...ITEMS]

export function MarqueeBanner() {
  return (
    <section
      id="marquee"
      aria-label="Benefícios Bang Bang"
      className="marquee-container relative w-full overflow-hidden py-5"
      style={{
        background:
          "linear-gradient(90deg, #C4650F 0%, #E87A1E 50%, #C4650F 100%)",
      }}
    >
      {/* edge fade on both sides to soften the loop seam */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(196,101,15,0.8), transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, rgba(196,101,15,0.8), transparent)",
        }}
      />

      <div
        className="marquee-track flex flex-row flex-nowrap whitespace-nowrap"
        style={{ animation: "marquee 30s linear infinite" }}
        aria-hidden="true"
      >
        {DOUBLED_ITEMS.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center shrink-0"
            style={{ fontFamily: "var(--font-heading-var)" }}
          >
            <span className="font-black uppercase text-sm tracking-[0.22em] text-white px-5">
              {item}
            </span>
            <span className="text-[#ffd36a]/80 text-sm select-none" aria-hidden="true">
              ★
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}
