# Bang Bang — Design Tokens
## Referência para Design System | v1.0

---

## Paleta de Cores

### Cores da Marca (globais)
```
--bb-orange:        #E87A1E    /* Laranja principal — cor dominante */
--bb-orange-dark:   #C4650F    /* Laranja escuro — hover/ênfase */
--bb-brown-dark:    #2D1810    /* Marrom escuro — fundos de impacto */
--bb-brown:         #4A2C1A    /* Marrom — base quente */
--bb-cream:         #F5E6D0    /* Creme — backgrounds claros */
--bb-black:         #1A1A1A    /* Preto quase puro — texto e contraste */
--bb-white:         #FAFAF8    /* Branco quente — não usar branco puro */
```

### Cores por Sabor
```
/* Caipi Vodka 3 Limões — O Verde */
--bb-caipi-primary:    #4CAF50    /* Verde vibrante */
--bb-caipi-secondary:  #C8A94E    /* Dourado/amarelo */
--bb-caipi-bg:         #E8F5E9    /* Verde claro para fundo */

/* Moscow Mule — O Mule */
--bb-mule-primary:     #8B5E3C    /* Cobre/marrom */
--bb-mule-secondary:   #A0522D    /* Terracota escuro */
--bb-mule-bg:          #F5E6D0    /* Creme quente para fundo */

/* 40+3 Spritz — O Spritz */
--bb-spritz-primary:   #C49A6C    /* Cobre dourado */
--bb-spritz-secondary: #D4A574    /* Bege areia */
--bb-spritz-bg:        #FFF8F0    /* Bege claro para fundo */

/* Whisky + Energy — O Bang */
--bb-bang-primary:     #E85D10    /* Laranja intenso */
--bb-bang-secondary:   #3E1A0A    /* Marrom escuro profundo */
--bb-bang-bg:          #FFF0E6    /* Laranja claro para fundo */
```

### Cores Funcionais
```
--bb-success:       #4CAF50
--bb-error:         #D32F2F
--bb-cta-b2b:       #E87A1E    /* CTA principal B2B — laranja */
--bb-cta-b2c:       #4CAF50    /* CTA principal B2C — verde */
--bb-cta-whatsapp:  #25D366    /* WhatsApp */
```

---

## Tipografia

### Famílias
```
--font-heading:   'Knockout', 'Impact', 'Anton', sans-serif
                  /* Bold, condensed, impacto — para títulos e statements */
                  /* Alternativa: 'Oswald', 'Barlow Condensed' */

--font-body:      'Inter', 'DM Sans', sans-serif
                  /* Limpa, legível, moderna — para corpo de texto */

--font-accent:    'Permanent Marker', 'Bangers', cursive
                  /* Handwritten/graffiti — para elementos de destaque */
                  /* Usar com moderação — só em badges ou destaques */
```

### Escala de Tamanhos (desktop → mobile)
```
--text-hero:      clamp(3.5rem, 8vw, 7rem)     /* Títulos hero massivos */
--text-h1:        clamp(2.5rem, 5vw, 4rem)      /* Títulos de seção */
--text-h2:        clamp(1.75rem, 3vw, 2.5rem)   /* Subtítulos */
--text-h3:        clamp(1.25rem, 2vw, 1.75rem)  /* Títulos de card */
--text-body:      1rem                            /* Corpo 16px */
--text-body-lg:   1.125rem                        /* Corpo grande 18px */
--text-small:     0.875rem                        /* Texto pequeno 14px */
--text-caption:   0.75rem                         /* Captions 12px */
```

### Pesos
```
--font-regular:   400
--font-medium:    500
--font-semibold:  600
--font-bold:      700
--font-black:     900    /* Para headings de impacto */
```

---

## Espaçamento

### Escala Base (8px grid)
```
--space-1:   0.25rem    /* 4px */
--space-2:   0.5rem     /* 8px */
--space-3:   0.75rem    /* 12px */
--space-4:   1rem       /* 16px */
--space-5:   1.5rem     /* 24px */
--space-6:   2rem       /* 32px */
--space-8:   3rem       /* 48px */
--space-10:  4rem       /* 64px */
--space-12:  5rem       /* 80px */
--space-16:  6rem       /* 96px */
--space-20:  8rem       /* 128px — entre seções */
```

### Padding de Seções
```
--section-py:      clamp(4rem, 8vw, 8rem)       /* Vertical entre seções */
--section-px:      clamp(1rem, 5vw, 6rem)        /* Horizontal (container) */
--container-max:   1280px                         /* Largura máxima */
```

---

## Bordas e Raios

```
--radius-sm:    4px      /* Badges, tags */
--radius-md:    8px      /* Botões, inputs */
--radius-lg:    16px     /* Cards */
--radius-xl:    24px     /* Cards de produto */
--radius-full:  9999px   /* Pílulas, avatares */
```

---

## Sombras

```
--shadow-sm:    0 1px 3px rgba(0,0,0,0.12)
--shadow-md:    0 4px 12px rgba(0,0,0,0.15)
--shadow-lg:    0 8px 30px rgba(0,0,0,0.2)
--shadow-card:  0 4px 20px rgba(232,122,30,0.15)   /* Sombra com tom laranja */
```

---

## Animações e Transições

```
--transition-fast:     150ms ease
--transition-base:     250ms ease
--transition-slow:     400ms ease
--transition-bounce:   400ms cubic-bezier(0.34, 1.56, 0.64, 1)

/* Marquee / rolling text */
--marquee-speed:       30s    /* Velocidade da faixa de texto */
```

---

## Breakpoints

```
--bp-mobile:    480px
--bp-tablet:    768px
--bp-desktop:   1024px
--bp-wide:      1280px
--bp-ultrawide: 1536px
```

---

## Diretrizes de Aplicação

### Regras de Fundo por Seção
- Hero: fundo escuro (--bb-brown-dark ou --bb-black) com alta saturação
- Seções B2B: fundo neutro (--bb-cream ou --bb-white) para legibilidade
- Seções de produto: fundo do sabor em destaque
- CTA de fechamento: fundo laranja (--bb-orange) com texto branco
- Footer: fundo escuro (--bb-brown-dark)

### Regras de CTA
- B2B primário: fundo --bb-orange, texto branco, radius-md
- B2B secundário: borda --bb-orange, fundo transparente, texto --bb-orange
- B2C: fundo --bb-caipi-primary (verde), texto branco
- WhatsApp: fundo --bb-cta-whatsapp com ícone

### Regras de Produto
- Cada card de produto usa a paleta do sabor como fundo
- Lata sempre centralizada e maior que os textos
- Nome do sabor em --font-heading, bold
- Descrição em --font-body, max 2 linhas
