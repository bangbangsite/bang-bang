# Prompt — Dobra "Onde Comprar Bang Bang"

Este documento é o briefing completo da dobra **Onde Comprar** (seção B2C da home).
Para executar: abra o Claude Code no projeto e diga
`Leia docs/PROMPT_ONDE_COMPRAR.md e execute seguindo o maestro.`

---

## Contexto

Dobra B2C da home da Bang Bang. Objetivo: permitir que o consumidor final encontre
PDVs (pontos de venda) próximos a ele, seja digitando CEP/cidade/estado, seja
interagindo com um mapa do Brasil.

Público: consumidor final (B2C). **Nunca misturar com B2B** nesta dobra — se
aparecer CTA B2B, apenas no empty state ("ainda não tem na sua região").

## Fonte de dados

- Arquivo: `data/pdvs_bang_bang.xlsx` — **base real** com 1.424 PDVs aproveitáveis em 18 estados.
- Aba canônica: **PDVs**. Demais abas são apoio (Instruções, Resumo por Estado, Dicionário de Dados, Exceções).
- Estrutura de colunas (ver aba "Dicionário de Dados"):
  `tier, ID, Nome do Estabelecimento, Tipo, Endereço, Número, Bairro, Cidade, UF,
  CEP, Complemento, Latitude, Longitude, Telefone, Horário de Funcionamento,
  Link Google Maps, Link Delivery, Ativo (SIM/NAO), Representante Responsável,
  Observações, Data de Cadastro`.
- A coluna `tier` classifica a completude do registro:
  - **A (294)**: endereço completo com prefixo de logradouro — vai direto pro site.
  - **B (1.099)**: tem CEP válido + número + UF + cidade — o build **obrigatoriamente** resolve o logradouro via ViaCEP.
  - **C (31)**: tem UF + cidade mas falta CEP ou número — exibir só no nível da cidade (sem pin exato).
- A aba **Exceções** tem 72 registros descartados do site (sem cidade/UF/CEP). Uso interno.

## Pipeline de dados (build-time)

Criar script `scripts/build-pdvs.ts` que:

1. Lê `data/pdvs_bang_bang.xlsx` (usar `xlsx` ou `exceljs`), aba **PDVs**.
2. Filtra registros com `Ativo=SIM`.
3. **Enriquece Tier B via ViaCEP** (obrigatório, não opcional):
   - Para cada registro com `tier=B`, chama `https://viacep.com.br/ws/{cep}/json/`.
   - Se retornar `logradouro`, substitui o campo `Endereço` pelo valor do ViaCEP.
   - Se o CEP for genérico (cidade pequena) e não retornar logradouro, mantém o
     valor original e marca `enriched=false` no registro.
   - Cache em `data/.viacep-cache.json` para não repetir chamadas entre builds.
   - Rate limit: 1 requisição/segundo pra não estressar o ViaCEP. Com 1.099
     CEPs, leva ~18 min no primeiro build; builds seguintes usam cache.
4. **Geocoding de Tier A+B enriquecidos** via Nominatim (OpenStreetMap) ou
   Google Geocoding API — preencher Latitude/Longitude. Cache obrigatório em
   `data/.geocoding-cache.json`. Decidir qual API com o Pedro antes de codar.
5. **Tier C**: latitude/longitude do centro da cidade (lookup em tabela local
   de capitais + cidades conhecidas; fallback para o centro do estado).
6. Gera três artefatos em `src/data/`:
   - `pdvs.json` — array tipado de PDVs enriquecidos.
   - `pdvs-active-ufs.json` — array com as UFs que têm ao menos 1 PDV ativo.
   - `pdvs-meta.json` — estatísticas (total, por UF, por tier) pra exibir na UI se necessário.
7. Tipagem em `src/lib/types/pdv.ts`.
8. É chamado no hook `prebuild` do `package.json`.

Vantagem: quando o Pedro atualizar a planilha, basta `npm run build` e o site se
atualiza — incluindo os estados que acendem no mapa e os endereços enriquecidos
dos PDVs novos. Zero código tocado.

## Comportamento da dobra

Layout em **dois caminhos paralelos** na mesma seção. Desktop: lado a lado (busca
à esquerda, mapa à direita). Mobile: busca no topo, mapa abaixo.

### 1) Busca rápida

- Input único que aceita CEP, cidade ou estado.
- Autocomplete com debounce 200ms, sugerindo cidades e UFs **existentes na base**.
- Se o usuário digitar 8 dígitos numéricos, interpretar como CEP.
- Submissão filtra a lista de PDVs abaixo.

### 2) Mapa interativo do Brasil (o diferencial de marca)

- SVG inline dos 27 estados (26 UFs + DF). **Sem dependência externa** — buscar
  SVG livre de direitos e otimizar paths.
- Estados presentes em `pdvs-active-ufs.json`: preenchidos com a cor primária da
  marca (ver `docs/DESIGN_TOKENS.md`).
- Estados ausentes: cinza claro, cursor `not-allowed`, sem hover ativo.
- Hover em estado ativo: tooltip com nome do estado + contagem de PDVs ativos.
- Click em estado ativo: filtra a lista + scroll suave até ela + destaque visual.
- Acessibilidade: nav por teclado (Tab percorre só os ativos), `aria-label` em
  cada `<path>`, `role="button"` nos ativos, `aria-disabled="true"` nos cinzas.

### 3) Lista de PDVs filtrada (sob os dois caminhos)

- Card grid responsivo: 1 col mobile, 2 col tablet, 3 col desktop.
- Card: nome, badge de tipo, endereço completo, bairro+cidade+UF, horário, botão
  primário "Ver no Maps" (Link Google Maps), botão secundário "Pedir delivery"
  (só se `Link Delivery` existir).
- Paginação "carregar mais" a cada 30 itens. **Sem scroll infinito.**
- Empty state: headline provocativa + CTA discreto "Quer a Bang Bang no seu
  bairro? Fale com a gente" apontando pro formulário B2B.

## Regras de arquitetura (reforço ao CLAUDE.md)

- Server Component por padrão no wrapper da seção.
- Client Components apenas em: busca, mapa, lista filtrada, store de filtros.
- Leitura do JSON via import estático no server.
- TypeScript strict, zero `any`.
- Mobile-first.
- Sem localStorage. Sem APIs externas em runtime **nesta fase** (ver "Decisões
  em aberto" abaixo sobre ViaCEP).

## Componentes a criar

```
src/components/sections/OndeComprar/
  index.tsx              (server, wrapper)
  BuscaRapida.tsx        (client)
  MapaBrasil.tsx         (client, SVG inline)
  ListaPDVs.tsx          (client, consome filtro)
  CardPDV.tsx            (server-friendly, puro)
  store.ts               (estado de filtro)
```

Para estado compartilhado entre busca, mapa e lista: preferir **Context API nativa**.
Só adicionar Zustand se a árvore crescer ou houver re-render pesado — justificar no PR.

## Antes de codar

1. Ler `docs/HOME_ARCHITECTURE.md` e confirmar a posição da dobra na home.
   Atualizar se necessário.
2. Ler `docs/BRAND_CONTEXT.md` — garantir tom ousado e direto nos microtextos
   (headline, placeholder do input, empty state, CTAs).
3. Ler `docs/DESIGN_TOKENS.md` — cores, tipografia, espaçamento.
4. Ler `docs/ANTI_PATTERNS.md` — não repetir padrão proibido.
5. Ler `docs/COMPONENT_SPECS.md` — seguir convenções e atualizar com a spec dos
   novos componentes.
6. Atualizar `docs/COPY_HOME.md` com o copy da dobra (headline, subhead,
   placeholder, empty state, labels de filtro).
7. Orquestrar via agente `maestro` — ver `docs/AGENTS_GUIDE.md`.

## Decisões em aberto (perguntar antes de codar)

- **ViaCEP no build (decidido, mas registrar no PR)**: 73% da base precisa de
  enriquecimento pra ter endereço completo. A exceção à regra "sem APIs
  externas" do CLAUDE.md fica apenas em **build-time** — runtime continua sem
  dependências externas. Documentar essa exceção no PR e no CLAUDE.md.
- **Geocoding para lat/lng**: escolher entre Nominatim (OpenStreetMap, gratuito,
  rate limit 1 req/s) e Google Geocoding API (pago, mais preciso). Recomendação:
  Nominatim pra começar; migrar pra Google se a precisão não for suficiente.
- **ViaCEP client-side para busca por CEP do usuário**: separado do uso no
  build. O usuário digita CEP no site → chamamos ViaCEP no cliente só pra
  identificar a cidade e filtrar PDVs daquela cidade. Confirmar se abrir
  exceção também pra runtime.
- **"Mais perto de mim"** com geolocalização do navegador: fora do escopo da
  fase 1.
- **Segundo nível do mapa** (drill-down estado → cidade visual): fase 2.
- **Telefone inválido remanescente**: 1 registro (`PDV-0193 — Carnes Ltda`)
  tem telefone `(55) 31988-5967` fora dos padrões conhecidos. Decidir se
  ignora o telefone desse registro ou pede pro cliente corrigir.

## Entrega

- Branch nova.
- PR com descrição listando tudo acima e as decisões tomadas.
- Storybook das telas principais de cada componente.
- `npm run build` verde antes de abrir PR.
- Screenshots mobile + desktop da dobra funcionando.
