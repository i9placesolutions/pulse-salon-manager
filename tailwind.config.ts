import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#db2777",
          soft: "#fce7f3",
          dark: "#be185d",
          foreground: "#ffffff",
          "50": "#fdf2f8",
          "100": "#fce7f3",
          "200": "#fbcfe8",
          "300": "#f9a8d4",
          "400": "#f472b6",
          "500": "#db2777",
          "600": "#be185d",
          "700": "#9d174d",
          "800": "#831843",
          "900": "#70193c"
        },
        secondary: {
          DEFAULT: "#ffffff",
          soft: "#f8f9fa",
          dark: "#e9ecef",
          foreground: "#313649",
        },
        neutral: {
          DEFAULT: "#313649",
          soft: "#4a4f66",
          dark: "#252837",
          "50": "#f8f9fa",
          "100": "#e9eaed",
          "200": "#cfd1d8",
          "300": "#a9adb9",
          "400": "#7c8294",
          "500": "#5c637a",
          "600": "#485066",
          "700": "#313649",
          "800": "#272c3c",
          "900": "#1f2532"
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-3px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(3px)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out",
        "shake": "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
