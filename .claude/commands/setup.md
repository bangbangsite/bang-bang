---
description: Initialize the Bang Bang site project from scratch — creates Next.js app, installs dependencies, configures Tailwind with custom tokens, sets up shadcn/ui, creates folder structure, and initializes Storybook. Run this once at the start.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# Project Setup: Bang Bang Site

Initialize the complete project environment. Follow these steps IN ORDER.

## Step 1 — Create Next.js App

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

If the directory already has files, the command may fail. In that case, create in a temp dir and move, or confirm overwrite.

## Step 2 — Install Core Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node
```

## Step 3 — Initialize shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Then install the components we'll need:

```bash
npx shadcn@latest add accordion button card badge separator
```

## Step 4 — Create Project Structure

```bash
mkdir -p src/components/ui
mkdir -p src/components/sections
mkdir -p src/components/shared
mkdir -p src/components/decorative
mkdir -p src/lib
mkdir -p src/styles
mkdir -p public/images/latas
mkdir -p public/images/parceiros
mkdir -p public/images/lifestyle
mkdir -p public/fonts
```

## Step 5 — Configure Design Tokens

Read `docs/DESIGN_TOKENS.md` and apply the tokens to:

1. `tailwind.config.ts` — Extend colors, fonts, spacing, borderRadius, animation
2. `src/styles/globals.css` — Add CSS custom properties (--bb-*) in :root
3. Add the custom `float` animation keyframes
4. Add the `marquee` animation keyframes

## Step 6 — Configure Fonts

In `src/app/layout.tsx`, set up fonts using `next/font`:

```typescript
import { Inter } from 'next/font/google'
// Consider: Oswald or Barlow Condensed for headings
// Consider: Permanent Marker for accent (use sparingly)
```

## Step 7 — Create Utility Helper

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Step 8 — Initialize Storybook

```bash
npx storybook@latest init
```

## Step 9 — Create Base Layout

Read `docs/SEO_METADATA.md` and set up the metadata in `src/app/layout.tsx`.
Create a clean layout with the heading structure defined in the SEO doc.

## Step 10 — Verify

```bash
npm run dev
```

Open http://localhost:3000 and confirm:
- Page loads without errors
- Custom fonts are loading
- Tailwind custom colors work (test with a colored div)
- No console errors

Then run Storybook:
```bash
npm run storybook
```

Confirm it opens on port 6006.

## Done

Report back to the user:
- ✅ Next.js running on localhost:3000
- ✅ Tailwind configured with Bang Bang tokens
- ✅ shadcn/ui initialized with base components
- ✅ Storybook running on localhost:6006
- ✅ Folder structure created
- ✅ SEO metadata configured
- Ready to start building components
