# Bang Bang — TODO
## Roadmap de Execução | Atualizar conforme avança

---

## Fase 0 — Setup ✅ CONCLUÍDO (2026-04-15)
- [x] Rodar `/setup` (Next.js + Tailwind + shadcn + Storybook)
- [x] Validar tokens no globals.css (Tailwind v4 — tokens via @theme)
- [x] Validar fonts carregando (Inter, Oswald, Permanent Marker)
- [ ] Confirmar Storybook rodando — rodar `npm run storybook` para validar
- [ ] Rodar `npm run dev` e confirmar localhost:3000

## Fase 1 — Componentes Globais ✅ CONCLUÍDO (2026-04-15)
- [x] Header (transparent → solid on scroll)
- [x] Footer
- [x] Button (5 variantes via CVA)
- [x] SectionWrapper
- [x] SectionTitle
- [x] Container
- [x] PlaceholderImage (para assets ausentes)

## Fase 2 — Seções da Home (ordem de build) ✅ CONCLUÍDO (2026-04-15)
- [x] 01 — HeroSection
- [x] 02 — MarqueeBanner
- [x] 03 — SaboresSection (ProductCard × 4 sabores)
- [x] 04 — RevendaSection (FeatureCard × 4 argumentos)
- [x] 05 — NumerosSection (NumberCounter animado com IntersectionObserver)
- [x] 06 — ParceirosSection (LogoStrip placeholder)
- [x] 07 — LifestyleSection (B2C)
- [x] 08 — FAQSection (Accordion shadcn/base-ui)
- [x] 09 — CTASection (fechamento com 3 CTAs B2B + 1 B2C)
- [x] 10 — Footer (já feito na Fase 1 — integrado)

## Fase 3 — Montagem da Home ✅ CONCLUÍDO (2026-04-15)
- [x] Assemblar todas as seções em page.tsx
- [ ] Scroll suave entre seções (anchor links)
- [ ] Testar fluxo completo desktop
- [ ] Testar fluxo completo mobile

## Fase 4 — QA Final
- [ ] Rodar `/review`
- [ ] Corrigir issues críticos
- [ ] Validar copy vs COPY_HOME.md
- [ ] Validar heading hierarchy vs SEO_METADATA.md
- [ ] Aviso legal "Beba com moderação" presente

## Fase 5 — Storybook
- [ ] Story para cada componente shared
- [ ] Story para cada seção
- [ ] Variantes documentadas

---

## Assets Pendentes do Cliente
- [ ] Imagens das 4 latas (PNG sem fundo)
- [ ] Logo SVG (branco, escuro, laranja)
- [ ] Elemento BOOM SVG
- [ ] Logos dos parceiros
- [ ] Fotos lifestyle reais
- [ ] Números reais (cidades, PDVs, eventos)
- [ ] WhatsApp comercial
- [ ] E-mail comercial
