/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#172033',
        },
        navy: {
          900: '#0f172a',
          800: '#1e293b',
        },
        flood: {
          blue: '#0284c7',
          deep: '#0369a1',
          teal: '#0d9488',
          amber: '#d97706',
          red: '#dc2626'
        }
      }
    },
  },
  plugins: [],
}
