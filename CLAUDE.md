# Bang Bang — Site Project

## Projeto
Site institucional/comercial da Bang Bang (bebidas RTD). Reformulação total.
Home B2B-first com porta B2C. Design system escalável.

## Stack
- Next.js 14+ (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Storybook
- Git

## Estrutura de Pastas
```
/src/app/                 → Pages (App Router)
/src/components/ui/       → Componentes shadcn customizados
/src/components/sections/ → Seções da home
/src/components/shared/   → Componentes reutilizáveis
/src/lib/                 → Utilidades (cn, constants), types, data estática
/src/data/                → JSONs gerados (pdvs.json etc — commitados)
/data/                    → Fontes de verdade (xlsx) + caches (.viacep, .geocoding)
/scripts/                 → Build scripts TS (pdvs:refresh, pdvs:validate)
/public/                  → Assets estáticos (imagens, fontes)
```

## Pipelines Build-Time
- `npm run pdvs:refresh` — lê `data/pdvs_bang_bang.xlsx`, enriquece via ViaCEP, geocoda via Nominatim. Roda **manualmente** quando a planilha mudar. Cache em `data/.viacep-cache.json` + `data/.geocoding-cache.json` (commitados).
- `npm run pdvs:validate` — validação rápida (sem rede) usada pelo hook `prebuild`. Garante que `src/data/pdvs*.json` existem e são válidos.

## Documentação Obrigatória
Antes de qualquer decisão, leia os docs relevantes em `/docs`:
- `BRAND_CONTEXT.md` — Marca, tom, personas, públicos
- `DESIGN_TOKENS.md` — Cores, tipografia, espaçamento
- `HOME_ARCHITECTURE.md` — 10 seções + componentes mapeados
- `ANTI_PATTERNS.md` — O que NÃO repetir
- `COPY_HOME.md` — Textos aprovados da home
- `COMPONENT_SPECS.md` — Especificação técnica dos componentes
- `SEO_METADATA.md` — Meta tags e schema markup

## Agentes
Este projeto usa agentes especializados em `.claude/agents/`.
O `maestro` é o orquestrador. Ver `docs/AGENTS_GUIDE.md`.

## Regras Globais de Código
- TypeScript strict — sem `any`, sem `as unknown`
- Server Components por padrão; Client Components só com `"use client"` quando há interatividade
- Imagens com `next/image`, fontes com `next/font`
- CSS custom properties para design tokens em `globals.css`
- Tailwind para layout e responsividade
- Mobile-first em tudo
- Sem localStorage
- APIs externas — exceções autorizadas (aprovadas 2026-04-17, dobra Onde Comprar):
  - **Build-time:** ViaCEP (enriquecer logradouro de PDVs Tier B) + Nominatim/OSM (geocoding). Rodam no script manual `npm run pdvs:refresh`, nunca no prebuild de produção.
  - **Runtime:** ViaCEP (consulta de CEP do usuário em `BuscaRapida`), client-side, sem auth. Deve degradar com mensagem amigável se a API cair.
  - Qualquer outra API externa precisa de aprovação explícita do Pedro.
- Sem dependências desnecessárias — justificar cada `npm install`

## Regras Globais de Design
- Cada sabor tem paleta própria — sempre respeitar
- Produto (lata) é protagonista visual — nunca competir
- B2B e B2C nunca se misturam na mesma seção
- Alta saturação, impacto imediato, sem poluição visual
- Tom: ousado, direto, provocativo. Nunca genérico ou institucional
- "Bangers" como naming está em validação — não cravar como definitivo

## Regras de Economia de Tokens
- QA e pesquisa rodam em Haiku
- Pesquisa pesada vai pro Gemini CLI
- Passar contexto completo na primeira chamada ao subagente
- Paralelizar tarefas independentes

## Idioma
O Pedro fala português. Toda comunicação em pt-BR.
Código e comentários em inglês.
