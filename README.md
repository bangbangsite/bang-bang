# Bang Bang — Projeto Site
## Accellera — Central de Inteligência Organizacional

---

## Estrutura do Projeto

```
bangbang-site/
├── .claude/                       ← Configuração de agentes Claude Code
│   └── agents/
│       ├── maestro.md             ← 🎯 Orquestrador (Sonnet)
│       ├── ux-architect.md        ← Arquitetura UX (Sonnet)
│       ├── ui-designer.md         ← Design System (Sonnet)
│       ├── frontend-dev.md        ← Código Next.js (Sonnet)
│       ├── qa-reviewer.md         ← QA/Revisão (Haiku — economia)
│       └── researcher.md          ← Pesquisa (Haiku — economia)
│
├── docs/                          ← Documentação estratégica
│   ├── BRAND_CONTEXT.md           ← Contexto da marca (dossiê resumido)
│   ├── DESIGN_TOKENS.md           ← Cores, tipografia, espaçamento, sombras
│   ├── HOME_ARCHITECTURE.md       ← Seções da home + mapa de componentes
│   ├── ANTI_PATTERNS.md           ← O que NÃO repetir do site atual
│   └── AGENTS_GUIDE.md            ← Guia de uso dos agentes
│
├── assets/                        ← Assets visuais de referência
│   ├── site-atual/                ← Screenshots do site atual (referência negativa)
│   ├── referencias/               ← Screenshots das 5 referências visuais
│   ├── latas/                     ← Imagens das 4 latas (quando disponíveis)
│   └── logo/                      ← Logo Bang Bang + BOOM (quando disponíveis)
│
├── PROMPT_SITE_BANG_BANG.txt       ← Prompt principal para o Claude Code
│
└── README.md                      ← Este arquivo
```

---

## Como Usar

### 1. Preparar a Pasta no Desktop

Crie a pasta `bangbang-site` no seu desktop e copie todos os
arquivos gerados para dentro dela, respeitando a estrutura acima.

### 2. Adicionar Assets Visuais

Coloque na pasta `assets/`:
- Screenshots do site atual → `assets/site-atual/`
- As 5 referências visuais → `assets/referencias/`
- Imagens das latas (se tiver em alta) → `assets/latas/`
- Logo da marca → `assets/logo/`

### 3. Abrir no Claude Code

No terminal do Claude Code da empresa:
```bash
cd ~/Desktop/bangbang-site

# Iniciar com o orquestrador (RECOMENDADO)
claude --agent maestro
```

O Maestro vai ler todos os docs, identificar os agentes disponíveis,
e coordenar o projeto inteiro. Ele delega automaticamente para os
subagentes especializados.

Para detalhes sobre como os agentes funcionam, leia `docs/AGENTS_GUIDE.md`.

### 4. Fluxo de Trabalho

O Maestro vai:
1. Ler todos os docs e referências
2. Propor workflow + seções + componentes
3. Aguardar sua validação
4. Delegar para os subagentes certos (UX → UI → Dev → QA)
5. Usar Haiku para revisões e pesquisas (economia de tokens)
6. Sugerir Gemini CLI quando a pesquisa for pesada

---

## Arquivos de Contexto

| Arquivo | Conteúdo | Tamanho |
|---------|----------|---------|
| BRAND_CONTEXT.md | Dossiê resumido + personas + tom de voz | Leve |
| DESIGN_TOKENS.md | Cores, tipografia, espaçamento — CSS vars | Leve |
| HOME_ARCHITECTURE.md | 10 seções + mapa de 25+ componentes | Leve |
| ANTI_PATTERNS.md | 10 erros do site atual a evitar | Leve |
| AGENTS_GUIDE.md | Guia de uso dos agentes + mapa de tokens | Leve |
| PROMPT_SITE_BANG_BANG.txt | Prompt principal (colar no CC) | Médio |

## Agentes

| Agente | Modelo | Custo | Função |
|--------|--------|-------|--------|
| maestro | Sonnet | Médio | Orquestrador — coordena tudo |
| ux-architect | Sonnet | Médio | Estrutura de páginas e UX |
| ui-designer | Sonnet | Médio | Design system e componentes visuais |
| frontend-dev | Sonnet | Médio | Código Next.js/React |
| qa-reviewer | **Haiku** | **Baixo** | Revisão, acessibilidade, SEO |
| researcher | **Haiku** | **Baixo** | Pesquisa de docs e exemplos |
| Gemini CLI | **Grátis** | **Zero** | Pesquisa pesada (fora do Claude) |

Todos em `.md` para máxima leveza e compatibilidade.

---

## Escopo da Fase 1

✅ Design system completo (tokens + componentes documentados)
✅ Home funcional rodando local (npm run dev)
✅ Responsivo (desktop + mobile)
✅ SEO semântico preparado (meta tags, headings, schema)
✅ Storybook com todos os componentes

❌ Deploy / domínio (futuro)
❌ Google Analytics / Tag Manager (futuro — quando for ao ar)
❌ Integração Mercado Livre (futuro)
❌ Pixel Meta (futuro)

---

Accellera — Central de Inteligência Organizacional
Projeto: Site Bang Bang | Fase 1 — Home Local
Data: 15/04/2026
