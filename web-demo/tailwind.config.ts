import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1b3a4b", deep: "#0f172a" },
        teal: { DEFAULT: "#0d9488", soft: "rgba(13,148,136,0.14)", dark: "#0f766e" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sheet: "0 8px 32px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
