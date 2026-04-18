import type { Metadata } from "next"
import Image from "next/image"
import { Logo } from "@/components/shared/Logo"
import { InstagramIcon } from "@/components/shared/icons/SocialIcons"
import caipiImg from "@/../public/images/latas/caipi.png"
import muleImg from "@/../public/images/latas/mule.png"
import spritzImg from "@/../public/images/latas/spritz.png"
import bangImg from "@/../public/images/latas/bang.png"

export const metadata: Metadata = {
  title: "Bang Bang — Em breve",
  description: "Algo tá gelando. Em breve.",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    title: "Bang Bang — Em breve",
    description: "Algo tá gelando. Em breve.",
    siteName: "Bang Bang",
  },
}

// Film grain — same recipe used across the site (hero, sabores, eventos).
const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

// Peek cans — four corners, each bleeding off a different edge. Decorative:
// mirrors the hero language without giving the whole site away.
const PEEK_CANS = [
  { img: muleImg,   top: "-22%", left: "-14%",  width: "42vw",  rotate: -22 },
  { img: spritzImg, top: "-24%", right: "-12%", width: "40vw",  rotate: 20 },
  { img: caipiImg,  bottom: "-18%", left: "-20%",  width: "48vw", rotate: 18 },
  { img: bangImg,   bottom: "-20%", right: "-22%", width: "46vw", rotate: -16 },
]

export default function ComingSoonPage() {
  return (
    <main
      className="relative min-h-screen w-full overflow-hidden text-white flex flex-col items-center justify-center px-6"
      style={{
        fontFamily: "var(--font-heading-var), var(--font-body), sans-serif",
        background:
          "radial-gradient(circle at 50% 30%, rgba(255,210,130,0.22), transparent 50%), " +
          "linear-gradient(135deg, #2a1410 0%, #5a2a1a 35%, #a05a2a 65%, #e8a850 100%)",
      }}
    >
      {/* Grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* Peek cans — decorative, bleed off every corner */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {PEEK_CANS.map((c, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
              width: c.width,
              transform: `rotate(${c.rotate}deg)`,
              transformOrigin: "50% 50%",
            }}
          >
            <Image
              src={c.img}
              alt=""
              className="w-full h-auto block select-none"
              style={{
                filter:
                  "drop-shadow(0 22px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 32px rgba(255,180,110,0.15))",
              }}
              priority={i < 2}
              sizes="45vw"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[32rem] gap-7">
        <Logo variant="white" height={64} priority alt="Bang Bang" />

        <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.32em] uppercase px-3.5 py-2 rounded-full border border-white/35 bg-white/5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#ffd36a] shadow-[0_0_10px_#ffd36a]" />
          Em breve
        </span>

        <h1
          className="font-black uppercase leading-[0.95] tracking-[-0.02em] drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]"
          style={{
            fontFamily: "var(--font-heading-var), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(48px, 10vw, 96px)",
          }}
        >
          <span className="block">Algo tá</span>
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #ffd36a, #ff7a3a 55%, #ffd36a)",
            }}
          >
            gelando.
          </span>
        </h1>

        <p className="text-white text-base sm:text-lg leading-relaxed max-w-[30ch] [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
          Quatro drinks clássicos em lata. Prepara a geladeira — a Bang Bang tá
          chegando com tudo.
        </p>

        <div className="pt-2 flex flex-col items-center gap-3">
          <a
            href="https://www.instagram.com/bebabangbang"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg font-bold text-sm tracking-[0.14em] uppercase text-white border border-white/45 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a1410]"
          >
            <InstagramIcon size={16} />
            Segue @bebabangbang
          </a>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/55">
            A gente avisa quando abrir.
          </p>
        </div>
      </div>
    </main>
  )
}
