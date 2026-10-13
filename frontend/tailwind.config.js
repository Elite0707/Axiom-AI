/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Harvey AI Reverse-Engineered Design System Tokens
        harvey: {
          ink: '#0f0e0d',            // Harvey deepest ink background
          obsidian: '#151412',       // Surface 1
          charcoal: '#1f1d1a',       // Base warm charcoal
          surface: '#25231f',        // Card / section surface
          card: '#2b2824',          // Elevated component surface
          border: '#38352e',         // Primary fine border
          borderSubtle: '#2c2923',   // Subtle divider
          ivory: '#fafaf9',          // Primary high-contrast ivory text
          cream: '#f2f1f0',          // Secondary text
          textDim: '#cccac6',        // Body muted text
          muted: '#8f8b85',          // Captions & placeholders
          darkMuted: '#524f49',      // Disabled states
          highlighter: '#f6f202',    // Signature Harvey highlighter yellow
          highlighterText: '#1f1d1a',
          gold: '#cba766',           // M&A luxury accent gold
          emerald: '#16a34a',        // Low risk / healthy
          amber: '#eab308',          // Medium risk / warnings
          coral: '#f26161',          // High risk / critical
        },
        // Backward-compatible alias
        axiom: {
          bg: '#0f0e0d',
          surface: '#1f1d1a',
          card: '#25231f',
          border: '#38352e',
          accent: '#fafaf9',
          accentHover: '#e5e5e3',
          gold: '#cba766',
          success: '#16a34a',
          warning: '#eab308',
          danger: '#f26161',
          muted: '#8f8b85',
          text: '#fafaf9',
          textDim: '#cccac6',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
        tight: '-0.0125em',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.45)',
        'highlighter': '0 0 12px rgba(246, 242, 2, 0.25)',
      }
    },
  },
  plugins: [],
}
