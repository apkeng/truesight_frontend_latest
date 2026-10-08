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
        // TrueSights product design system (Figma "Design System" page) used
        // by the revamped student app in src/revamp.
        ts: {
          canvas: "#F5F7FB",
          subtle: "#F8FAFC",
          border: "#E2E8F0",
          field: "#CBD5E1",
          ink: "#0F172A",
          body: "#334155",
          muted: "#64748B",
          faint: "#94A3B8",
          navy: "#243367",
          "navy-hover": "#1C2A57",
          deep: "#0B3A6F",
          night: "#062346",
          yellow: "#FEE047",
          "yellow-hover": "#FBD52B",
          blue: "#2563EB",
          wash: "#EFF6FF",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        lift: "0 10px 30px -12px rgba(15, 23, 42, 0.18)",
        pop: "0 24px 60px -20px rgba(15, 23, 42, 0.35)",
      },
      keyframes: {
        // Opacity only: a transform here would trap position:fixed overlays inside pages.
        "ts-fade": { from: { opacity: 0 }, to: { opacity: 1 } },
        "ts-wave": { "0%,100%": { transform: "scaleY(0.35)" }, "50%": { transform: "scaleY(1)" } },
        "ts-shimmer": { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
      },
      animation: {
        "ts-fade": "ts-fade 180ms ease-out both",
        "ts-wave": "ts-wave 900ms ease-in-out infinite",
        "ts-shimmer": "ts-shimmer 1.4s linear infinite",
      },
      fontFamily: {
        // Landing page pairing: angular display face over a neutral UI face.
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sharp: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
