/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'darcula-bg': '#1f2020',
        'darcula-card': '#3C3F41',
        'darcula-fg': '#A9B7C6',
        'darcula-border': '#4C5052',
        'darcula-accent': '#6196ED',
      },
    },
  },
  plugins: [],
}