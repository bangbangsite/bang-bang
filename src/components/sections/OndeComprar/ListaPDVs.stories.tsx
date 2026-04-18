import type { Meta, StoryObj } from '@storybook/nextjs'
import type { PDV, PDVsByUF } from '@/lib/types/pdv'
import pdvsData from '@/data/pdvs.json'
import activeUfsData from '@/data/pdvs-active-ufs.json'
import { OndeComprarProvider } from './store'
import { ListaPDVs } from './ListaPDVs'

// ---------------------------------------------------------------------------
// Decorator — wraps every story in the context provider
// ---------------------------------------------------------------------------
const withStore = (Story: React.ComponentType) => (
  <OndeComprarProvider pdvs={pdvsData as PDV[]} activeUfs={activeUfsData as PDVsByUF[]}>
    <Story />
  </OndeComprarProvider>
)

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
const meta = {
  title: 'Sections/OndeComprar/ListaPDVs',
  component: ListaPDVs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [withStore],
} satisfies Meta<typeof ListaPDVs>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Lista completa sem filtro — exibe os 30 primeiros PDVs e o botão
 * "Carregar mais" com o total restante visível.
 */
export const Default: Story = {}

/** Lista em viewport mobile (375 × 667) — grid colapsa para coluna única. */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

/** Lista em viewport tablet (768 × 1024) — grid fica em 2 colunas. */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}
