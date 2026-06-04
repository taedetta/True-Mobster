/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mob: {
          bg: '#0a0a0a',
          card: '#141414',
          border: '#3d3200',
          gold: '#d4af37',
          crimson: '#b8860b',
          accent: '#eab308',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(212, 175, 55, 0.25)',
        'glow-lg': '0 0 32px rgba(212, 175, 55, 0.35)',
        card: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(120, 90, 0, 0.25)',
        item: '0 4px 16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #fbbf24 0%, #d4af37 50%, #92400e 100%)',
        'tm-bg': 'linear-gradient(180deg, #0a0a0a 0%, #120e00 45%, #0a0a0a 100%)',
      },
    },
  },
  plugins: [],
};
