/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ingazi-blue':       '#3D4DB7',
        'ingazi-blue-dark':  '#2E3A9A',
        'ingazi-blue-light': '#5B6DD4',
        'ingazi-blue-muted': 'rgba(61,77,183,0.08)',
        'ingazi-orange':     '#F5A623',
        'ingazi-orange-dark':'#E09000',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pill': '40px',
      },
    },
  },
  plugins: [],
}