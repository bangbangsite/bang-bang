import type { Meta, StoryObj } from '@storybook/nextjs'
import pdvsData from '@/data/pdvs.json'
import activeUfsData from '@/data/pdvs-active-ufs.json'
import type { PDV, PDVsByUF } from '@/lib/types/pdv'
import { OndeComprarSection } from './index'

// OndeComprarSection is a client component but renders inside a Server
// Component parent that fetches merged PDVs (build-time JSON + Supabase
// overrides) and passes them as props. Stories use the raw build-time JSON
// because the Storybook canvas has no Supabase connection.

const pdvs = pdvsData as PDV[]
const activeUfs = activeUfsData as PDVsByUF[]
const defaultArgs = { pdvs, activeUfs } as const

const meta = {
  title: 'Sections/OndeComprar',
  component: OndeComprarSection,
  tags: ['autodocs'],
  args: defaultArgs,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Seção completa "Onde Comprar" — instancia OndeComprarProvider e compõe ' +
          'BuscaRapida + MapaBrasil + ListaPDVs. A lista de PDVs chega via props ' +
          'do servidor (getMergedPDVs), que une pdvs.json build-time com os overrides ' +
          'do dashboard salvos em Supabase.',
      },
    },
  },
} satisfies Meta<typeof OndeComprarSection>

export default meta
type Story = StoryObj<typeof meta>

/** Seção completa em desktop — layout two-column (busca + mapa) acima da lista. */
export const Default: Story = {
  args: defaultArgs,
}

/** Mesma seção em mobile (375 × 667) — layout colapsa para coluna única. */
export const Mobile: Story = {
  args: defaultArgs,
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

/** Seção em tablet (768 × 1024) — transição entre layout mobile e desktop. */
export const Tablet: Story = {
  args: defaultArgs,
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}
