/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mob: {
          bg: '#0a0a0f',
          card: '#14141f',
          border: '#2a2a3d',
          gold: '#fbbf24',
          crimson: '#dc2626',
          accent: '#6366f1',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(251, 191, 36, 0.15)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
