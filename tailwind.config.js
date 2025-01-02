/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
      'ibm': ['IBM Plex Sans Thai', 'sans-serif'],
      },
      colors: {
        tfpa_gold: '#D09A3F',
        tfpa_blue: '#003375',
        tfpa_gold_pale: '#E4C794',
        tfpa_gold_hover: '#855D19',
        tfpa_blue_hover: '#002957',
        tfpa_blue_panel_select: '#1C57A4',
        tfpa_light_blue: '#86EAE9',
      },
    },
  },
  plugins: [],
}