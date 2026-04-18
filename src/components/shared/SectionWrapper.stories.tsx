import type { Meta, StoryObj } from '@storybook/nextjs'
import { SectionWrapper } from './SectionWrapper'

const SampleContent = ({ label }: { label: string }) => (
  <div className="max-w-[1280px] mx-auto px-4 md:px-8">
    <div className="border-2 border-dashed border-current opacity-40 rounded p-8 text-center font-semibold text-lg">
      {label}
    </div>
  </div>
)

const meta = {
  title: 'Shared/SectionWrapper',
  component: SectionWrapper,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    bg: {
      control: 'select',
      options: ['dark', 'light', 'cream', 'orange', 'custom'],
      description: 'Background color variant',
    },
    py: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Vertical padding scale',
    },
    customBg: {
      control: 'text',
      description: 'Tailwind class when bg="custom"',
    },
    id: {
      control: 'text',
    },
  },
} satisfies Meta<typeof SectionWrapper>

export default meta
type Story = StoryObj<typeof meta>

// --- bg variants ---

export const Dark: Story = {
  args: {
    bg: 'dark',
    py: 'lg',
    children: <SampleContent label="bg dark — #2D1810" />,
  },
}

export const Light: Story = {
  args: {
    bg: 'light',
    py: 'lg',
    children: <SampleContent label="bg light — #FAFAF8" />,
  },
}

export const Cream: Story = {
  args: {
    bg: 'cream',
    py: 'lg',
    children: <SampleContent label="bg cream — #F5E6D0" />,
  },
}

export const Orange: Story = {
  args: {
    bg: 'orange',
    py: 'lg',
    children: <SampleContent label="bg orange — #E87A1E" />,
  },
}

// --- py variants ---

export const PaddingSm: Story = {
  name: 'Padding — Sm',
  args: {
    bg: 'cream',
    py: 'sm',
    children: <SampleContent label="py sm — py-12 md:py-16" />,
  },
}

export const PaddingMd: Story = {
  name: 'Padding — Md',
  args: {
    bg: 'cream',
    py: 'md',
    children: <SampleContent label="py md — py-16 md:py-24" />,
  },
}

export const PaddingLg: Story = {
  name: 'Padding — Lg',
  args: {
    bg: 'cream',
    py: 'lg',
    children: <SampleContent label="py lg — py-20 md:py-32" />,
  },
}
