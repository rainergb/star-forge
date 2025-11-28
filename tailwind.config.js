/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background / Base
        background: {
          DEFAULT: "#0b0d27",
          secondary: "#111832"
        },
        surface: "#1A2447",

        // Roxo Estelar
        primary: {
          DEFAULT: "#6A30FF",
          hover: "#8A52FF",
          light: "#B57CFF",
          glow: "#D6B8FF"
        },

        error: {
          DEFAULT: "#FF4D6D"
        },

        // Texto
        text: "#E8E8FF"
      },
      fontFamily: {
        sans: [
          "Saira",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Helvetica Neue",
          "sans-serif"
        ]
      },
      animation: {
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
