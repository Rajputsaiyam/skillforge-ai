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
        slate: '#475569',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -4px rgba(15, 23, 42, 0.08)',
        cardHover: '0 8px 24px -6px rgba(37, 99, 235, 0.18)',
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
        'hero-gradient': 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 60%)',
      },
    },
  },
  plugins: [],
};
