/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd9ff', 300: '#8ec1ff', 400: '#599dff',
          500: '#2f7bf6', 600: '#1d6fd1', 700: '#1a5bae', 800: '#1b4d8a', 900: '#1c4271',
        },
        accent: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857',
        },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 300: '#fcd34d', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        danger: { 50: '#fef2f2', 100: '#fee2e2', 300: '#fca5a5', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
