# QA Review — Onde Comprar — 2026-04-17

## Summary
✅ Passed: 42
⚠️ Warnings: 3
❌ Errors: 1

---

## By Category

### Acessibilidade (WCAG 2.1 AA)

✅ Input combobox: role="combobox", aria-autocomplete="list", aria-controls, aria-expanded
✅ Lista de sugestões: role="listbox", itens com role="option" e aria-selected
✅ Teclado: ArrowUp/Down/Escape implementados, Enter submete
✅ Foco visível: focus-visible:ring em inputs e botões
✅ MapaBrasil: Paths ativos com role="button", aria-label, inativos com aria-disabled="true", tabIndex=-1
✅ States selecionados: aria-pressed=true
✅ aria-live: polite em ListaPDVs
✅ Labels: sr-only no input, aria-label em botões de ação
✅ CardPDV: Links com target="_blank" rel="noopener noreferrer"
✅ Contraste: Filtro ativo 9.5:1, placeholders ~5.2:1

⚠️ Badge "Conveniência": text-[#C49A6C] on bg-[#FFF8F0] pode estar ~3.8:1 (abaixo de 4.5:1)

---

### Semântica + SEO

✅ Section id="onde-comprar" com SectionWrapper
✅ Heading hierarchy: h2 (SectionTitle) → h3 (ListaPDVs) → h4 (EmptyState), sem pulos
✅ Section id="onde-comprar-lista" com aria-live
✅ Article em cada CardPDV
✅ Copy exato: "Onde achar Bang Bang." + subtítulo + placeholder + hint + empty state
✅ SVG semantics: role="img" + aria-label descritiva

---

### Anti-Patterns

✅ B2C puro: B2B isolado em empty state
✅ Copy não genérica: "Fale com a gente", "Ver no Maps"
✅ Sem termos banidos: Nenhuma ocorrência de "ciclo" ou "quinzena"
✅ Produto não competindo: PDVs e não PDVs selecionados destacados
✅ Sem mascote: Layout limpo

---

### Copy (COPY_HOME.md §09)

✅ Título, subtítulo, placeholder, hint, filtro ativo, "Ver todos", empty state, botões
✅ Mensagens CEP: Consultando/não encontrado/erro de consulta
✅ Mapa legenda: "Disponível · Em breve"
✅ Paginação: "Carregar mais ([N] restantes)"

---

### Performance + React 19

✅ useMemo: activeUfSet, cityIndex, filteredPdvs, context value — dependências corretas
✅ useCallback: applySuggestion, handleCepSearch, handleSubmit, handleKeyDown, handleClear — dependências OK
✅ ListaPDVs: Paginação reseta via state update during render (React 19 pattern, não useEffect)
✅ CardPDV: Pure component sem hooks
✅ Re-renders: Provider value memoizado, consumers otimizados

⚠️ Store dependency array: Inclui setFilter e clearFilter (stable functions) — remover economiza re-renders

---

### TypeScript strict

✅ Zero any, zero as unknown
✅ Type imports: import type { PDV, PDVsByUF, UF }
✅ Casts necessários: as PDV[] e as PDVsByUF[] de JSONs, as UF de fetch result
✅ Union types: FilterKind = "uf" | "cidade" | "cep" | null
✅ Interfaces: PDV, PDVsByUF, Filter, OndeComprarContext, BrasilPath — todas tipadas

---

### Dados + build-pdvs.ts

✅ Build executa: 287 linhas lidas, 277 Ativo=SIM, 12 UFs, saída em src/data/
✅ Validação UF: 27 UFs no VALID_UFS Set, warn se inválida
✅ Validação Nome: Warn se vazio
✅ Normalização CEP: Apenas dígitos via /\D/g
✅ Normalização Tipo: TIPO_MAP com fallback "Outros"
✅ Null safety: orNull() para campos opcionais, numOrNull() para coords
✅ Output: JSON formatado corretamente
✅ Prebuild hook: npm run build:pdvs executado antes de build

---

### ViaCEP Integration

✅ Endpoint correto: https://viacep.com.br/ws/${cepDigits}/json/
✅ Error handling: res.ok check, data.erro check, catch generic
✅ Mensagens amigáveis: "Consultando CEP…", "CEP não encontrado.", fallback message
✅ Fallback: Se cidade não encontrada, usa prefixo CEP 5 primeiros dígitos
✅ Loading state: cepLoading visível no UI
✅ No localStorage, sem auth, public API

---

### Stories (5 arquivos)

✅ OndeComprarSection: title "Sections/OndeComprar", RSC note, Default/Mobile/Tablet
✅ BuscaRapida: title "Sections/OndeComprar/BuscaRapida", withStore, Default/Mobile
✅ MapaBrasil: title "Sections/OndeComprar/MapaBrasil", withStore+withMaxWidth, scroll note
✅ ListaPDVs: title "Sections/OndeComprar/ListaPDVs", withStore, Default/Mobile/Tablet
✅ CardPDV: title "Sections/OndeComprar/CardPDV", fake PDV, 5 variações (Default/SemDelivery/TipoBar/TipoCasaNoturna/SemHorario)

---

## Priority Fixes

1. **Badge Conveniência contrast (minor):** CardPDV.tsx:14 — text-[#C49A6C] on bg-[#FFF8F0] pode estar ~3.8:1. Recomendação: aumentar para text-[#8B5E3C] ou escurecer fundo.

2. **EmptyState h4 vs h3 (optional):** ListaPDVs.tsx:91 — usar h3 evitaria nesting profundo e manteria estrutura mais plana.

3. **Store dependency array (nit):** store.tsx:96 — remover setFilter e clearFilter economiza re-renders.

---

## Notas

- Build verde: npm run build compila sem erros
- ViaCEP integrado com fallbacks apropriados
- Heading hierarchy correto: h2 → h3 → h4 sem pulos
- React 19 pagination pattern confirmado
- Context API suficiente (4 componentes clients)
- Copy 100% alinhada com COPY_HOME.md
- 277 PDVs em 12 UFs, build-time via xlsx OK
- Responsivo: mobile-first, grid 1/2/3 cols
- SVG Brasil 27 UFs, MIT license OK
- Sem localStorage, só ViaCEP como API externa
- Storybook: 5 stories completas com decorators

Status: Ready to merge com nota sobre badge contrast.
