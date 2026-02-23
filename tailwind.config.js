/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#faf8f5',
          100: '#f2ede4',
          200: '#e8dfd1',
          300: '#d9cbb5',
          400: '#c4ae90',
          500: '#b39070',
          600: '#9d7558',
          700: '#835f47',
          800: '#6b4f3c',
          900: '#574034',
        },
        ocean: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
      animation: {
        'fill-bar': 'fillBar 1.2s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fillBar: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}