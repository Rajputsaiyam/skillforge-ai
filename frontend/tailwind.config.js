import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0284C7',
        sky: {
          ...colors.sky,
          DEFAULT: '#38BDF8',
        },
        lightSky: '#E0F2FE',
        veryLightBlue: '#F0F9FF',
        navy: '#090D16',
        slateNavy: '#0F172A',
        darkBlue: '#0369A1',
        royalBlue: '#2563EB',
        accent: '#0EA5E9',
        slate: '#475569',
        slateMuted: '#64748B',
        success: '#059669',
        warning: '#D97706',
        danger: '#B91C1C',
        green: '#059669',
        studio: {
          bg: '#F8FBFF',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E0EEF8',
          borderHover: '#BAE6FD',
          pill: '#0284C7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 10px 24px -12px rgba(2, 132, 199, 0.08)',
        cardHover: '0 20px 40px -15px rgba(2, 132, 199, 0.16), 0 2px 6px rgba(15, 23, 42, 0.04)',
        glass: '0 8px 32px 0 rgba(2, 132, 199, 0.08)',
        glow: '0 0 25px rgba(56, 189, 248, 0.35)',
        glowPill: '0 10px 25px -4px rgba(2, 132, 199, 0.45)',
        glowEmerald: '0 8px 20px -4px rgba(5, 150, 105, 0.35)',
        studioFloat: '0 30px 60px -15px rgba(2, 132, 199, 0.14)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'shine-sweep': 'shineSweep 2.5s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shineSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

