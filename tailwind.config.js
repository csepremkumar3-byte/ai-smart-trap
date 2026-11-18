/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cicr: {
          dark: '#114a2f',
          primary: '#165a39',
          sidebar: '#145334',
          accent: '#1e754a',
          light: '#f4f6f1',
          card: '#ffffff',
          border: '#e4e8e0',
          muted: '#637367',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
