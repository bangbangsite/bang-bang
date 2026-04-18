import type { Meta, StoryObj } from '@storybook/nextjs'
import type { PDV } from '@/lib/types/pdv'
import { CardPDV } from './CardPDV'

// ---------------------------------------------------------------------------
// Shared fake PDV — used across all stories
// ---------------------------------------------------------------------------
const fakePdv: PDV = {
  id: 'PDV-STORY-001',
  nome: 'Bar da Bang Bang',
  tipo: 'Bar',
  tier: 'A',
  endereco: 'Rua da Consolação',
  numero: '2900',
  complemento: '',
  bairro: 'Consolação',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '01302001',
  lat: -23.5563,
  lng: -46.6618,
  telefone: '(11) 98765-4321',
  horario: 'Ter-Sáb 18h-02h | Dom 14h-22h',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-23.5563,-46.6618',
  deliveryUrl: 'https://www.ze.delivery/bar-da-bang-bang',
  representante: null,
  observacoes: null,
  enriched: true,
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
const meta = {
  title: 'Sections/OndeComprar/CardPDV',
  component: CardPDV,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CardPDV>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** PDV completo com link de delivery e Maps. */
export const Default: Story = {
  args: {
    pdv: fakePdv,
  },
}

/** PDV sem link de delivery — só botão "Ver no Maps". */
export const SemDelivery: Story = {
  args: {
    pdv: {
      ...fakePdv,
      id: 'PDV-STORY-002',
      nome: 'Boteco do Cowboy',
      deliveryUrl: null,
    },
  },
}

/** Tipo "Bar" usa badge laranja. */
export const TipoBar: Story = {
  args: {
    pdv: {
      ...fakePdv,
      id: 'PDV-STORY-003',
      nome: 'O Saloon',
      tipo: 'Bar',
    },
  },
}

/** Tipo "Casa Noturna" usa badge escuro. */
export const TipoCasaNoturna: Story = {
  args: {
    pdv: {
      ...fakePdv,
      id: 'PDV-STORY-004',
      nome: 'Club Bang Bang',
      tipo: 'Casa Noturna',
      bairro: 'Vila Olímpia',
      horario: 'Sex-Sáb 23h-06h',
      deliveryUrl: null,
    },
  },
}

/** PDV sem horário definido — linha de horário não deve aparecer. */
export const SemHorario: Story = {
  args: {
    pdv: {
      ...fakePdv,
      id: 'PDV-STORY-005',
      nome: 'Empório Bang',
      tipo: 'Mercado',
      horario: null,
      bairro: 'Moema',
    },
  },
}

/** Tier C — só cidade, sem endereço exato. Mostra "Endereço exato sob consulta". */
export const TierC: Story = {
  args: {
    pdv: {
      ...fakePdv,
      id: 'PDV-STORY-006',
      nome: 'Conveniência do Centro',
      tipo: 'Conveniência',
      tier: 'C',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'Ouro Branco',
      uf: 'MG',
      enriched: false,
    },
  },
}

/** Endereço com complemento (apartamento/sala). */
export const ComComplemento: Story = {
  args: {
    pdv: {
      ...fakePdv,
      id: 'PDV-STORY-007',
      nome: 'Rooftop Bang',
      tipo: 'Rooftop',
      numero: '1500',
      complemento: 'Cobertura, Loja 3',
    },
  },
}
