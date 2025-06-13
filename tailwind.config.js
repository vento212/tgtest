/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'telegram-blue': '#22A7F0',
        'telegram-dark': '#23272F',
        'telegram-gray': '#2C313A',
        'telegram-card': '#23272F',
        'telegram-btn': '#22A7F0',
        'telegram-btn-dark': '#1B8AC6',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
} 