import type { Meta, StoryObj } from '@storybook/nextjs'
import { RevendaSection } from './RevendaSection'

const meta = {
  title: 'Sections/Revenda',
  component: RevendaSection,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof RevendaSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}
