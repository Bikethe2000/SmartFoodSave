/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
      colors: {
        /* Primary Colors */
        emerald: {
          600: '#059669',
          700: '#047857',
        },
        /* Neutrals */
        slate: {
          900: '#1E293B',
          600: '#64748B',
          100: '#F8FAFC',
        },
        sand: '#F5F5F4',
        
        /* Accents */
        sage: '#A7F3D0',
        
        /* Alerts */
        alert: {
          red: '#EF4444',
          amber: '#F59E0B',
          green: '#10B981',
        },
      },
      spacing: {
        /* 4px grid system */
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(5, 150, 105, 0.15)',
        'glow-dark': '0 0 20px rgba(16, 185, 129, 0.18)',
      },
    },
  },
  plugins: [],
}
