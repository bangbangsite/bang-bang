import type { Meta, StoryObj } from '@storybook/nextjs'
import { CTASection } from './CTASection'

const meta = {
  title: 'Sections/CTA',
  component: CTASection,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CTASection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}
