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
        primary: {
          DEFAULT: '#00d084',
          dark: '#00a066',
        },
        secondary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        accent: {
          DEFAULT: '#fbbf24',
          dark: '#f59e0b',
        },
        dark: {
          bg: '#0f1419',
          card: '#1a1f2e',
          border: '#2d3748',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
