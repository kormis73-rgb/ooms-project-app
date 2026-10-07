/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2f9f1',
          100: '#e1f3e0',
          500: '#34a853',
          600: '#2e9647',
          700: '#257838',
          900: '#154420',
        },
        harvest: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        kakao: {
          yellow: '#FEE500',
          label: '#191919',
          bg: '#BACEE0',
        }
      }
    },
  },
  plugins: [],
}
