import type { Preview } from '@storybook/nextjs'
import React from 'react'
import { Inter, Oswald, Permanent_Marker } from 'next/font/google'
import '../src/app/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-heading-var',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  variable: '--font-accent-var',
  display: 'swap',
  weight: '400',
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: { test: 'todo' },

    backgrounds: {
      default: 'light',
      values: [
        { name: 'light',  value: '#FAFAF8' },
        { name: 'cream',  value: '#F5E6D0' },
        { name: 'dark',   value: '#2D1810' },
        { name: 'orange', value: '#E87A1E' },
      ],
    },

    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (375px)',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        mobileLg: {
          name: 'Mobile Large (430px)',
          styles: { width: '430px', height: '932px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        wide: {
          name: 'Wide (1440px)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
  },

  decorators: [
    (Story) => (
      <div
        className={`${inter.variable} ${oswald.variable} ${permanentMarker.variable} antialiased`}
      >
        <Story />
      </div>
    ),
  ],

  tags: ['autodocs'],
}

export default preview
