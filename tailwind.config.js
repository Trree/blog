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
            50: '#eef0ff',
            100: '#d8dcff',
            200: '#b1b9ff',
            300: '#7a86f5',
            400: '#4350e3',
            500: '#1519d1',  // 主色调
            600: '#1214b3',
            700: '#0f1095',
            800: '#0d0e7a',
            900: '#0a0c65',
            950: '#050740',
          },
        },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
