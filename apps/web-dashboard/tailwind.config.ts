import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary-rgb, 59 130 246) / <alpha-value>)',
          hover: 'var(--color-primary-hover, #2563EB)',
          foreground: 'var(--color-primary-foreground, #FFFFFF)',
        },
        brand: {
          50: '#e6f7ff',
          100: '#bae7ff',
          500: 'rgb(var(--color-primary-rgb, 24 144 255) / <alpha-value>)',
          600: 'rgb(var(--color-primary-rgb, 9 109 217) / <alpha-value>)',
          900: '#002766',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
