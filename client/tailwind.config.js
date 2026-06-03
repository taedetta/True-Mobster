/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mob: {
          bg: '#0a0a0a',
          card: '#141414',
          border: '#3d0000',
          gold: '#ef4444',
          crimson: '#b91c1c',
          accent: '#dc2626',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(220, 38, 38, 0.25)',
        'glow-lg': '0 0 32px rgba(220, 38, 38, 0.35)',
        card: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(127, 0, 0, 0.2)',
        item: '0 4px 16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #ef4444 0%, #b91c1c 50%, #7f1d1d 100%)',
        'imob-bg': 'linear-gradient(180deg, #0a0a0a 0%, #120000 45%, #0a0a0a 100%)',
      },
    },
  },
  plugins: [],
};
