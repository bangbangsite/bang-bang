import type { Meta, StoryObj } from '@storybook/nextjs'
import { Container } from './Container'

const meta = {
  title: 'Shared/Container',
  component: Container,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Extra Tailwind classes merged into the container',
    },
  },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="bg-[#E87A1E] p-8 rounded text-white font-semibold text-center">
        Container content — max-w-[1280px], auto margins, responsive horizontal padding
      </div>
    ),
  },
}

export const WithMultipleChildren: Story = {
  name: 'WithMultipleChildren',
  args: {
    children: (
      <>
        <div className="bg-[#2D1810] text-white p-6 rounded mb-4 text-sm font-semibold">
          Seção A — distribuidores
        </div>
        <div className="bg-[#F5E6D0] text-[#1A1A1A] p-6 rounded text-sm font-semibold">
          Seção B — sabores
        </div>
      </>
    ),
  },
}
