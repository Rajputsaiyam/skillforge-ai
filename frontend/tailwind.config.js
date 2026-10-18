/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        sky: '#38BDF8',
        lightSky: '#E0F2FE',
        veryLightBlue: '#F0F9FF',
        navy: '#0F172A',
        darkBlue: '#172554',
        accent: '#06B6D4',
        slate: '#475569',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 20px -4px rgba(15, 23, 42, 0.07)',
        cardHover: '0 16px 36px -8px rgba(37, 99, 235, 0.18), 0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        glass: '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
        glow: '0 0 24px -2px rgba(37, 99, 235, 0.35)',
        glowEmerald: '0 0 24px -2px rgba(16, 185, 129, 0.35)',
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
        'purple-gradient': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'hero-gradient': 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 60%)',
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15), transparent 70%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};
