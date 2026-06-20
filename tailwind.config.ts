import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070A12",
        panel: "#0D1220",
        panelAlt: "#11192C",
        border: "rgba(148,163,184,0.18)",
        text: "#E6EDF7",
        muted: "#94A3B8",
        accent: {
          DEFAULT: "#7C5CFF",
          soft: "#B39CFF"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,92,255,0.18), 0 20px 60px rgba(0,0,0,0.45)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(124,92,255,0.22), transparent 38%), radial-gradient(circle at top right, rgba(46,196,182,0.16), transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 55%)"
      }
    }
  },
  plugins: []
};

export default config;
