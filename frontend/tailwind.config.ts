import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:      ['Futura PT', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        header:    ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        mono:      ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display:   ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        /* ── Skywin Brand Palette ── */
        navy: {
          50:  '#eef3ff',
          100: '#dce7ff',
          200: '#b3ccff',
          300: '#80a8ff',
          400: '#4d7bff',
          500: '#1a5fd4',
          600: '#0d2855',  /* primary navy */
          700: '#071a3e',  /* deep navy    */
          800: '#040f24',
          900: '#020810',
          950: '#000000',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1a5fd4',
          700: '#1a3d7a',
          800: '#0d2855',
          900: '#071a3e',
        },
        skywin: {
          primary:     '#23364F',
          secondary:   '#45576D',
          navy:        '#23364F',
          'navy-dark': '#04060a',
          'navy-light':'#45576D',
          white:       '#ffffff',
          'off-white': '#e8edf8',
          black:       '#000000',
          'near-black':'#04060a',
        },
      },
      backgroundImage: {
        'gradient-navy':       'linear-gradient(135deg, #04060a 0%, #23364F 50%, #45576D 100%)',
        'gradient-navy-blue':  'linear-gradient(135deg, #04060a 0%, #23364F 50%, #45576D 100%)',
        'gradient-blue':       'linear-gradient(135deg, #23364F 0%, #45576D 100%)',
        'gradient-dark':       'linear-gradient(135deg, #000000 0%, #04060a 100%)',
        'gradient-section-sep':'linear-gradient(90deg, transparent, rgba(69,87,109,0.35), transparent)',
      },
      boxShadow: {
        'glow-navy':  '0 0 30px rgba(35, 54, 79, 0.50)',
        'glow-blue':  '0 0 30px rgba(69, 87, 109, 0.40)',
        'glow-hover': '0 0 50px rgba(69, 87, 109, 0.60)',
      },
    },
  },
  plugins: [],
};

export default config;
