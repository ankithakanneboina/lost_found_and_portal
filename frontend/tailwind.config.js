/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      colors: {
        ink: {
          50: '#f0f0f2',
          100: '#d9d9e0',
          200: '#b3b3c0',
          300: '#8c8ca0',
          400: '#666680',
          500: '#404060',
          600: '#2a2a48',
          700: '#1a1a30',
          800: '#0f0f20',
          900: '#070712'
        },
        accent: {
          DEFAULT: '#ff6b35',
          light: '#ff8f63',
          dark: '#e55520'
        },
        found: {
          DEFAULT: '#00c896',
          light: '#33d4aa',
          dark: '#009870'
        },
        lost: {
          DEFAULT: '#ff4757',
          light: '#ff6b78',
          dark: '#cc3344'
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'pulse-dot': 'pulseDot 2s infinite',
        'shimmer': 'shimmer 1.5s infinite'
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.4)', opacity: 0.6 }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        }
      }
    }
  },
  plugins: []
}
