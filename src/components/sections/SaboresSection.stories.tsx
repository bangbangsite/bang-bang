import type { Meta, StoryObj } from '@storybook/nextjs'
import { SaboresSection } from './SaboresSection'

const meta = {
  title: 'Sections/Sabores',
  component: SaboresSection,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof SaboresSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}
