import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        portal: {
          primary: 'var(--portal-primary, #1890ff)',
          secondary: 'var(--portal-secondary, #001529)',
        },
      },
      fontFamily: {
        sans: ['var(--portal-font, Inter)', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        outfit: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        script: ['Caveat', 'cursive'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
