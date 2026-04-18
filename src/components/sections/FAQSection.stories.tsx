import type { Meta, StoryObj } from '@storybook/nextjs'
import { FAQSection } from './FAQSection'

const meta = {
  title: 'Sections/FAQ',
  component: FAQSection,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof FAQSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
}

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
}

/**
 * ExpandedFirstItem — the Accordion component renders with `defaultValue={["item-1"]}`,
 * so the first question ("Como faço para revender Bang Bang?") opens automatically
 * on mount. This story documents that default open state. No extra args are needed
 * because the behavior is hardcoded in the component itself.
 *
 * Note: if the accordion is not visibly open in this story, confirm that the
 * shadcn/ui Accordion in `src/components/ui/accordion.tsx` accepts an array
 * value — the component passes `defaultValue={["item-1"]}` (array), which
 * requires the `type="multiple"` variant or a compatible shadcn build.
 */
export const ExpandedFirstItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The component sets `defaultValue={["item-1"]}` on mount, so the first FAQ item is pre-expanded. No interaction required. If the item appears closed, check that the shadcn Accordion used here supports array defaultValue (i.e. type="multiple" or the radix CollapsibleRoot variant).',
      },
    },
    viewport: { defaultViewport: 'desktop' },
  },
}
