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
        satco: {
          navy: "#0A192F",
          gold: "#D4AF37",
          charcoal: "#1F2937",
          cream: "#F9F8F6",
          emerald: "#10B981",
          crimson: "#EF4444"
        }
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
        latin: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
