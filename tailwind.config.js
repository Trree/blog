/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,md,mdx}',
    './data/**/*.{js,ts,jsx,tsx,md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f5ff',
          100: '#ebe6ff',
          200: '#d6ccff',
          300: '#b8a6ff',
          400: '#9a7cff',
          500: '#7b4dff',
          600: '#6a39e6',
          700: '#5b2dc2',
          800: '#4b259f',
          900: '#361975',
          950: '#1f0a4b',
        },
        accent: {
          100: '#e0fbff',
          200: '#b3efff',
          300: '#7cdfff',
          400: '#38cfff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        surface: {
          100: '#f5f6fb',
          200: '#e8ebf5',
          800: '#0b0f1e',
          900: '#050816',
        },
      },
      boxShadow: {
        glow: '0 25px 60px rgba(15, 23, 42, 0.35)',
        glass: '0 30px 80px rgba(5, 8, 22, 0.55)',
        innerGlow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'grid-dots':
          'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
        'aurora-1':
          'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 45%)',
        'aurora-2':
          'radial-gradient(circle at 80% 0%, rgba(14,165,233,0.3), transparent 40%)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
