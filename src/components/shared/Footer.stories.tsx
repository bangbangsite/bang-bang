import type { Meta, StoryObj } from '@storybook/nextjs'
import { Footer } from './Footer'

const meta = {
  title: 'Shared/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    // Footer already has bg-[#2D1810] — no need to set backgrounds.default
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
