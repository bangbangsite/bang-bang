import type { Meta, StoryObj } from '@storybook/nextjs'
import { ParceirosSection } from './ParceirosSection'

const meta = {
  title: 'Sections/Parceiros',
  component: ParceirosSection,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof ParceirosSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}
