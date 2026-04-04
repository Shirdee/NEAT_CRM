import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10243f",
        sand: "#f5f0e7",
        coral: "#dd6b4d",
        teal: "#2b7a78",
        mist: "#dce8e7"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(16, 36, 63, 0.08)"
      },
      fontFamily: {
        sans: ["Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
