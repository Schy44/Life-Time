/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#F5F3FF',   // Very light lavender
          100: '#EDE9FE',  // Lighter lavender
          200: '#DDD6FE',  // Light lavender
          300: '#C4B5FD',  // Medium light lavender
          400: '#A78BFA',  // Medium lavender
          500: '#8B5CF6',  // Default lavender
          600: '#7C3AED',  // Medium dark lavender
          700: '#6D28D9',  // Dark lavender
          800: '#5B21B6',  // Darker lavender
          900: '#4C1D95',  // Very dark lavender
        },
      },
    },
  },
  plugins: [],
}