import type { Meta, StoryObj } from '@storybook/nextjs'
import { OndeComprarSection } from './index'

// ---------------------------------------------------------------------------
// NOTE — Server Component caveat
// ---------------------------------------------------------------------------
// OndeComprarSection is a React Server Component (no "use client" directive).
// @storybook/nextjs supports RSC rendering, but only when the Next.js
// experimental RSC flag is enabled in .storybook/main.ts
// (experimentalRSC: true + Next.js >=14.3).
//
// If the story fails with "cannot import server-only module" or a similar
// RSC boundary error, uncomment the lazy wrapper below and comment out the
// direct import above:
//
//   import dynamic from 'next/dynamic'
//   const OndeComprarSection = dynamic(
//     () => import('./index').then((m) => ({ default: m.OndeComprarSection })),
//     { ssr: false },
//   )
//
// That forces client-side rendering inside the canvas and avoids the RSC
// constraint entirely. The visual output is identical.
// ---------------------------------------------------------------------------

const meta = {
  title: 'Sections/OndeComprar',
  component: OndeComprarSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Seção completa "Onde Comprar" — server wrapper que importa pdvs.json e pdvs-active-ufs.json ' +
          'estaticamente, instancia OndeComprarProvider e compõe BuscaRapida + MapaBrasil + ListaPDVs. ' +
          'Se esta story lançar erro de RSC, veja o comentário no arquivo .stories.tsx para o workaround com next/dynamic.',
      },
    },
  },
} satisfies Meta<typeof OndeComprarSection>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Seção completa em desktop — layout two-column (busca + mapa) acima da lista. */
export const Default: Story = {}

/** Mesma seção em mobile (375 × 667) — layout colapsa para coluna única. */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

/** Seção em tablet (768 × 1024) — transição entre layout mobile e desktop. */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}
