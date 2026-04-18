import { ArrowUpRight, Camera, Music, Video } from "lucide-react"
import { Container } from "@/components/shared/Container"

interface Banger {
  handle: string
  name: string
  niche: string
  city: string
  followers: string
  platform: "instagram" | "tiktok" | "youtube"
  accent: string
  bgFrom: string
  bgTo: string
  rotate: string
}

// Mock data — Pedro vai trocar por embaixadores reais depois.
const BANGERS: Banger[] = [
  {
    handle: "@lari.rocha",
    name: "Larissa Rocha",
    niche: "Nightlife · SP",
    city: "São Paulo · SP",
    followers: "287k",
    platform: "instagram",
    accent: "#d4ff4d",
    bgFrom: "#d4ff4d",
    bgTo: "#3d8a0a",
    rotate: "-3deg",
  },
  {
    handle: "@pedrao.vibes",
    name: "Pedro Guimarães",
    niche: "DJ · Rooftop",
    city: "Rio · RJ",
    followers: "412k",
    platform: "tiktok",
    accent: "#ff3a8a",
    bgFrom: "#ff3a8a",
    bgTo: "#5a0a2a",
    rotate: "2deg",
  },
  {
    handle: "@thay.doteu",
    name: "Thaynara do Teu",
    niche: "Humor · Rolê",
    city: "Belo Horizonte · MG",
    followers: "1.2M",
    platform: "instagram",
    accent: "#ffd36a",
    bgFrom: "#ffd36a",
    bgTo: "#8a5a0a",
    rotate: "-2deg",
  },
  {
    handle: "@matheusnabeer",
    name: "Matheus Lima",
    niche: "Bebidas · Bar",
    city: "Curitiba · PR",
    followers: "154k",
    platform: "youtube",
    accent: "#ff7a3a",
    bgFrom: "#ff7a3a",
    bgTo: "#6a1a0a",
    rotate: "3deg",
  },
  {
    handle: "@bia.nafesta",
    name: "Bia Albuquerque",
    niche: "Festival · Lifestyle",
    city: "Recife · PE",
    followers: "523k",
    platform: "instagram",
    accent: "#8ae6ff",
    bgFrom: "#8ae6ff",
    bgTo: "#0a3a5a",
    rotate: "-1deg",
  },
]

function PlatformIcon({ platform }: { platform: Banger["platform"] }) {
  const common = { size: 14, strokeWidth: 2.4 }
  if (platform === "instagram") return <Camera {...common} />
  if (platform === "tiktok") return <Music {...common} />
  return <Video {...common} />
}

export function TopBangersSection() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(255,122,58,0.18), transparent 45%), " +
          "linear-gradient(180deg, #1f0d08 0%, #0a0606 100%)",
      }}
    >
      <Container className="relative z-10">
        <div className="py-20 md:py-28">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-[#d4ff4d]/10 text-[#d4ff4d] border border-[#d4ff4d]/30">
                Top Bangers
              </span>
              <h2
                className="mt-5 font-black uppercase leading-[0.95] tracking-[-0.02em]"
                style={{
                  fontFamily: "var(--font-heading-var)",
                  fontWeight: 700,
                  fontSize: "clamp(2.25rem, 5vw, 4rem)",
                }}
              >
                Quem já tá{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #d4ff4d, #ffd36a 55%, #ff7a3a)",
                  }}
                >
                  na crew.
                </span>
              </h2>
            </div>
            <p className="text-white/60 text-sm max-w-sm">
              Recorte da nossa crew ativa. Diferentes cidades, diferentes vozes
              — todo mundo banger.
            </p>
          </div>

          {/* Horizontal scroll on mobile, tilted grid on desktop */}
          <div className="relative">
            <div className="flex lg:grid lg:grid-cols-5 gap-4 md:gap-5 overflow-x-auto lg:overflow-visible pb-6 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 md:-mx-8 md:px-8 lg:mx-0 lg:px-0">
              {BANGERS.map((b) => (
                <article
                  key={b.handle}
                  className="shrink-0 w-[75vw] sm:w-[45vw] md:w-[32vw] lg:w-auto snap-center group lg:hover:z-10 transition-transform"
                  style={{
                    transform: `rotate(${b.rotate})`,
                  }}
                >
                  <div
                    className="relative rounded-[28px] overflow-hidden aspect-[4/5] border-2 border-white/10 transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-0 group-hover:scale-[1.02]"
                    style={{
                      background: `radial-gradient(circle at 30% 20%, ${b.bgFrom}44 0%, ${b.bgTo} 55%, #0a0606 100%)`,
                      boxShadow: `0 30px 80px -30px ${b.bgFrom}55, inset 0 0 0 1px rgba(255,255,255,0.08)`,
                    }}
                  >
                    {/* Platform badge top-left */}
                    <span
                      className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[10px] font-black uppercase tracking-widest text-white"
                    >
                      <PlatformIcon platform={b.platform} />
                      {b.platform === "tiktok" ? "TikTok" : b.platform === "instagram" ? "IG" : "YT"}
                    </span>

                    {/* Followers top-right */}
                    <span
                      className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-md border text-[10px] font-black uppercase tracking-widest"
                      style={{
                        background: `${b.accent}22`,
                        borderColor: `${b.accent}66`,
                        color: b.accent,
                      }}
                    >
                      {b.followers}
                    </span>

                    {/* Giant NAME type */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-end justify-center pb-[40%] font-black uppercase text-white/[0.08] leading-none text-center select-none px-2"
                      style={{
                        fontFamily: "var(--font-heading-var)",
                        fontSize: "clamp(2.5rem, 5vw, 5rem)",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {b.name.split(" ")[0]}
                    </span>

                    {/* Silhouette placeholder */}
                    <div className="absolute inset-x-8 bottom-0 top-14 flex items-end justify-center">
                      <div
                        className="w-full h-[82%] rounded-t-full opacity-75"
                        style={{
                          background: `radial-gradient(ellipse at 50% 35%, ${b.accent}88 0%, ${b.bgFrom}44 40%, transparent 75%)`,
                          filter: "blur(2px)",
                        }}
                      />
                    </div>

                    {/* Bottom info card */}
                    <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/55 backdrop-blur-md border border-white/10 p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-[11px] font-black uppercase tracking-widest truncate"
                          style={{ color: b.accent }}
                        >
                          {b.handle}
                        </p>
                        <p className="text-[10px] text-white/55 truncate">
                          {b.niche} · {b.city}
                        </p>
                      </div>
                      <div
                        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-transform group-hover:rotate-45"
                        style={{
                          background: `${b.accent}20`,
                          borderColor: `${b.accent}66`,
                          color: b.accent,
                        }}
                      >
                        <ArrowUpRight size={14} strokeWidth={2.4} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between px-1 lg:px-2">
                    <span
                      className="text-sm font-black uppercase"
                      style={{ fontFamily: "var(--font-heading-var)" }}
                    >
                      {b.name}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: b.accent,
                        boxShadow: `0 0 10px ${b.accent}`,
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>

            {/* Scroll hint mobile only */}
            <p className="lg:hidden text-center text-[10px] tracking-[0.3em] uppercase text-white/40 mt-2">
              ← arrasta →
            </p>
          </div>

          {/* Footer line */}
          <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-white/70 text-sm">
              <span className="text-[#d4ff4d] font-black uppercase tracking-wider mr-2">
                + 80 bangers
              </span>
              espalhados pelo Brasil. Pode ser você o próximo.
            </p>
            <a
              href="#sou-banger"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#d4ff4d] hover:text-white transition-colors"
            >
              Quero entrar
              <ArrowUpRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
