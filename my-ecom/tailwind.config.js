/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(99 102 241 / <alpha-value>)',
          hover: 'rgb(129 140 248 / <alpha-value>)',
          active: 'rgb(79 70 229 / <alpha-value>)',
          subtle: 'var(--brand-subtle)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
          deep: 'var(--bg-deep)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-2)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          muted: 'var(--fg-muted)',
          subtle: 'var(--fg-subtle)',
        },
        line: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        success: 'rgb(16 185 129 / <alpha-value>)',
        warning: 'rgb(245 158 11 / <alpha-value>)',
        danger: 'rgb(244 63 94 / <alpha-value>)',
        info: 'rgb(14 165 233 / <alpha-value>)',
        // Legacy indigo scale (kept for any primary-* utilities still in use)
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
      fontFamily: {
        sans: ['var(--font-thai)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
