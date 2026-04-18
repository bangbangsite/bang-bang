# Bang Bang — Copy da Home
## Textos por seção | v1.0 — Para validação do Pedro

> NOTA: Estes textos são propostas baseadas no dossiê, posicionamento 2026
> e ata da reunião. Pedro deve validar antes da implementação.
> Campos marcados com [DADO] precisam de número real do cliente.

---

## 01 — HERO

**Eyebrow (badge acima):**
Edição Verão · Beba gelado

**Headline principal (3 linhas, treatments diferentes):**
Agita, *(outline stroke branco)*
estoura, *(gradient dourado → laranja)*
refresca. *(branco sólido)*

**Sub-headline:**
Quatro drinks clássicos em lata de 473 ml, prontos para gelar. Mexa o mouse — as latas respondem.

**CTA primária:** Ver sabores → #sabores
**CTA secundária:** Onde comprar → #onde-comprar

**Chips de sabor (abaixo das CTAs, cada um com bolinha colorida):**
- Caipi Vodka 3 Limões (#2a8f3e)
- Moscow Mule (#8b3a1a)
- 40+3 Spritz (#e0a070)
- Whisky + Energy (#e8661a)

**Ticker inferior (3 pills):**
473 ml · 5,5% vol | Mova o cursor → | Bebida mista gaseificada

**Regras de interação (desktop, > 1024px, pointer fine, sem reduced-motion):**
- Gradiente radial segue o cursor (dourado suave sobre desert palette)
- 4 latas flutuam (bob animation), fazem parallax 3D no cursor, proximity highlight dourado na lata mais próxima
- Cursor custom (ponto + anel, mix-blend-difference)
- 18 sparks decorativas sobem pela tela
- Mobile e `prefers-reduced-motion`: layout estático (stack vertical, latas 2×2), sem cursor custom

---

## 02 — MARQUEE DE BENEFÍCIOS B2B

Textos da faixa rolante (sequência contínua):

→ Alto giro de estoque • Sem preparo, sem perda • 4 sabores na linha • RTD que mais cresce • Presente em [DADO] cidades • [DADO]+ PDVs parceiros • Suporte completo da marca • Margem real pro seu negócio

---

## 03 — OS 4 SABORES

**Título da seção:** Cada lata, uma atitude.

**Card 1 — Caipi Vodka 3 Limões (O Verde)**
Nome: Caipi Vodka 3 Limões
Apelido: O Verde
Linha: Cítrico, refrescante, vibrante. Sensação tropical.
Ocasião: Qualquer hora. Qualquer lugar.

**Card 2 — Moscow Mule (O Mule)**
Nome: Moscow Mule
Apelido: O Mule
Linha: Gengibre marcante. Sofisticação sem esforço.
Ocasião: Noite sofisticada.

**Card 3 — 40+3 Spritz (O Spritz)**
Nome: 40+3 Spritz
Apelido: O Spritz
Linha: Baunilha e toque cítrico. Perfeito pra quem tem estilo.
Ocasião: Dia com estilo.

**Card 4 — Whisky + Energy (O Bang)**
Nome: Whisky + Energy
Apelido: O Bang
Linha: Impacto puro. Whisky, energia e sem limite.
Ocasião: Noite sem limite.

---

## 04 — POR QUE REVENDER BANG BANG

**Título:** O tiro certo pro seu negócio.
**Subtítulo:** A Bang Bang não é só uma bebida — é giro rápido, margem real e uma marca que seu público já procura.

**Argumento 1:**
Título: Alto giro de estoque
Descrição: RTD é o segmento que mais cresce no Brasil. Produto prático, demanda alta, reposição constante.

**Argumento 2:**
Título: Zero preparo, zero perda
Descrição: Pronto pra servir. Sem copo, sem mistura, sem desperdício. Abre e vende.

**Argumento 3:**
Título: Marca com presença
Descrição: Identidade visual forte, presença em eventos e redes. Seu cliente já conhece a lata.

**Argumento 4:**
Título: Suporte completo
Descrição: Material de PDV, kit de ativação, suporte de campanha. Você não vende sozinho.

**CTA principal:** Quero revender → WhatsApp
**CTA secundário:** Seja um distribuidor → Contato comercial

---

## 05 — NÚMEROS / CREDIBILIDADE

**Título:** A Bang Bang em números.

| Número | Label |
|--------|-------|
| [DADO] | Cidades presentes |
| [DADO] | PDVs parceiros |
| [DADO] | Eventos realizados |
| 4 | Sabores na linha |

> Pedro: esses números precisam vir do cliente. Coloquei placeholder.

---

## 06 — PARCEIROS / PROVA SOCIAL B2B

**Título:** Quem vende, sabe.
**Subtítulo:** Parceiros que já colocaram a Bang Bang na prateleira.

Logos: Farid Supermercados, Mercado Espeto Bar, Bhzão, DOS3 Distribuidora, Granezzo Distribuidora
(+ novos que o cliente fornecer)

**CTA:** Junte-se a eles → WhatsApp

---

## 07 — SEÇÃO B2C (LIFESTYLE)

**Título:** Todo dia é dia de Bang.
**Subtítulo:** Não precisa de motivo. Não precisa de festa. Abre o seu.

**CTA:** Siga no Instagram → @bebabangbang

---

## 09 — ONDE COMPRAR (B2C)

**Título:** Onde achar Bang Bang.
**Subtítulo:** Busca por CEP, cidade ou estado. Clica no mapa e o bar mais próximo aparece.

**Placeholder do input:** CEP, cidade ou estado
**Hint abaixo do input:** Digita 8 números pra buscar por CEP. Ou escolhe cidade e estado nas sugestões.

**Chip de filtro ativo:** Filtro ativo: [label]
**Link "ver todos":** Ver todos os PDVs
**Legenda do mapa:** Disponível · Em breve

**Card PDV:**
- Botão primário: Ver no Maps
- Botão secundário: Pedir delivery (só se houver `deliveryUrl`)

**Paginação:** Carregar mais ([N] restantes)

**Header dinâmico da lista:**
- Sem filtro: "[N] PDVs ativos"
- Com filtro: "[N] PDVs encontrados em [cidade/uf]" (ou "1 PDV encontrado")

**Empty state:**
- Headline: "Ainda não tem Bang Bang aqui."
- Texto: "A gente tá expandindo cidade por cidade. Quer Bang Bang no seu bairro? Fala com a gente — a próxima região pode ser a sua."
- CTA: "Fale com a gente" → #contato

**Mensagens de CEP:**
- Em carregamento: "Consultando CEP…"
- CEP não encontrado: "CEP não encontrado."
- ViaCEP indisponível: "Não consegui consultar o CEP agora. Tenta cidade ou estado."

---

## 10 — FAQ B2B

**Título:** Perguntas frequentes

**P1:** Como faço para revender Bang Bang?
**R1:** Entre em contato pelo WhatsApp comercial. Nossa equipe vai te orientar sobre pedido mínimo, condições e entrega na sua região.

**P2:** Qual o pedido mínimo?
**R2:** O pedido mínimo varia por região e canal. Fale com nosso comercial para receber a tabela atualizada.

**P3:** Vocês atendem minha região?
**R3:** Estamos expandindo cidade por cidade. Informe sua localização e verificamos a cobertura disponível.

**P4:** Tem material de apoio para PDV?
**R4:** Sim. Fornecemos material de PDV, kit de ativação para eventos e suporte de campanha para parceiros.

**P5:** Como funciona para eventos?
**R5:** Temos kit de cenografia reutilizável e suporte de ativação. Entre em contato com o briefing do evento e montamos a proposta.

**P6:** Qual a margem de lucro?
**R6:** A margem varia por canal e volume. Solicite a tabela comercial para ver as condições do seu perfil.

---

## 09 — CTA DE FECHAMENTO

**Título:** Quer a Bang Bang no seu negócio?

**CTA 1:** Sou bar / restaurante → WhatsApp
**CTA 2:** Sou distribuidor → E-mail comercial
**CTA 3:** Quero pra um evento → WhatsApp

**Link B2C (menor):** Sou consumidor → @bebabangbang no Instagram

---

## 10 — FOOTER

**Dados de contato:**
- WhatsApp comercial: [DADO]
- E-mail: [DADO]
- Instagram: @bebabangbang
- TikTok: [DADO]

**Links de navegação:**
Sobre | Sabores | Revenda | Eventos | Contato

**Legal (obrigatório):**
"Beba com moderação. Venda proibida para menores de 18 anos."
CNPJ: [DADO]

---

## Regras de Copy Aplicadas

1. Sem "ciclo" ou "quinzena" — termos internos
2. Sem CTA direto em seções de topo de funil (hero, lifestyle)
3. Sem linguagem genérica de bebida
4. Tom: curto, direto, provocativo
5. B2B: argumentos de negócio. B2C: desejo e pertencimento
6. Nunca tentar vencer pelo líquido — sempre pela marca
