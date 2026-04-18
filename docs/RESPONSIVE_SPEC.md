# Bang Bang — Especificação de Responsividade
## Regras globais de breakpoints e adaptação | v1.0

---

## Breakpoints

```
mobile:     0 — 479px       (base — mobile-first)
mobile-lg:  480px — 767px
tablet:     768px — 1023px
desktop:    1024px — 1279px
wide:       1280px — 1535px
ultrawide:  1536px+
```

Tailwind mapping:
```
sm:   480px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

---

## Regra 1 — Mobile-First Absoluto

Todo CSS começa pelo mobile. Classes sem prefixo = mobile.
Prefixos (sm:, md:, lg:) adicionam complexidade conforme a tela cresce.

```html
<!-- CORRETO -->
<div class="flex flex-col md:flex-row lg:gap-8">

<!-- ERRADO — pensar desktop-first -->
<div class="flex flex-row md:flex-col">
```

---

## Regra 2 — Container Global

```
Max-width: 1280px (--container-max)
Padding horizontal:
  mobile:  16px (px-4)
  tablet:  32px (md:px-8)
  desktop: 48px (lg:px-12)
  wide:    auto-centrado com max-w-7xl mx-auto
```

Usar o componente `Container` em toda seção:
```html
<section>
  <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
    {/* conteúdo */}
  </div>
</section>
```

---

## Regra 3 — Tipografia Fluida

Todos os tamanhos de heading usam `clamp()` para escala fluida:

```css
--text-hero:   clamp(3.5rem, 8vw, 7rem)      /* 56px → 112px */
--text-h1:     clamp(2.5rem, 5vw, 4rem)       /* 40px → 64px */
--text-h2:     clamp(1.75rem, 3vw, 2.5rem)    /* 28px → 40px */
--text-h3:     clamp(1.25rem, 2vw, 1.75rem)   /* 20px → 28px */
--text-body:   1rem                             /* 16px fixo */
--text-body-lg: 1.125rem                        /* 18px fixo */
```

Body text NÃO escala — headings sim.

---

## Regra 4 — Grid por Breakpoint

| Componente | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| ProductCard | 1 col (stack) ou slider | 2 col | 4 col |
| FeatureCard | 1 col | 2 col | 4 col |
| NumberCounter | 2 col | 2 col | 4 col |
| TestimonialCard | 1 col (slider) | 2 col | 3 col |
| LogoStrip | slider | slider | slider |
| FAQAccordion | full width | max-w-3xl center | max-w-3xl center |
| CTABlock buttons | stack (flex-col) | row (flex-row) | row (flex-row) |

---

## Regra 5 — Seções e Espaçamento Vertical

```
Padding vertical de seção:
  mobile:  py-16  (64px)
  tablet:  py-20  (80px)
  desktop: py-28  (112px)
  wide:    py-32  (128px)
```

Gap entre elementos dentro de seção:
```
  mobile:  gap-6  (24px)
  desktop: gap-8  (32px)
```

---

## Regra 6 — Imagens

Todas as imagens usam `next/image` com:
```typescript
<Image
  src={src}
  alt={alt}               // NUNCA vazio
  width={width}
  height={height}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
  className="..."
  priority={isAboveFold}  // true para hero e primeira seção visível
/>
```

Latas nos cards:
```
mobile:  max-height 200px
tablet:  max-height 240px
desktop: max-height 280px
```

---

## Regra 7 — Elementos Decorativos

FloatingElements (chapéu, gelo, limão, estrela):
```
mobile:  hidden (display none — performance)
tablet:  hidden
desktop: block (aparecem a partir de lg:)
```

Razão: elementos decorativos absolute-positioned quebram layout mobile
e consomem performance em dispositivos menores.

---

## Regra 8 — Header

```
mobile:
  Logo (32px height) + Hamburger menu
  Menu abre fullscreen overlay
  CTAs dentro do menu, full-width

tablet:
  Logo (36px) + Nav links inline + Hamburger para CTAs
  
desktop:
  Logo (40px) + Nav links + CTA Revenda + CTA Consumidor
  Tudo inline, sem hamburger
```

---

## Regra 9 — Hero

```
mobile:
  min-height: 90vh
  Texto centralizado acima
  1-2 latas centralizadas abaixo
  CTAs empilhados full-width
  Sem elementos decorativos flutuantes

tablet:
  min-height: 95vh
  Texto à esquerda, latas à direita (2 col)
  CTAs side-by-side

desktop:
  height: 100vh
  Composição livre com latas em absolute positioning
  Elementos decorativos flutuantes visíveis
  Tipografia massiva (--text-hero)
```

---

## Regra 10 — Marquee

```
Comportamento idêntico em todos os breakpoints.
Apenas font-size muda:
  mobile:  text-xs
  desktop: text-sm

Velocidade: mesma (30s).
Nunca pausar em mobile — scroll infinito contínuo.
```

---

## Regra 11 — Footer

```
mobile:
  1 coluna, tudo empilhado
  Logo → Contato → Links (accordion ou lista) → Redes → Legal
  
tablet:
  2 colunas
  [Logo + Contato] | [Links + Redes]
  Legal full-width abaixo

desktop:
  4 colunas
  [Logo + Contato] | [Links col 1] | [Links col 2] | [Redes + Legal]
```

---

## Checklist de QA Responsivo

Antes de marcar qualquer seção como pronta, verificar em:

- [ ] Mobile 375px (iPhone SE)
- [ ] Mobile 390px (iPhone 14)
- [ ] Mobile 430px (iPhone 14 Pro Max)
- [ ] Tablet 768px (iPad)
- [ ] Tablet 1024px (iPad Pro)
- [ ] Desktop 1280px
- [ ] Desktop 1440px
- [ ] Wide 1920px

Nenhum overflow horizontal em nenhum breakpoint.
Nenhum texto cortado ou sobreposto.
Todos os CTAs clicáveis e com área de toque mínima 44x44px em mobile.
