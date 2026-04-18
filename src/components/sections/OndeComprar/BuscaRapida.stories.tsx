import type { Meta, StoryObj } from '@storybook/nextjs'
import type { PDV, PDVsByUF } from '@/lib/types/pdv'
import pdvsData from '@/data/pdvs.json'
import activeUfsData from '@/data/pdvs-active-ufs.json'
import { OndeComprarProvider } from './store'
import { BuscaRapida } from './BuscaRapida'

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
  title: 'Sections/OndeComprar/BuscaRapida',
  component: BuscaRapida,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'CEP (8 dígitos) dispara ViaCEP real. Autocomplete sugere cidades e UFs presentes na base.',
      },
    },
  },
  decorators: [withStore],
} satisfies Meta<typeof BuscaRapida>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Input de busca em estado inicial — sem filtro ativo. */
export const Default: Story = {}

/** Mesma busca em viewport mobile (375 × 667). */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}
