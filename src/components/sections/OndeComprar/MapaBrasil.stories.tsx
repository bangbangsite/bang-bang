import type { Meta, StoryObj } from '@storybook/nextjs'
import type { PDV, PDVsByUF } from '@/lib/types/pdv'
import pdvsData from '@/data/pdvs.json'
import activeUfsData from '@/data/pdvs-active-ufs.json'
import { OndeComprarProvider } from './store'
import { MapaBrasil } from './MapaBrasil'

// ---------------------------------------------------------------------------
// Decorators
// ---------------------------------------------------------------------------
const withStore = (Story: React.ComponentType) => (
  <OndeComprarProvider pdvs={pdvsData as PDV[]} activeUfs={activeUfsData as PDVsByUF[]}>
    <Story />
  </OndeComprarProvider>
)

const withMaxWidth = (Story: React.ComponentType) => (
  <div className="max-w-md mx-auto">
    <Story />
  </div>
)

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
const meta = {
  title: 'Sections/OndeComprar/MapaBrasil',
  component: MapaBrasil,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Click em estado ativo seta o filtro e dispara scroll suave até #onde-comprar-lista. ' +
          'No canvas do Storybook o scroll pode não funcionar porque o elemento #onde-comprar-lista ' +
          'não existe fora da seção completa — comportamento esperado.',
      },
    },
  },
  decorators: [withStore, withMaxWidth],
} satisfies Meta<typeof MapaBrasil>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Mapa com os 12 UFs ativos destacados em laranja. Estados sem cobertura aparecem em bege. */
export const Default: Story = {}

/** Mesmo mapa em viewport mobile (375 × 667). SVG se adapta via viewBox. */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}
