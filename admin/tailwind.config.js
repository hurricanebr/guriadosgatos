/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7B35D8',
          dark: '#2D1564',
          light: '#E8D5FF',
          accent: '#FFB8C6',
          bg: '#FDFBFF',
          hover: '#F0E6FF',
        },
      },
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'],
        heading: ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
}
