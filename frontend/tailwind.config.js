/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Harvey AI Black & White Dual-Tone System
        // Black Sidebar
        sidebar: {
          bg: '#0e0e10',
          hover: '#1a1a1d',
          active: '#242429',
          border: '#232328',
          text: '#ffffff',
          muted: '#8e8e93',
        },
        // White Main Canvas
        canvas: {
          bg: '#f9f9f8',             // Warm soft white from Harvey screenshot
          card: '#ffffff',           // Crisp white cards
          border: '#e6e5e2',         // Subtle card border
          borderSubtle: '#eeedea',
          text: '#121212',           // Rich black primary text
          textMuted: '#686763',      // Balanced gray secondary
          textLight: '#9a9994',      // Caption/subtle text
          hover: '#f4f4f2',
        },
        // Primary Interactive Tokens (Black & White)
        brand: {
          black: '#000000',
          white: '#ffffff',
          dark: '#171717',
          gray: '#525252',
          lightGray: '#f5f5f4',
          border: '#e5e5e5',
        },
        // Risk Accents (Subtle and Professional)
        risk: {
          high: '#dc2626',
          highBg: '#fef2f2',
          highBorder: '#fecaca',
          med: '#d97706',
          medBg: '#fffbeb',
          medBorder: '#fde68a',
          low: '#16a34a',
          lowBg: '#f0fdf4',
          lowBorder: '#bbf7d0',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
