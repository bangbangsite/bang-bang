const ITEMS = [
  "Categoria RTD em alta",
  "Expansão acelerada",
  "Capilaridade nacional",
  "4 SKUs prontos pra prateleira",
  "Pallet PBR · 2.112 latas",
  "Território exclusivo",
  "Marketing co-op",
  "Suporte de campo",
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
        // DS validated brand gradient (horizontal, mirror at 50%)
        background:
          "linear-gradient(90deg, #270C08 0%, #8C4515 50%, #C8902C 100%)",
      }}
    >
      {/* edge fade on both sides to soften the loop seam — uses DS Espresso */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(39,12,8,0.85), transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, rgba(200,144,44,0.55), transparent)",
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
            // DS body = Oswald
            style={{ fontFamily: "var(--font-heading-var)" }}
          >
            <span
              className="uppercase text-sm tracking-[0.22em] text-white px-5"
              style={{ fontWeight: 700 }}
            >
              {item}
            </span>
            {/* DS Cream Light star — softer warm contrast on the dark left half of the gradient */}
            <span className="text-[#EEE0C4]/85 text-sm select-none" aria-hidden="true">
              ★
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}
