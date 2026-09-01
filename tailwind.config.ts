import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FDF8F5",
          100: "#FBEFEA",
          200: "#F5D8CE",
          300: "#EEBAAA",
          400: "#DE8B72",
          500: "#C85A32", // Spiced Terracotta
          600: "#B04420",
          700: "#96381E", // Dark Paprika
          800: "#7D2E19",
          900: "#672817",
          950: "#381208",
        },
        editorial: {
          surface: "#FAF7F2",
          surfaceAlt: "#F3EDE4",
          card: "#FFFFFF",
          border: "#EAE1D5",
          borderStrong: "#D7C7B5",
          text: "#211A16",
          muted: "#665952",
          lightMuted: "#9B8E85",
        },
        sage: {
          50: "#F2F6F3",
          100: "#E1ECE3",
          500: "#4A6B53",
          700: "#344E3B",
        },
        honey: {
          50: "#FDF8F0",
          100: "#FBF0DE",
          500: "#D9822B",
          700: "#9C5815",
        },
        berry: {
          50: "#FAF0F3",
          100: "#F5DEE6",
          500: "#8A2846",
          700: "#5F1B30",
        },
        indigoMuted: {
          50: "#F2F4F8",
          100: "#E2E6F0",
          500: "#455A75",
          700: "#2E3D52",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: [
          "var(--font-sans)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(33, 26, 22, 0.06), 0 1px 4px -1px rgba(33, 26, 22, 0.04)",
        "card-hover":
          "0 12px 24px -6px rgba(33, 26, 22, 0.12), 0 4px 8px -2px rgba(33, 26, 22, 0.06)",
        float: "0 20px 35px -8px rgba(33, 26, 22, 0.15)",
      },
      borderRadius: {
        editorial: "12px",
        badge: "9999px",
      },
      aspectRatio: {
        pin: "2 / 3",
        "recipe-hero": "16 / 9",
        "recipe-card": "4 / 3",
      },
    },
  },
  plugins: [],
};

export default config;
