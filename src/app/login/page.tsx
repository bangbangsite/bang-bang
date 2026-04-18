import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/shared/Logo"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "Login — Bang Bang",
  description: "Acesso restrito para a equipe Bang Bang.",
  robots: { index: false, follow: false },
}

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export default function LoginPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-20 text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 10%, rgba(255,210,130,0.2), transparent 55%), linear-gradient(160deg, #1f0d08 0%, #3d1f0a 55%, #6a3214 100%)",
      }}
    >
      {/* film grain overlay — site-wide treatment */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* Back-to-site link */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36a] rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar pro site
      </Link>

      {/* Brand mark, positioned above the card */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        <Logo variant="white" height={76} priority />
        <LoginForm />
      </div>
    </main>
  )
}
