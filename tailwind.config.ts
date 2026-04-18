import type { Config } from "tailwindcss";

// NOTE: In Tailwind v4, most configuration is done via CSS @theme in globals.css.
// This file exists for plugin compatibility and any v3-style overrides needed.
const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
