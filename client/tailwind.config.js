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
        display: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(251, 191, 36, 0.2)',
        'glow-lg': '0 0 40px rgba(251, 191, 36, 0.25)',
        card: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
        item: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      },
    },
  },
  plugins: [],
};
