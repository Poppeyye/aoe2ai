import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        aoe: {
          dark: "#0f1419",
          card: "#1a2332",
          border: "#2a3a4e",
          accent: "#c8a964",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        medieval: ["Cinzel", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
