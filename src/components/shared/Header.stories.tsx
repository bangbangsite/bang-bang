import type { Meta, StoryObj } from '@storybook/nextjs'
import { Header } from './Header'

const meta = {
  title: 'Shared/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default: transparent state — shown when the user is at the top of the page.
 * The dark background below simulates the hero section so the white nav is legible.
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'linear-gradient(180deg, #2D1810 0%, #4A2C1A 100%)',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Story />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(250,250,248,0.3)',
            fontSize: '14px',
            fontFamily: 'sans-serif',
          }}
        >
          Hero section — scroll para ver estado scrolled
        </div>
      </div>
    ),
  ],
}

/**
 * Scrolled: solid dark background state.
 * Uses a tall wrapper so Storybook's iframe actually allows scrolling,
 * but we force the scrolled appearance via CSS on a sibling div trick.
 * Since Header reads window.scrollY, the easiest honest approach is to wrap
 * the story in a tall page and let the user scroll — or use the decorator below
 * which injects an already-scrolled visual via a forced inline style override.
 *
 * Note: the component's scrolled class is applied by the useEffect when
 * window.scrollY > 100. In this story the wrapper is min-h-[200vh] so the
 * canvas can be scrolled to trigger it naturally.
 */
export const Scrolled: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200vh', background: '#F5E6D0' }}>
        <Story />
        <div
          style={{
            padding: '120px 32px 32px',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            color: '#4A2C1A',
          }}
        >
          Role para baixo nesta story para ver o header mudar para o estado com fundo escuro
          (window.scrollY &gt; 100px).
        </div>
      </div>
    ),
  ],
}

/**
 * MobileMenuOpen: viewport locked to 375px so the hamburger is visible.
 * The user can click the hamburger to open the full-screen mobile menu.
 */
export const MobileMenuOpen: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'linear-gradient(180deg, #2D1810 0%, #4A2C1A 100%)',
          minHeight: '100vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
}
