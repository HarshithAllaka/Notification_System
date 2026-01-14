/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        nykaa: {
          50: '#fff0f5',
          100: '#ffe3ec',
          200: '#ffc9d9',
          300: '#ff9fc0',
          400: '#ff669e',
          500: '#fc2779', // Official Nykaa Pink
          600: '#e61e6b',
          700: '#bf0f53',
          800: '#9e1045',
          900: '#83123c',
        },
        brand: {
          dark: '#0f172a',
          light: '#f8fafc',
          purple: '#7e22ce',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}