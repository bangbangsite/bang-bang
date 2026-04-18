import type { Meta, StoryObj } from '@storybook/nextjs'
import { EventosSection } from './EventosSection'

const meta = {
  title: 'Sections/Eventos',
  component: EventosSection,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof EventosSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}
