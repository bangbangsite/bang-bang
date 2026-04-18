# QA Review — Onde Comprar V2 — 2026-04-17

## Summary
✅ Passed: 7
⚠️ Warnings: 2
❌ Errors: 0

---

## Delta Findings

### 1. Type Safety & Schema
✅ **OK:** `pdv.ts` — tipos `Tier`, `PDVsMeta`, novos campos (`numero`, `complemento`, `enriched`) correctamente tipados. Zero `any`, zero `as unknown`.
✅ **OK:** `build-pdvs.ts` — `validPhone()` válida corretamente padrão BR (10-11 dígitos); PDV-0193 "(55) 31988-5967" rejeitado (9 dígitos após DDD sem leading 9).

### 2. CardPDV Component
✅ **OK:** Tier C empty state renderiza "Endereço exato sob consulta" sem quebrar com strings vazias (linhas 110-120).
✅ **OK:** Address composition — concatenação correta: `endereco, numero — complemento` (linha 116-118).
⚠️ **AVISO:** Tier C data em pdvs.json mostra inconsistência: alguns têm `numero` + `complemento` vazios, outros têm `endereco` preenchido (ex: "Rua altinopolis", "758"). A lógica CardPDV oculta todo o bloco se `tier === "C"`, mas build-pdvs.ts permite campos não-vazios em Tier C. Recomendação: documentar se Tier C deve sempre ter `endereco=""` ou é aceitável misto.

### 3. URL Encoding
✅ **OK:** `mapsUrl` fallback (linhas 501-514) usa `encodeURIComponent()` para text-search. Endereços em UTF-8 (ex: "João", "Consolação") codificam corretamente.

### 4. Scripts Pipeline
✅ **OK:** `validate-pdvs.ts` — fast, no-network check. Roda em `prebuild` hook (package.json:8). Não chama `pdvs:refresh`.
✅ **OK:** `build-pdvs.ts` — flags funcionam: `--skip-geocode` (Nominatim off, mapsUrl via Google text-search), `--limit` (test-run), `--no-net` (cache-only, CI-safe).

### 5. Stories
✅ **OK:** `CardPDV.stories.tsx` — `TierC` story (linhas 118-135) com `endereco=""`, `numero=""`, `complemento=""` — valida renderização do empty state.
✅ **OK:** `ComComplemento` story — complemento "Cobertura, Loja 3" renderiza corretamente.

### 6. Regressão Check
✅ **OK:** `BuscaRapida.tsx` — nenhuma mudança. Store passa `PDV` array; `validPhone()` não é tocado.
✅ **OK:** `MapaBrasil.tsx` — nenhuma mudança. Usa `activeUfs: PDVsByUF[]` do store.
✅ **OK:** `ListaPDVs.tsx` — nenhuma mudança. Renderiza `CardPDV` com novo schema; sem destructuring de campos novos.
✅ **OK:** `store.tsx` — tipagem `PDV[]` atualizada implicitamente via import. Filtros (uf, cidade, cep) funcionam com novo schema.

---

## Checklist Detalhado

| Item | Status | Nota |
|------|--------|------|
| Tier C empty state renderização | ✅ | Testa sem quebrar com strings vazias |
| Address composition (end + num + compl) | ✅ | Separadores corretos |
| mapsUrl encodeURIComponent | ✅ | UTF-8 safe |
| Phone validator (BR pattern) | ✅ | PDV-0193 rejeitado corretamente |
| CLAUDE.md documenta APIs | ✅ | Build-time (ViaCEP, Nominatim) + runtime (ViaCEP) explicitados |
| Decoupling prebuild/pdvs:refresh | ✅ | Rodam separados; CI-safe |
| TypeScript strict compliance | ✅ | Zero any, tipos novos bem formados |
| CardPDV.stories fake PDV | ✅ | Inclui tier, numero, complemento, enriched |
| BuscaRapida regressão | ✅ | Sem mudança, compatível com novo schema |
| MapaBrasil regressão | ✅ | Sem mudança, compatível com novo schema |
| ListaPDVs regressão | ✅ | Sem mudança, compatível com novo schema |
| Store schema compatibility | ✅ | Tipos atualizam sem quebra |

---

## Warnings

1. **Tier C Inconsistência de Dados** — Alguns PDVs Tier C em pdvs.json têm `endereco` não-vazio apesar da tier indicar localização apenas por cidade. Isso é intencional (fallback do script) ou edge case? Sugestão: adicionar nota em `pdvs-meta.json` sobre Tier C data quality.

2. **Nominatim Rate Limiting** — Script roda com `--skip-geocode` por padrão em builds (comentário linha 418). Confirmar se isso é aceitável na CI/CD ou se precisam reabilitar geocoding com caching mais agressivo.

---

## Priority Fixes
Nenhum erro crítico. Sugestões opcionais:
1. Documentar política de Tier C (sempre cidade-only ou aceita endereços parciais).
2. Adicionar comentário em CardPDV sobre comportamento Tier C para futuros devs.

---

## Regressões Verificadas
- ✅ BuscaRapida — usa store, filter lógica, ViaCEP call intacta
- ✅ MapaBrasil — activeUfs struct, tooltip lógica intacta
- ✅ ListaPDVs — pagination, CardPDV renderização intacta
- ✅ Store — context API, filter logic, no breaking changes

---

**Report saved to:** `docs/QA_REPORT_ONDE_COMPRAR_V2.md`
