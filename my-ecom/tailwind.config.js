/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4fc',
          100: '#BDE8F5',
          200: '#8dd5ed',
          300: '#4988C4',
          400: '#1C4D8D',
          500: '#1C4D8D',
          600: '#175a7a',
          700: '#0F2854',
          800: '#0a1d3d',
          900: '#050d18',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease',
        fadeInUp: 'fadeInUp 0.6s ease forwards',
        scaleIn: 'scaleIn 0.2s ease',
        shimmer: 'shimmer 1.5s infinite',
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
