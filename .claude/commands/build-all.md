---
description: Build the entire Bang Bang home page from scratch. Runs /setup if not done, then builds all 10 sections in order plus global components. Full autopilot mode — only stops for critical decisions.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# Build All: Complete Home Page

Build the entire Bang Bang home page. This is the nuclear option — runs everything.

## Pre-flight Check

1. Check if `package.json` exists. If not, run the setup pipeline first:
   - Read `.claude/commands/setup.md` and execute it
   - Confirm dev server runs before continuing

2. Check if `tailwind.config.ts` has Bang Bang tokens. If not, configure them from `docs/DESIGN_TOKENS.md`

3. Read all docs:
   - `docs/HOME_ARCHITECTURE.md`
   - `docs/COPY_HOME.md`
   - `docs/COMPONENT_SPECS.md`
   - `docs/RESPONSIVE_SPEC.md`
   - `docs/ANIMATION_GUIDE.md`
   - `docs/ASSETS_MAP.md`
   - `docs/SEO_METADATA.md`

## Execution Order

### Phase 1 — Global Components
Build in this order (dependencies first):
1. `src/lib/utils.ts` (cn helper)
2. `src/components/shared/PlaceholderImage.tsx`
3. `src/components/shared/Button.tsx` (5 variants)
4. `src/components/shared/Container.tsx`
5. `src/components/shared/SectionWrapper.tsx`
6. `src/components/shared/SectionTitle.tsx`
7. `src/components/shared/Badge.tsx`
8. `src/components/sections/Header.tsx`
9. `src/components/sections/Footer.tsx`

### Phase 2 — Section Components (top to bottom)
Build each using the /build-section pipeline (UX → UI → Dev → QA):
1. `HeroSection`
2. `MarqueeBanner`
3. `ProductCard` + `ProductGrid`
4. `FeatureCard` + `FeatureGrid`
5. `NumberCounter` + `StatsGrid`
6. `LogoStrip`
7. `LifestyleGrid`
8. `FAQAccordion`
9. `CTABlock`

### Phase 3 — Page Assembly
1. Import all sections in `src/app/page.tsx`
2. Arrange in order per HOME_ARCHITECTURE.md
3. Add scroll-to IDs on each SectionWrapper
4. Configure metadata in layout.tsx per SEO_METADATA.md
5. Add schema JSON-LD script

### Phase 4 — QA
Run @qa-reviewer on the complete page.
Fix critical issues only (errors, not warnings).

## After Completion

Update `TODO.md` marking completed items.

Report:
```
🏠 HOME COMPLETA

Seções: [count]/10
Componentes: [count]
Storybook stories: [count]

✅ Rodando em localhost:3000
✅ QA: [passed/warnings/errors]

⏳ Pendente do cliente:
- [list from ASSETS_MAP.md with status 🔲]
```
