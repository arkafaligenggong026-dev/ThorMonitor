import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00A2E9",
          50: "#E6F7FE",
          100: "#CCEFFD",
          200: "#99DFFB",
          300: "#66CFF9",
          400: "#33BFF7",
          500: "#00A2E9",
          600: "#0082BB",
          700: "#00618C",
          800: "#00415D",
          900: "#00202F",
        },
        accent: {
          DEFAULT: "#FBB910",
          50: "#FFF9E9",
          100: "#FEF0C7",
          200: "#FDE29A",
          300: "#FCD46C",
          400: "#FBC73E",
          500: "#FBB910",
          600: "#C9930D",
          700: "#976E0A",
          800: "#654906",
          900: "#332503",
        },
        status: {
          open: "#64748B",
          assigned: "#FBB910",
          progress: "#F97316",
          resolved: "#22C55E",
          closed: "#0D9488",
        },
        ink: "#1F2937",
        canvas: "#F3F4F6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
