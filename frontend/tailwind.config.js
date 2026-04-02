/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-dark': '#1D4ED8',
        'primary-light': '#EFF6FF',
        accent: '#0E9F6E',
        'accent-light': '#F0FDF4',
        navy: '#0D1B2A',
        slate: {
          850: '#162032',
          900: '#0F172A',
          950: '#07111D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
};
