"use client"

import Link from "next/link"
import { Button } from "@/components/shared/Button"
import { Logo } from "@/components/shared/Logo"
import { InstagramIcon, TikTokIcon } from "@/components/shared/icons/SocialIcons"
import { useContacts } from "@/lib/contacts/useContacts"
import { trackClick } from "@/lib/contacts/clicks"

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

const navLinks = [
  { label: "Sobre",          href: "/#sobre" },
  { label: "Sabores",        href: "/#sabores" },
  { label: "Revenda",        href: "/#revenda" },
  { label: "Eventos",        href: "/eventos" },
  { label: "Onde encontrar", href: "/onde-encontrar" },
  { label: "Contato",        href: "/#contato" },
]

export function Footer() {
  const { urls } = useContacts()
  const revendaHref = urls.revenda || "#contato"

  return (
    <footer
      className="relative overflow-hidden text-[#FAFAF8] py-16 px-4 md:px-8"
      style={{
        background:
          "radial-gradient(circle at 80% 0%, rgba(255,210,130,0.12), transparent 55%), linear-gradient(180deg, #14080a 0%, #1f0d08 50%, #2D1810 100%)",
      }}
    >
      {/* Film grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.15]"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <Logo variant="white" height={76} />

            <p className="text-[#FAFAF8]/70 text-sm leading-relaxed max-w-xs">
              A bebida que não espera a festa começar.
            </p>

            <div className="flex items-center gap-3 mt-3">
              <a
                href="https://www.instagram.com/bebabangbang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/5 text-white/70 backdrop-blur-sm hover:text-[#ffd36a] hover:border-white/35 transition-colors"
                aria-label="Instagram @bebabangbang"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/5 text-white/70 backdrop-blur-sm hover:text-[#ffd36a] hover:border-white/35 transition-colors"
                aria-label="TikTok Bang Bang"
              >
                <TikTokIcon size={18} />
              </a>
            </div>

            <p className="text-[#FAFAF8]/40 text-xs mt-1">@bebabangbang</p>
          </div>

          {/* Column 2 — Navigation */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-bold text-[11px] uppercase tracking-[0.24em] text-[#ffd36a]"
              style={{ fontFamily: "var(--font-heading-var)" }}
            >
              Navegação
            </h3>

            <nav aria-label="Links de navegação">
              <ul className="flex flex-col gap-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[#FAFAF8]/70 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3 — Contact */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-bold text-[11px] uppercase tracking-[0.24em] text-[#ffd36a]"
              style={{ fontFamily: "var(--font-heading-var)" }}
            >
              Fale Conosco
            </h3>

            <div className="flex flex-col gap-2 text-sm text-[#FAFAF8]/70">
              <p>
                WhatsApp:{" "}
                <span className="text-[#FAFAF8]/40 italic">em breve</span>
              </p>
              <p>
                E-mail:{" "}
                <span className="text-[#FAFAF8]/40 italic">em breve</span>
              </p>
            </div>

            <Button
              variant="whatsapp"
              size="sm"
              href={revendaHref}
              onClick={() => trackClick("revenda")}
              className="mt-2 self-start"
            >
              Quero revender
            </Button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FAFAF8]/50">
          <p>© 2026 Bang Bang. Todos os direitos reservados.</p>
          <p className="font-semibold text-[#FAFAF8]/80 text-center">
            Beba com moderação. Venda proibida para menores de 18 anos.
          </p>
          <div className="flex items-center gap-3">
            <p>CNPJ: a confirmar</p>
            <span className="text-[#FAFAF8]/20" aria-hidden="true">·</span>
            <Link
              href="/login"
              className="text-[#FAFAF8]/40 hover:text-[#ffd36a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36a] rounded"
            >
              Acesso staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
