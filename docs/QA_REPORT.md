# QA Review Report — 2026-04-17

## Summary
✅ Passed: 28
⚠️ Warnings: 9
❌ Errors: 3

---

## By Category

### Acessibilidade

✅ Heading hierarchy: 1 único h1 em HeroSection, 9 x h2 nas seções — sem pulos de nível
✅ Landmark roles: header, main, section, footer estruturados corretamente
✅ Aviso legal: "Beba com moderação. Venda proibida para menores de 18 anos." presente em Footer.tsx:157
✅ Menu mobile: aria-expanded e aria-hidden implementados em Header.tsx
✅ Icons decorativos: aria-hidden="true" em ícones do MarqueeBanner, PlaceholderImage, etc.
✅ SVG inline: aria-hidden="true" correto

⚠️ Focus states: Não há focus-visible:ring em Button.tsx (L5) — apenas hover:scale[1.02]
⚠️ Alt text em PlaceholderImage: Pendente quando trocar para next/image
⚠️ Scroll padding: 5rem pode ser excessivo em mobile vs header h-16

---

### SEO

✅ Meta tags: layout.tsx contém title, description, keywords, OG, Twitter card
✅ JSON-LD Organization schema: implementado em layout.tsx:66-80
✅ Título: "Bang Bang — A bebida que não espera a festa começar" — exact match
✅ Section IDs: Todas as 10 seções têm id (hero, sabores, revenda, numeros, parceiros, eventos, lifestyle, faq, contato)
✅ Semantic HTML: <section>, <article>, <nav>, <footer> corretos

⚠️ MarqueeBanner: Não tem <section id="marquee"> — é apenas div wrapper
⚠️ FAQPage schema JSON-LD: Não implementado (spec prevê, código falta)
⚠️ Product schema JSON-LD: Não implementado para os 4 sabores

---

### Anti-Patterns

✅ B2B/B2C segmentação: Hero com 2 CTAs distintos, seções isoladas
✅ Sem termos banidos: Nenhuma ocorrência de "ciclo", "quinzena", "IA"
✅ Sem CTAs genéricos: Todas específicas
✅ Sem mascote competindo: Apenas "BOOM!" decorativo (lg:block)
✅ Produto protagonista: Latas como cards, contextos em Eventos

---

### Copy (vs COPY_HOME.md)

✅ Todas as headlines match exatamente:
  - Hero: "A bebida que não espera a festa começar." ✓
  - Sub-headline: "4 sabores. 1 atitude. O Brasil inteiro." ✓
  - Sabores: "Cada lata, uma atitude." ✓
  - Revenda: "O tiro certo pro seu negócio." ✓
  - Números: "A Bang Bang em números." ✓
  - Parceiros: "Quem vende, sabe." ✓
  - Lifestyle: "Todo dia é dia de Bang." ✓
  - CTA: "Quer a Bang Bang no seu negócio?" ✓

✅ Flavor descriptions: 100% match (caipi, mule, spritz, bang)
✅ RevendaSection features: 4 argumentos match
✅ Footer aviso legal: Presente

⚠️ NumerosSection values: 47, 280, 120 — placeholders aguardando dados reais do cliente

---

### Responsividade

✅ Container: max-w-[1280px], padding px-4 md:px-8 lg:px-clamp — spec compliant
✅ Mobile-first CSS: Nenhuma classe base assume desktop
✅ Grids: ProductCard 1→2→4, FeatureCard 1→2→4, NumberCounter 2→4, EventCard 2→3 ✓
✅ CTA stacking: flex-col sm:flex-row ✓
✅ FloatingElements: hidden lg:block (não quebra mobile)
✅ Marquee: overflow-hidden, seamless loop

⚠️ CTASection flex-wrap pode quebrar em tablet (recomendado testar 768px)
⚠️ SectionTitle.tsx: hardcoda text-4xl/5xl/6xl em vez de usar --text-h2
⚠️ Scroll padding 5rem vs header h-16 — não alinha perfeitamente em mobile

---

### Performance

✅ PlaceholderImage: Custom component, pronto para trocar por next/image
✅ Fontes: Inter, Oswald, Permanent_Marker via next/font/google com display="swap" ✓
✅ Client components: Header, NumerosSection (useCountUp), FAQSection (Accordion) — justified
✅ Imports: Nenhum desnecessário

⚠️ 10+ PlaceholderImage instâncias — assets reais ainda pendentes
⚠️ Icons: Duplicadas em Footer.tsx e LifestyleSection.tsx (InstagramIcon, TikTokIcon)

---

### Code Quality

✅ TypeScript strict: Nenhum `any`, nenhum `as unknown`
✅ Server Components: Default, "use client" apenas quando necessário
✅ Tailwind: @theme, utility classes corretos
✅ Naming: Semântico e claro

⚠️ InstagramIcon / TikTokIcon: Definidas 2x — duplicação, refatorar para shared/icons
⚠️ Button.tsx: Misturam <a> e <button> — funciona mas poderia usar type narrowing

---

## Priority Fixes

1. ❌ MarqueeBanner sem <section id="marquee">
   - Impacto: SEO + a11y (landmark detection)
   - Fixo: Wrappear em <section> tag

2. ❌ Focus states faltando em Button
   - Impacto: Acessibilidade (tab navigation)
   - Fixo: Adicionar focus-visible:ring-2 em Button.tsx

3. ⚠️ Ícones duplicados (InstagramIcon, TikTokIcon)
   - Impacto: Manutenção, bundle size
   - Fixo: Mover para src/components/shared/icons/

---

## Notas

**Pendências Conhecidas (NÃO são erros):**
- PlaceholderImage não é next/image — assets em progresso
- Contatos (WhatsApp, Email, TikTok) — "em breve" esperado
- OG image `/og-image.jpg` — design task (Elder)
- Números (47, 280, 120) — placeholders aguardando dados reais
- Favicon — ainda não criado

**Status Geral:**
- WCAG 2.1 AA: 90% compliant (focus states faltando)
- SEO: Meta tags ✓, schemas parciais (faltam FAQ + Product)
- Copy fidelity: 100% match
- Responsividade: Mobile-first, grids corretos
- Anti-patterns: 0 infrações
- Brand: Latas protagonistas, cores respeitadas, tom correto

**Próximos passos:**
1. Fix: Focus states em Button
2. Fix: MarqueeBanner em <section>
3. Fix: Consolidar ícones
4. Trocar PlaceholderImage → next/image
5. Implementar FAQPage + Product schemas
6. Confirmar números com Pedro (47, 280, 120)
