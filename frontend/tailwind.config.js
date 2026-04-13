 /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'br-base': '#2b1718',
        'br-surface': '#153a42',
        'br-teal': '#027f93',
        'br-amber': '#f78b04',
        'br-crimson': '#a30502',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}