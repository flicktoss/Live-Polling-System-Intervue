/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(119, 101, 218)',
          dark: 'rgb(87, 103, 208)',
          deeper: 'rgb(79, 13, 206)',
        },
        'gray-light': 'rgb(242, 242, 242)',
        'gray-dark': 'rgb(55, 55, 55)',
        'gray-mid': 'rgb(110, 110, 110)',
      },
    },
  },
  plugins: [],
}
