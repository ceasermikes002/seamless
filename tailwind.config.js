/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Seamless Design System Colors
        background: '#2f4964',
        backgroundAlt: '#16304a',
        accent: '#bc9e5e',
        accentSecondary: '#ebd085',
        neutral: '#c9c9c9',
        textPrimary: '#f5f5f5',
        textSecondary: '#d4d4d4',
        textTertiary: '#a3a3a3',
        textOnAccent: '#16304a',
        surface: '#2f4964',
        surfaceElevated: '#3a5a7a',
        surfaceHeader: '#16304a',
        // Legacy primary for compatibility
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#bc9e5e',
          600: '#a68d4f',
          700: '#907c3f',
          800: '#7a6b2f',
          900: '#645a1f',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.2)',
          black: 'rgba(0, 0, 0, 0.2)',
          blur: 'rgba(255, 255, 255, 0.1)',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}