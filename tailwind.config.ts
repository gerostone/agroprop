import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f7f3",
          100: "#dceee2",
          200: "#b9dcc7",
          300: "#8ec3a6",
          400: "#5ea780",
          500: "#3a8d63",
          600: "#2c7250",
          700: "#235b41",
          800: "#1d4734",
          900: "#173929"
        }
      }
    }
  },
  plugins: []
};

export default config;
