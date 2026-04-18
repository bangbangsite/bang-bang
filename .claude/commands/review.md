---
description: Run a full QA review on all implemented components and pages. Delegates to qa-reviewer (Haiku — low token cost). Checks accessibility, SEO, responsive implementation, anti-patterns, and copy accuracy. Usage: /review or /review [specific-file-or-section]
allowed-tools: Read, Glob, Grep, Agent
---

# QA Review: $ARGUMENTS

Run a comprehensive quality review. If $ARGUMENTS specifies a file or section, review only that. Otherwise, review everything.

## Step 1 — Inventory

List all files to review:
```bash
# Find all components
find src/components -name "*.tsx" -type f

# Find page files
find src/app -name "*.tsx" -type f

# Find style files
find src/styles -name "*.css" -type f
```

## Step 2 — Delegate to QA Reviewer

Spawn @qa-reviewer (runs on Haiku — cheap) with the following checklist:

### Accessibility Audit
For each component file:
- [ ] Headings follow hierarchy (h1 → h2 → h3, no skips)
- [ ] All `<img>` and `<Image>` have meaningful `alt` text
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for large text)
- [ ] Interactive elements have focus styles
- [ ] Buttons have accessible labels
- [ ] Landmark roles present (header, main, nav, footer, section)
- [ ] Tab order is logical
- [ ] aria-labels where needed (icon-only buttons, complex widgets)

### SEO Check
- [ ] Single `<h1>` on the page
- [ ] Meta title and description present in layout.tsx
- [ ] OG tags configured
- [ ] Schema JSON-LD present
- [ ] Semantic HTML (section, article, nav, aside used correctly)
- [ ] Images have width/height to prevent CLS

### Anti-Pattern Check
Read `docs/ANTI_PATTERNS.md` and verify:
- [ ] No mixed B2B/B2C in same section
- [ ] No generic CTAs
- [ ] No long institutional text blocks
- [ ] No "IA e tecnologia" narrative
- [ ] No mascot competing with product
- [ ] Hero has segmented CTAs

### Copy Accuracy
Compare implemented text against `docs/COPY_HOME.md`:
- [ ] Headlines match exactly
- [ ] CTAs match exactly
- [ ] No "ciclo", "quinzena" in any visible text
- [ ] Legal notice present in footer ("Beba com moderação")

### Responsive Check
Verify against `docs/RESPONSIVE_SPEC.md`:
- [ ] Container max-width applied
- [ ] Padding matches spec per breakpoint
- [ ] Grids collapse correctly (4 → 2 → 1 col)
- [ ] FloatingElements hidden on mobile
- [ ] CTAs full-width on mobile
- [ ] No horizontal overflow at any breakpoint
- [ ] Touch targets min 44x44px

### Performance Check
- [ ] All images use `next/image`
- [ ] Hero images have `priority={true}`
- [ ] Fonts use `next/font`
- [ ] No unnecessary client components
- [ ] No unused imports
- [ ] No inline styles that should be Tailwind classes

## Step 3 — Generate Report

Format the report as:

```markdown
# QA Review Report — [date]

## Summary
✅ Passed: [count]
⚠️ Warnings: [count]
❌ Errors: [count]

## By Category

### Accessibility
[findings]

### SEO
[findings]

### Anti-Patterns
[findings]

### Copy
[findings]

### Responsive
[findings]

### Performance
[findings]

## Priority Fixes
1. [most critical]
2. [second]
3. [third]
```

Save the report to `docs/QA_REPORT.md` and present to the user.
