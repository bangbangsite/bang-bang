# Bang Bang — Arquitetura da Home
## Seções, Lógica de Navegação e Mapa de Componentes | v1.0

---

## Lógica Geral da Página

A home segue uma narrativa de convencimento B2B com porta B2C.
Cada seção entrega o visitante para a próxima com propósito definido.
O storytelling é invisível — o visitante sente a progressão sem que
ela seja declarada.

**Fluxo narrativo:**
Impacto → Produto → Prova Social → Por que revender → Expansão → FAQ → CTA

**Navegação:** Header fixo com dois caminhos:
- Botão "Revenda" (scroll para seção B2B ou WhatsApp)
- Botão "Consumidor" (scroll para seção B2C ou Instagram)

---

## Seções da Home

### 01 — HERO
**Público:** Ambos (primeiro impacto)
**Objetivo:** Impacto visual imediato + declaração de posicionamento
**Componentes:**
- Tipografia massiva com statement da marca (ref Cools/Sparkling Ice)
- 4 latas flutuando ou em composição dinâmica
- Elementos decorativos (chapéu cowboy, estrela BOOM, texturas)
- Dois CTAs no header: "Revenda" | "Consumidor"
- Sub-headline curta: posicionamento 2026

**Referência visual:** Hero do Cools com latas grandes + tipografia
**Tom:** Impacto. Sem explicação. A marca fala por si.
**Fundo:** Escuro (--bb-brown-dark) com elementos em alta saturação

---

### 02 — MARQUEE DE BENEFÍCIOS B2B
**Público:** B2B
**Objetivo:** Passar credenciais rápidas em faixa de texto rolante
**Componentes:**
- Faixa de texto rolling (marquee) com ícones intercalados
- Textos curtos: "Alto giro" • "Sem preparo" • "Margem real" •
  "RTD #1 em crescimento" • "4 sabores" • "Presente em X cidades"

**Referência visual:** Marquee da IZZE
**Tom:** Direto, factual, rápido
**Fundo:** Laranja (--bb-orange) com texto branco

---

### 03 — OS 4 SABORES
**Público:** Ambos (produto como protagonista)
**Objetivo:** Apresentar os 4 sabores com personalidade e paleta individual
**Componentes:**
- Grid de 4 cards de produto (ref IZZE + Indrink)
- Cada card: fundo na cor do sabor, lata centralizada, nome bold, descrição
  sensorial de 1 linha, apelido da persona ("O Verde", "O Mule", etc.)
- Hover: leve scale na lata + reveal da descrição completa
- Alternativa: listagem tipográfica dos sabores com imagem lateral (ref Indrink)

**Referência visual:** Cards IZZE (fundo por sabor) + tipografia Indrink
**Tom:** Sensorial, provocativo. Não é catálogo — é apresentação com atitude.
**Fundo:** Claro (--bb-cream) para os cards se destacarem por contraste

---

### 04 — POR QUE REVENDER BANG BANG
**Público:** B2B (seção principal)
**Objetivo:** Converter o revendedor/bar com argumentos de negócio
**Componentes:**
- Título bold: "O tiro certo pro seu negócio." ou similar
- Grid de 3-4 argumentos com ícone + título + descrição curta:
  * Alto giro de estoque
  * Sem preparo, sem perda (RTD pronto)
  * Público jovem já busca
  * Suporte e material da marca
- CTA primário: "Quero revender" → WhatsApp segmentado
- CTA secundário: "Seja um distribuidor" → contato comercial
- Imagem ou composição com latas em contexto de PDV/bar

**Tom:** Direto, comercial, com dados quando disponíveis
**Fundo:** Branco (--bb-white) com detalhes em laranja

---

### 05 — NÚMEROS / CREDIBILIDADE
**Público:** B2B
**Objetivo:** Prova social com dados reais
**Componentes:**
- Contadores animados (ref Ridged):
  * Cidades presentes
  * PDVs parceiros
  * Eventos realizados
  * Sabores na linha
- Os números exatos precisam vir do cliente — usar placeholder até lá

**Referência visual:** Seção de números do Ridged
**Tom:** Factual, limpo, impactante
**Fundo:** Escuro (--bb-brown-dark) com números em branco/laranja

---

### 06 — PARCEIROS / PROVA SOCIAL B2B
**Público:** B2B
**Objetivo:** Mostrar que outros já revendem — tirar objeção
**Componentes:**
- Logo strip de parceiros/distribuidores (já existe no site atual —
  Farid, Mercado Espeto Bar, Bhzão, DOS3, Granezzo)
- Opcional: 2-3 depoimentos curtos de parceiros com nome e local
  (ref carrossel Indrink)
- CTA: "Junte-se a eles"

**Tom:** Prova social autêntica
**Fundo:** Claro (--bb-cream)

---

### 07 — SEÇÃO B2C (LIFESTYLE)
**Público:** B2C (consumidor final)
**Objetivo:** Gerar desejo e conexão com o universo Bang Bang
**Componentes:**
- Composição visual com fotos lifestyle (evento, praia, esquenta)
- Statement curto: posicionamento B2C
- Link para Instagram (@bebabangbang)
- Possível embed de grid do Instagram (mas com curadoria, não genérico)
- CTA: "Siga no Instagram" ou "Encontre perto de você"

**Referência visual:** Seção lifestyle IZZE + grid curado
**Tom:** Provocativo, lifestyle, sensorial
**Fundo:** Composição de imagens com overlay escuro + texto branco

---

### 09 — ONDE COMPRAR (B2C — localizador de PDVs)
**Público:** B2C (consumidor final)
**Objetivo:** Permitir que o consumidor encontre PDV próximo via busca por CEP/cidade/estado ou interagindo com o mapa do Brasil
**Posicionamento:** Entre Lifestyle (B2C) e FAQ (B2B) — fecha a jornada B2C antes de voltar ao funil B2B
**Componentes:**
- `OndeComprarSection` (server wrapper, carrega JSONs estáticos)
- `OndeComprarProvider` (Context API — filtro compartilhado)
- `BuscaRapida` (client) — input único CEP/cidade/estado, autocomplete debounce 200ms, detecção CEP 8 dígitos → ViaCEP
- `MapaBrasil` (client) — SVG inline 27 UFs, cor primária nos ativos, cinza nos inativos, tooltip com contagem, teclado acessível
- `ListaPDVs` (client) — grid 1/2/3 cols responsivo, paginação "carregar mais" +30, empty state provocativo
- `CardPDV` (puro) — nome, badge tipo, endereço, horário, CTAs "Ver no Maps" + "Pedir delivery" (condicional)

**Regras:**
- Dados vêm de `src/data/pdvs.json` (build-time a partir de `data/pdvs_bang_bang.xlsx`)
- Estados ativos calculados automaticamente em `src/data/pdvs-active-ufs.json`
- B2B só aparece no empty state ("Ainda não tem na sua região → Fale com a gente")
- Nada de localStorage
- ViaCEP é a única API externa autorizada nesta fase (client-side, sem auth)

**Tom:** Direto, útil, B2C puro. "Onde achar Bang Bang."
**Fundo:** Claro (--bb-white)
**Referência visual:** store locator da Coca-Cola + mapa interativo do iFood

---

### 10 — FAQ B2B
**Público:** B2B
**Objetivo:** Quebrar objeções antes do contato
**Componentes:**
- Acordeão com 5-7 perguntas (ref Liquid IV):
  * Como faço para revender?
  * Qual o pedido mínimo?
  * Tem suporte de material para PDV?
  * Vocês atendem minha região?
  * Como funciona para eventos?
  * Qual a margem de lucro?
  * Preciso de alvará específico?
- Respostas curtas e diretas — max 3 linhas cada

**Referência visual:** FAQ da Liquid IV (acordeão limpo)
**Tom:** Útil, direto, sem enrolação
**Fundo:** Branco (--bb-white)

---

### 09 — CTA DE FECHAMENTO
**Público:** B2B (principal) + B2C (secundário)
**Objetivo:** Conversão final — quem chegou até aqui está interessado
**Componentes:**
- Bloco visual de impacto com tipografia grande
- Título: "Quer a Bang Bang no seu negócio?"
- Dois caminhos claros:
  * "Sou bar/restaurante" → WhatsApp
  * "Sou distribuidor" → E-mail/formulário
  * "Quero pra um evento" → WhatsApp
- Botão secundário B2C: "Sou consumidor → Me siga no Instagram"

**Referência visual:** "Let's Talk" da Liquid IV
**Tom:** Urgência amigável — sem pressão mas com atitude
**Fundo:** Laranja (--bb-orange) com texto branco

---

### 10 — FOOTER
**Público:** Todos
**Objetivo:** Informações de contato + navegação + redes
**Componentes:**
- Logo Bang Bang
- Contato comercial (telefone/WhatsApp)
- Links: Sobre / Sabores / Revenda / Eventos / Contato
- Redes sociais: Instagram / TikTok (diferenciação por rede)
- Informações legais: "Beba com moderação" / CNPJ / etc.
- Aviso de menores (obrigatório para bebida alcoólica)

**Referência visual:** Footer Indrink + Liquid IV
**Fundo:** Escuro (--bb-brown-dark) com texto claro

---

## Mapa de Componentes para o Design System

### Componentes Globais (reusáveis em qualquer página futura)
```
Header           — Logo + nav + 2 CTAs (Revenda/Consumidor)
Footer           — Contato + links + redes + legal
Button           — Variants: primary, secondary, outline, whatsapp, ghost
ButtonGroup      — 2-3 botões lado a lado com hierarquia
Container        — Max-width + padding responsivo
SectionWrapper   — Padding vertical + fundo configurável
Badge            — Tags de destaque ("Novo", "Mais vendido", etc.)
```

### Componentes de Conteúdo
```
HeroSection      — Tipografia massiva + composição de latas + CTAs
MarqueeBanner    — Faixa de texto rolling com ícones
ProductCard      — Fundo por sabor + lata + nome + descrição + CTA
ProductGrid      — Grid responsivo de ProductCards
NumberCounter    — Número animado + label
StatsGrid        — Grid de NumberCounters
TestimonialCard  — Aspas + texto + nome + local + rating
TestimonialSlider — Carrossel de TestimonialCards
LogoStrip        — Faixa de logos de parceiros (slider)
FAQAccordion     — Perguntas com expand/collapse
FAQItem          — Pergunta + resposta individual
CTABlock         — Bloco de fechamento com título + múltiplos botões
LifestyleGrid    — Grid de imagens com overlay e CTA
SectionTitle     — Título + subtítulo + alinhamento configurável
FeatureCard      — Ícone + título + descrição (para "por que revender")
FeatureGrid      — Grid de FeatureCards
```

### Componentes Decorativos
```
FloatingElement  — Imagem posicionada com parallax leve (frutas, gelo, chapéu)
BoomStar         — Elemento gráfico BOOM para destaques
DividerWave      — Separador ondulado entre seções (tema western reinterpretado)
```
