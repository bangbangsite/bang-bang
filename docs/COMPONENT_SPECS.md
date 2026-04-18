# Bang Bang — Especificação de Componentes
## Props, variantes, breakpoints e comportamento | v1.0

---

## Seção Onde Comprar (B2C)

### OndeComprarSection (wrapper server)
```
Props: nenhuma — importa src/data/pdvs.json e src/data/pdvs-active-ufs.json
Layout:
  - Título central ("Onde achar Bang Bang.")
  - Grid 2 colunas lg:  [Busca+hint] [Mapa]  |  mobile: stack (busca topo, mapa abaixo)
  - Lista full-width abaixo dos dois caminhos
Fornece contexto via <OndeComprarProvider>
```

### OndeComprarProvider / useOndeComprar
```
Store: Context API nativa
Estado: filter: { kind: "uf" | "cidade" | "cep" | null, value, label? }
Exposto: allPdvs, activeUfs, activeUfSet, filter, setFilter, clearFilter,
         filteredPdvs, cityIndex (autocomplete)
Motivo: árvore rasa (4 clients) — Context basta. Escalar pra Zustand só se houver re-render pesado medido.
```

### BuscaRapida
```
Input único. Debounce 200ms.
CEP (8 dígitos) → fetch ViaCEP → localidade+uf → match por cidade ou fallback por prefixo CEP (5 primeiros dígitos).
Autocomplete: sugere UFs e cidades presentes na base. Max 10.
Teclado: ArrowUp/Down, Enter, Escape. role="combobox" + aria-autocomplete.
Chip do filtro ativo + botão X pra limpar.
```

### MapaBrasil
```
SVG inline, viewBox 0 0 450 460 (27 paths em src/lib/data/brasil-paths.ts — MIT, Lucas Bassetti 2016).
Estado ativo: fill --bb-orange, hover --bb-orange-dark, tooltip {nome, contagem}.
Estado selecionado: fill --bb-orange-dark + aria-pressed=true.
Estado inativo: fill #E5DCCF, cursor not-allowed, aria-disabled=true, tabIndex=-1.
Click em ativo: setFilter UF + scroll suave pra #onde-comprar-lista.
Tooltip: posição absolute dentro do wrapper, segue cursor. Em focus por teclado: usa getBBox para posicionar.
Legenda embaixo: Disponível / Em breve.
```

### ListaPDVs
```
Grid: 1 col mobile / 2 col md / 3 col lg. Gap 4/6.
Header: "[N] PDVs ativos" ou "[N] PDVs encontrados em [label]" + link "Ver todos os PDVs".
aria-live=polite pra anunciar filtros aplicados a leitores de tela.
Paginação: PAGE_SIZE=30. Botão "Carregar mais ([N] restantes)" variant outline.
Reset da paginação a cada mudança de filter.
id=onde-comprar-lista com scroll-mt-24 (pra âncora do mapa).
Empty state: headline provocativa + CTA B2B discreto.
```

### CardPDV
```
Puro. Server-friendly. Sem hooks.
Header: nome (h3 uppercase heading) + badge de tipo (cor por tipo).
Bloco de endereço: rua · bairro · cidade/UF.
Horário com ícone relógio (se houver).
Actions (condicionais):
  - Ver no Maps (primary button inline, abre nova aba)
  - Pedir delivery (outline, só se deliveryUrl existir)
Hover: border laranja + leve shadow laranja.
```

---

## Componentes Globais

### Header
```
Props:
  variant: "transparent" | "solid"     // transparent no hero, solid no scroll
  
Comportamento:
  - Fixed no topo, z-50
  - Transparent com logo branco sobre o hero
  - Após scroll de 100px: fundo solid (--bb-brown-dark), shadow-md
  - Transição: --transition-base

Layout Desktop:
  [Logo]                    [nav links]          [CTA Revenda] [CTA Consumidor]

Layout Mobile:
  [Logo]                                          [Hamburger]
  → Menu fullscreen ao abrir com links + CTAs

Elementos:
  - Logo: Bang Bang (branco, height 40px desktop / 32px mobile)
  - Nav links: Sabores | Revenda | Eventos | Contato
  - CTA Revenda: Button primary (--bb-orange)
  - CTA Consumidor: Button outline (branco)
```

### Button
```
Props:
  variant: "primary" | "secondary" | "outline" | "whatsapp" | "ghost"
  size: "sm" | "md" | "lg"
  icon?: ReactNode                    // ícone à esquerda (ex: WhatsApp)
  fullWidth?: boolean

Variantes:
  primary:    bg --bb-orange, text white, hover --bb-orange-dark
  secondary:  bg --bb-caipi-primary, text white, hover darken 10%
  outline:    border 2px --bb-orange, text --bb-orange, hover fill
  whatsapp:   bg #25D366, text white, icon WhatsApp
  ghost:      bg transparent, text current, hover bg black/5%

Tamanhos:
  sm: h-9 px-4 text-sm radius-md
  md: h-11 px-6 text-base radius-md
  lg: h-14 px-8 text-lg radius-md font-bold

Animação: scale(1.02) no hover, --transition-fast
```

### SectionWrapper
```
Props:
  bg: "dark" | "light" | "cream" | "orange" | "custom"
  customBg?: string                   // classe Tailwind ou CSS var
  py?: "sm" | "md" | "lg"            // default "lg"
  id?: string                         // para scroll-to navigation

Mapeamento:
  dark:   bg --bb-brown-dark, text white
  light:  bg --bb-white, text --bb-black
  cream:  bg --bb-cream, text --bb-black
  orange: bg --bb-orange, text white

Padding:
  sm: py-12 md:py-16
  md: py-16 md:py-24
  lg: py-20 md:py-32
```

### SectionTitle
```
Props:
  title: string
  subtitle?: string
  align: "left" | "center"           // default "center"
  light?: boolean                     // true = texto branco

Tipografia:
  title: font-heading, text-h1, font-black, uppercase
  subtitle: font-body, text-body-lg, font-regular, mt-4, max-w-2xl
```

---

## Componentes de Seção

### HeroSection
```
Layout Desktop:
  Fullscreen (100vh), fundo escuro
  Tipografia massiva centralizada ou à esquerda
  4 latas em composição dinâmica (absolute positioning)
  Elementos decorativos flutuantes (chapéu, estrela BOOM)
  2 CTAs no centro-inferior

Layout Mobile:
  Min-height 90vh
  Tipografia menor (clamp) centralizada
  1-2 latas centralizadas abaixo do texto
  CTAs empilhados full-width

Animações:
  - Latas: fade-in com slide-up staggered (delay 100ms entre elas)
  - Texto: fade-in da esquerda, 300ms
  - Elementos decorativos: float suave (animation: float 6s ease infinite)

Breakpoints:
  mobile: 1 coluna, texto + latas empilhados
  tablet: 2 colunas, texto esquerda + latas direita
  desktop: composição livre com absolute positioning
```

### MarqueeBanner
```
Props:
  items: Array<{ text: string, icon?: string }>
  speed?: number                      // default 30 (segundos)
  direction?: "left" | "right"

Comportamento:
  - Faixa horizontal com scroll infinito via CSS animation
  - Itens separados por bullet (•) ou ícone
  - Duplicar items no DOM para loop seamless
  - Pausar no hover (animation-play-state: paused)

Layout:
  py-3, bg --bb-orange, text white
  font-heading, text-sm uppercase, tracking-wider, font-bold

Implementação:
  CSS animation: translateX(0) → translateX(-50%) linear infinite
  Duplicar conteúdo dentro de um flex container
```

### ProductCard
```
Props:
  name: string
  nickname: string                    // "O Verde", "O Mule", etc.
  description: string
  occasion: string
  flavor: "caipi" | "mule" | "spritz" | "bang"
  image: string                       // path da lata

Comportamento:
  - Fundo usa paleta do sabor (--bb-[flavor]-bg)
  - Borda superior colorida (--bb-[flavor]-primary), 4px
  - Lata centralizada, max-height 280px
  - Hover: lata scale(1.05), shadow-card
  - Nickname em badge pequeno acima do nome

Layout Desktop: Card vertical, min-width 280px
Layout Mobile: Card horizontal (imagem esquerda, texto direita)
               OU slider horizontal de cards

Breakpoints:
  mobile: 1 coluna (cards empilhados ou slider)
  tablet: 2 colunas
  desktop: 4 colunas (grid)
```

### FeatureCard
```
Props:
  icon: ReactNode
  title: string
  description: string

Layout:
  Ícone (48x48, cor --bb-orange) acima
  Título em font-heading, text-h3
  Descrição em font-body, text-small, max 2 linhas, text-muted

Grid: 2 colunas mobile, 4 colunas desktop
```

### NumberCounter
```
Props:
  value: number
  label: string
  prefix?: string                     // ex: "+"
  suffix?: string                     // ex: "cidades"

Comportamento:
  - Número anima de 0 até value quando entra no viewport
  - Duração: 2s, easing: ease-out
  - Usar Intersection Observer para trigger
  - Client Component (precisa de state + effect)

Tipografia:
  Número: font-heading, text-hero, font-black, text --bb-orange
  Label: font-body, text-body, text white/70%
```

### FAQAccordion
```
Props:
  items: Array<{ question: string, answer: string }>

Comportamento:
  - Usar shadcn Accordion (single mode — só 1 aberto por vez)
  - Ícone + no fechado, - no aberto
  - Animação de height: --transition-base
  - Primeiro item aberto por padrão

Estilo:
  Question: font-heading, text-h3, font-bold
  Answer: font-body, text-body, text-muted, max-w-prose
  Separador: border-b border --bb-cream entre items
```

### TestimonialCard
```
Props:
  quote: string
  name: string
  location: string
  rating?: number                     // 1-5 estrelas

Layout:
  Aspas grandes decorativas (font-accent, text-6xl, opacity-20)
  Quote em font-body, text-body-lg, italic
  Nome em font-heading, text-small, font-bold
  Location em text-caption, text-muted
```

### LogoStrip
```
Props:
  logos: Array<{ name: string, image: string }>
  speed?: number

Comportamento:
  - Slider horizontal infinito (mesmo pattern do MarqueeBanner)
  - Logos em grayscale, hover: color original
  - Espaçamento uniforme entre logos
  - Height fixo: 60px desktop, 40px mobile
```

### CTABlock
```
Props:
  title: string
  buttons: Array<{ label, href, variant, icon? }>
  secondaryLink?: { label, href }

Layout Desktop:
  Título centralizado, text-h1
  Botões em row, gap-4
  Link secundário abaixo, text-small

Layout Mobile:
  Título centralizado
  Botões empilhados full-width
  Link secundário abaixo
```

---

## Componentes Decorativos

### FloatingElement
```
Props:
  src: string                         // imagem
  position: { top, left, right, bottom }
  size: number                        // width em px
  animation?: "float" | "rotate" | "none"
  delay?: number                      // animation delay em ms

CSS Animation float:
  @keyframes float {
    0%, 100% { transform: translateY(0) }
    50% { transform: translateY(-15px) }
  }

Nota: Esconder em mobile (hidden md:block) para performance
```

### BoomStar
```
Elemento SVG inline da estrela BOOM
Props:
  size: "sm" | "md" | "lg"
  color?: string                      // default --bb-orange
  rotate?: number                     // graus

Usar como decoração pontual em seções de impacto
```
