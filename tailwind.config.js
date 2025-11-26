/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background / Base
        background: {
          DEFAULT: '#0A0F26',
          secondary: '#111832',
        },
        surface: '#1A2447',
        
        // Roxo Estelar
        primary: {
          DEFAULT: '#6A30FF',
          hover: '#8A52FF',
          light: '#B57CFF',
          glow: '#D6B8FF',
        },
        
        // Texto
        text: '#D6B8FF',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
