import type { Meta, StoryObj } from '@storybook/nextjs'
import { SectionTitle } from './SectionTitle'

const meta = {
  title: 'Shared/SectionTitle',
  component: SectionTitle,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    subtitle: {
      control: 'text',
    },
    align: {
      control: 'select',
      options: ['left', 'center'],
      description: 'Text alignment',
    },
    light: {
      control: 'boolean',
      description: 'White text variant for dark backgrounds',
    },
  },
} satisfies Meta<typeof SectionTitle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Sabores que dominam',
    align: 'left',
    light: false,
  },
}

export const WithSubtitle: Story = {
  args: {
    title: 'Para quem revende',
    subtitle: 'Margem real, giro garantido. Bang Bang é a bebida que o seu cliente já estava procurando.',
    align: 'left',
    light: false,
  },
}

export const Centered: Story = {
  args: {
    title: 'Escolha o seu',
    subtitle: '4 sabores. Alta saturação. Produto que se vende no olhar.',
    align: 'center',
    light: false,
  },
}

export const LightOnDark: Story = {
  name: 'Light — on Dark Background',
  args: {
    title: 'A bebida que não espera',
    subtitle: 'RTD de verdade. Sem diluição, sem desculpa.',
    align: 'left',
    light: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const LightCentered: Story = {
  name: 'Light Centered — on Dark Background',
  args: {
    title: 'Onde encontrar',
    align: 'center',
    light: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
