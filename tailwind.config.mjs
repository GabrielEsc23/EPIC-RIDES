/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'epic-blue': '#0A192F',
        'epic-blue-dark': '#060F1D',
        'epic-blue-light': '#132D52',
        'epic-blue-card': '#10233D',
        'epic-gold': '#F5B335',
        'epic-gold-light': '#FFC555',
        'epic-gold-dark': '#D4951B',
        'epic-gray-bg': '#F8F9FA',
        'epic-gray-border': 'rgba(10, 25, 47, 0.1)',
        'epic-text-muted': '#586878',
        'epic-whatsapp': '#25D366'
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
};
