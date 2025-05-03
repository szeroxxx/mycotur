/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#CF6D4C',
        'primary-light': '#E7A586',
        secondary: '#F0EBE4',
        dark: '#262F38',
        gray: {
          light: '#e5e5e5',
          DEFAULT: '#666666',
          dark: '#333333',
        },
      },
    },
  },
  plugins: [],
}; 