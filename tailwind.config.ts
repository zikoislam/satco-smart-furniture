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
        ebay: {
          blue: "#3665F3",
          darkBlue: "#0053A0",
          yellow: "#F5AF02",
          red: "#E53238",
          green: "#86B817",
          bg: "#FFFFFF",
          pageBg: "#F7F7F7",
          border: "#E5E5E5",
          borderDark: "#CCCCCC",
          text: "#191919",
          textSub: "#707070",
          pillBg: "#F2F2F2",
          bannerBg: "#F5F5F5",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
        latin: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
