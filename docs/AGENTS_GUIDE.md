# Bang Bang — Guia de Agentes
## Como usar o sistema de agentes no Claude Code | v1.0

---

## Visão Geral

O projeto tem 1 orquestrador + 4 subagentes especializados.
Você conversa com o **Maestro** — ele decide quem faz o quê.

```
┌─────────────────────────────────┐
│         PEDRO (você)            │
│   Conversa com o Maestro        │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│       🎯 MAESTRO (Sonnet)       │
│  Orquestrador / Gestor          │
│  Quebra tarefas, delega,        │
│  valida entregas                │
└──┬───────┬───────┬──────┬───────┘
   │       │       │      │
   ▼       ▼       ▼      ▼
┌──────┐┌──────┐┌──────┐┌──────┐
│ UX   ││ UI   ││Front ││ QA   │
│Archi-││Desig-││end   ││Revie-│
│tect  ││ner   ││Dev   ││wer   │
│Sonnet││Sonnet││Sonnet││Haiku │
└──────┘└──────┘└──────┘└──────┘
                           │
                    ┌──────▼──────┐
                    │ Researcher  │
                    │   Haiku     │
                    └─────────────┘

         ┌─────────────────┐
         │  GEMINI CLI Pro  │
         │  (fora do Claude)│
         │  Pesquisa pesada │
         └─────────────────┘
```

---

## Mapa de Modelos e Custo

| Agente | Modelo | Custo Relativo | Quando usar |
|--------|--------|----------------|-------------|
| Maestro | Sonnet | Médio | Sempre — é o ponto de entrada |
| UX Architect | Sonnet | Médio | Decisões de estrutura e layout |
| UI Designer | Sonnet | Médio | Design system, tokens, componentes visuais |
| Frontend Dev | Sonnet | Médio | Código Next.js, implementação |
| QA Reviewer | **Haiku** | **Baixo** | Revisões, checklists, validações |
| Researcher | **Haiku** | **Baixo** | Pesquisa rápida de docs e exemplos |
| Gemini CLI | **Grátis** | **Zero tokens** | Pesquisa pesada, docs longos, benchmarks |

**Regra:** Se pode ser Haiku, é Haiku. Se pode ser Gemini, é Gemini.
Sonnet só para o que precisa de raciocínio estrutural ou código complexo.

---

## Como Usar no Claude Code

### Opção 1 — Iniciar com o Maestro (recomendado)

```bash
claude --agent maestro
```

Isso inicia uma sessão onde o Maestro é o agente principal.
Ele vai ler os docs do projeto e coordenar tudo.

### Opção 2 — Chamar um agente específico

Se você sabe exatamente o que quer:

```bash
# Para uma decisão de UX
claude --agent ux-architect

# Para implementar código
claude --agent frontend-dev

# Para revisão rápida
claude --agent qa-reviewer
```

### Opção 3 — Mencionar agentes dentro da conversa

Dentro de uma sessão com o Maestro, ele pode delegar automaticamente.
Ou você pode forçar: `@ux-architect analisa a seção hero`

---

## Quando Usar o Gemini CLI

O Researcher (Haiku) vai sugerir automaticamente quando uma pesquisa
for pesada demais. Mas você também pode decidir direto:

**Use Gemini CLI para:**
- Ler documentação longa do Next.js ou Tailwind
- Comparar 5+ bibliotecas de animação
- Pesquisar padrões de SEO para sites de bebida
- Buscar exemplos de sites similares
- Qualquer pesquisa que não precise de decisão de design/código

**Como rodar:**
```bash
gemini "pesquise as melhores práticas de SEO para sites de bebidas alcoólicas no Brasil, incluindo avisos legais obrigatórios"
```

Cole o resultado no Claude Code quando precisar usar a informação.

---

## Fluxo Típico de Trabalho

```
1. Você: "Vamos começar pela seção hero"

2. Maestro:
   → Lê HOME_ARCHITECTURE.md (seção 01)
   → Delega para UX Architect: "defina o layout do hero"
   → Recebe wireframe em texto

3. Maestro:
   → Delega para UI Designer: "crie os tokens e estilos do hero"
   → Em paralelo, delega para Researcher (Haiku):
     "pesquise como implementar tipografia fluida com clamp()"
   → Recebe tokens + pesquisa

4. Maestro:
   → Delega para Frontend Dev: "implemente o HeroSection"
   → Passa: wireframe do UX + tokens do UI + pesquisa

5. Maestro:
   → Delega para QA Reviewer (Haiku): "revise o HeroSection"
   → Recebe relatório

6. Maestro:
   → Apresenta ao Pedro: "Hero implementado. QA ok, 1 aviso de
     contraste no subtítulo. Quer que eu corrija?"
```

---

## Economia Estimada de Tokens

Sem agentes (tudo no Opus/Sonnet):
→ Cada seção da home: ~15-20k tokens

Com agentes (distribuição inteligente):
→ Pesquisa em Haiku: ~70% mais barato que Sonnet
→ Revisão em Haiku: ~70% mais barato que Sonnet
→ Pesquisa pesada no Gemini: 0 tokens Claude
→ **Economia estimada: 30-40% do custo total do projeto**

---

## Localização dos Arquivos

```
bangbang-site/
├── .claude/
│   └── agents/
│       ├── maestro.md          ← Orquestrador
│       ├── ux-architect.md     ← Arquitetura UX
│       ├── ui-designer.md      ← Design System
│       ├── frontend-dev.md     ← Código Next.js
│       ├── qa-reviewer.md      ← QA (Haiku)
│       └── researcher.md       ← Pesquisa (Haiku)
├── docs/
│   ├── AGENTS_GUIDE.md         ← Este arquivo
│   └── ...
└── ...
```

---

Accellera — Central de Inteligência Organizacional
Projeto: Site Bang Bang | Sistema de Agentes v1.0
