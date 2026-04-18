import type { Meta, StoryObj } from '@storybook/nextjs'
import { PlaceholderImage } from './PlaceholderImage'

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '256px' }}>{children}</div>
)

const meta = {
  title: 'Shared/PlaceholderImage',
  component: PlaceholderImage,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    flavor: {
      control: 'select',
      options: ['neutral', 'caipi', 'mule', 'spritz', 'bang'],
      description: 'Color palette tied to each flavor',
    },
    aspectRatio: {
      control: 'text',
      description: 'CSS aspect-ratio value (e.g. "1/1", "16/9", "3/4")',
    },
    label: {
      control: 'text',
      description: 'Descriptive label shown inside the placeholder',
    },
  },
  decorators: [
    (Story) => (
      <Wrap>
        <Story />
      </Wrap>
    ),
  ],
} satisfies Meta<typeof PlaceholderImage>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: {
    flavor: 'neutral',
    aspectRatio: '1/1',
  },
}

export const Caipi: Story = {
  args: {
    flavor: 'caipi',
    aspectRatio: '1/1',
  },
}

export const Mule: Story = {
  args: {
    flavor: 'mule',
    aspectRatio: '1/1',
  },
}

export const Spritz: Story = {
  args: {
    flavor: 'spritz',
    aspectRatio: '1/1',
  },
}

export const Bang: Story = {
  args: {
    flavor: 'bang',
    aspectRatio: '1/1',
  },
}

export const WithLabel: Story = {
  args: {
    flavor: 'caipi',
    aspectRatio: '1/1',
    label: 'Lata Caipirinha 350ml',
  },
}

export const Square: Story = {
  args: {
    flavor: 'neutral',
    aspectRatio: '1/1',
    label: 'Produto hero shot',
  },
}

export const Portrait: Story = {
  args: {
    flavor: 'bang',
    aspectRatio: '3/4',
    label: 'Foto verticcal produto',
  },
}

export const Landscape: Story = {
  args: {
    flavor: 'mule',
    aspectRatio: '16/9',
    label: 'Banner wide',
  },
}
