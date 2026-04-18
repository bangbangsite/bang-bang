---
description: Build a complete home section end-to-end. Usage: /build-section [section-name]. Valid names: hero, marquee, sabores, revenda, numeros, parceiros, lifestyle, faq, cta-fechamento, footer. Orchestrates UX → UI → Dev → QA automatically.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# Build Section: $ARGUMENTS

Build the **$ARGUMENTS** section of the Bang Bang home page, end-to-end.

## Before Starting

1. Read `docs/HOME_ARCHITECTURE.md` and find section **$ARGUMENTS**
2. Read `docs/COPY_HOME.md` and find the copy for **$ARGUMENTS**
3. Read `docs/COMPONENT_SPECS.md` and find the specs for components used in **$ARGUMENTS**
4. Read `docs/RESPONSIVE_SPEC.md` for breakpoint rules
5. Read `docs/ANIMATION_GUIDE.md` for animation patterns
6. Read `docs/ASSETS_MAP.md` to check which images/assets are available

## Execution Pipeline

Run these steps IN ORDER. Each step feeds the next.

### Step 1 — UX Layout (delegate to @ux-architect)

Ask the UX Architect to:
- Define the final layout for this section (desktop + mobile)
- Confirm heading hierarchy fits the SEO plan
- Specify component arrangement and spacing
- Return a text wireframe

### Step 2 — UI Styling (delegate to @ui-designer)

Pass the UX layout to the UI Designer and ask to:
- Confirm which design tokens apply to this section
- Define any section-specific styles not yet in globals.css
- Specify hover states, active states, focus states
- If new Tailwind config entries are needed, add them

### Step 3 — Implementation (delegate to @frontend-dev)

Pass UX layout + UI styles + copy + specs to the Frontend Dev and ask to:
- Create the section component in `src/components/sections/`
- Use copy from COPY_HOME.md (not placeholder text)
- Use tokens from the Tailwind config
- Implement responsive behavior per RESPONSIVE_SPEC.md
- Add animations per ANIMATION_GUIDE.md
- Create a Storybook story for the section
- If the section needs sub-components not yet built, create them in `src/components/shared/`

### Step 4 — Integration

After the component is created:
- Import it in `src/app/page.tsx`
- Place it in the correct order per HOME_ARCHITECTURE.md
- Wrap in `<SectionWrapper>` with the correct bg and id

### Step 5 — QA Review (delegate to @qa-reviewer)

Ask the QA Reviewer (runs on Haiku — cheap) to:
- Check accessibility (headings, alt text, contrast, landmarks)
- Check responsive implementation
- Check that no anti-patterns from ANTI_PATTERNS.md were introduced
- Check that copy matches COPY_HOME.md exactly
- Return a report

### Step 6 — Report

Report to the user:
```
✅ Seção $ARGUMENTS implementada
📦 Componentes criados: [list]
📱 Responsivo: [status]
♿ Acessibilidade: [status]
⚠️ Issues encontrados: [list or "nenhum"]
🔗 Próximo passo: [suggestion]
```

## Section Name Map

| Input | Section | Architecture Ref |
|-------|---------|-----------------|
| hero | Hero | 01 |
| marquee | Marquee de Benefícios B2B | 02 |
| sabores | Os 4 Sabores | 03 |
| revenda | Por que Revender | 04 |
| numeros | Números / Credibilidade | 05 |
| parceiros | Parceiros / Prova Social | 06 |
| lifestyle | Seção B2C Lifestyle | 07 |
| faq | FAQ B2B | 08 |
| cta-fechamento | CTA de Fechamento | 09 |
| footer | Footer | 10 |
| header | Header (global) | Global |
