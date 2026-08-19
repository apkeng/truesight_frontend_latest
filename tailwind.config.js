/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Institutional palette used by the dashboard shells and their pages.
        cream: "#F7F4EE",
        parchment: "#FBFAF7",
        ink: {
          DEFAULT: "#0B1A2B",
          soft: "#132840",
          muted: "#8A97A6",
        },
        navy: {
          DEFAULT: "#0B3A6F",
          dark: "#082B53",
          light: "#12518F",
          wash: "#E8F0FA",
        },
        line: {
          DEFAULT: "#E2DDD3",
          soft: "#EFEBE3",
        },
      },
      fontFamily: {
        // Landing page pairing: angular display face over a neutral UI face.
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sharp: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
