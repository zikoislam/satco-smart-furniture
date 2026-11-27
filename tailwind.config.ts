import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Theme Colors imported from D:\AI Software
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c", // iPhone 17 Pro Sunset Orange
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
          primary: "#ea580c",
          hover: "#c2410c",
          light: "#2a1205",
        },
        surface: {
          dark: "#0b1120",
          card: "#1e293b",
          border: "#334155",
        },
        satco: {
          navy: "#0A192F",
          gold: "#D4AF37",
          charcoal: "#1F2937",
          cream: "#F9F8F6",
          emerald: "#10B981",
          crimson: "#EF4444",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
        latin: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
