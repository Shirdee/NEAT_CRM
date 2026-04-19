import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        teal: "rgb(var(--color-teal) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        "amber-text": "rgb(var(--color-amber-text) / <alpha-value>)",
        lime: "rgb(var(--color-lime) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        white: "rgb(var(--color-white) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(16, 36, 63, 0.12)",
        panel: "0 18px 44px rgba(16, 36, 63, 0.10)",
        card: "0 2px 12px rgba(16, 36, 63, 0.07)",
        hover: "0 6px 24px rgba(16, 36, 63, 0.11)",
        modal: "0 16px 48px rgba(16, 36, 63, 0.16)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "\"Segoe UI\"", "Arial", "sans-serif"],
        display: ["var(--font-manrope)", "\"Segoe UI\"", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
