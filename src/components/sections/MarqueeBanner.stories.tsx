import type { Meta, StoryObj } from '@storybook/nextjs'
import { MarqueeBanner } from './MarqueeBanner'

const meta = {
  title: 'Sections/Marquee',
  component: MarqueeBanner,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof MarqueeBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}
