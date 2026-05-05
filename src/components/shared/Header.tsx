"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/shared/Logo"
import { useContacts } from "@/lib/contacts/useContacts"
import { trackClick } from "@/lib/contacts/clicks"

const navLinks = [
  { label: "Sabores",        href: "/#sabores" },
  { label: "Distribuição",   href: "/#distribuicao" },
  { label: "Eventos",        href: "/eventos" },
  { label: "Seja um Banger", href: "/seja-um-banger" },
  { label: "Contato",        href: "/#contato" },
]

export function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const pathname = usePathname()
  const { urls } = useContacts()
  const distribuidorHref = urls.distribuidor || "#contato"

  // On the homepage the header is transparent over the hero until scroll; on
  // any other route there's no dark hero to blend with, so we need the solid
  // bar from the first paint to keep the white text legible.
  const solidFromStart = pathname !== "/"
  const isSolid = solidFromStart || scrolled

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const closeMobileMenu = () => setMenuOpen(false)

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-[250ms]",
          "h-16 md:h-20 flex items-center",
          // Transparent mode still gets a soft dark gradient from the top so
          // the logo + hamburger stay legible when hero decorations (peek
          // cans, bright gradient) pass under the bar.
          isSolid
            ? "bg-[#2C1505] shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            : "bg-gradient-to-b from-black/40 via-black/15 to-transparent"
        )}
      >
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between">

          {/* Logo — smaller on mobile so it breathes inside the h-16 bar;
              full size from md+ where there's a taller h-20 bar. */}
          <Link
            href="/"
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] rounded"
            aria-label="Bang Bang — página inicial"
          >
            <Logo
              variant="white"
              height={40}
              priority
              alt="Bang Bang — voltar ao topo"
              className="md:hidden"
            />
            <Logo
              variant="white"
              height={57}
              priority
              alt="Bang Bang — voltar ao topo"
              className="hidden md:block"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white hover:text-[#C07828] transition-colors duration-150 font-semibold tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA — único, foco grande distribuidor */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={distribuidorHref}
              onClick={() => trackClick("distribuidor")}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-xl text-[12px] tracking-[0.12em] uppercase text-white shadow-[0_8px_22px_-8px_rgba(192,120,40,0.6)] hover:-translate-y-0.5 hover:bg-[#A06230] hover:shadow-[0_12px_28px_-10px_rgba(160,98,48,0.8)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C1505]"
              style={{
                fontFamily: "var(--font-heading-var)",
                fontWeight: 700,
                background: "#C07828",
              }}
            >
              Sou distribuidor
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={cn(
          "fixed inset-0 bg-[#2C1505] z-40 flex flex-col items-center justify-center gap-8 transition-all duration-[250ms]",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col items-center gap-6" aria-label="Menu mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className="text-3xl font-heading font-black uppercase text-white hover:text-[#C07828] transition-colors duration-150 tracking-widest"
              style={{ fontFamily: "var(--font-heading-var)" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4 mt-4">
          <a
            href={distribuidorHref}
            onClick={() => {
              trackClick("distribuidor")
              closeMobileMenu()
            }}
            className="inline-flex items-center justify-center gap-2.5 min-w-[220px] px-8 h-14 rounded-xl text-sm tracking-[0.12em] uppercase text-white shadow-[0_12px_32px_-8px_rgba(192,120,40,0.65)] hover:-translate-y-0.5 hover:bg-[#A06230] hover:shadow-[0_16px_40px_-10px_rgba(160,98,48,0.85)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C1505]"
            style={{
              fontFamily: "var(--font-heading-var)",
              fontWeight: 700,
              background: "#C07828",
            }}
          >
            Sou distribuidor
          </a>
        </div>

        {/* Staff access — intentionally discreet. Absolute bottom so the main
            nav stays visually centered, low contrast so it doesn't compete
            with the consumer/partner CTAs above. */}
        <Link
          href="/dashboard"
          onClick={closeMobileMenu}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8902C] rounded px-2 py-1"
        >
          Acesso staff
        </Link>
      </div>
    </>
  )
}
