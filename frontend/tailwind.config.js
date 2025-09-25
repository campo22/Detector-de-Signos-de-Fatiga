/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilitamos el modo oscuro
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Añadimos la paleta de colores y la fuente de tu diseño
      colors: {
        primary: '#06a8f9',
        'background-light': '#f5f7f8',
        'background-dark': '#0f1c23',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
