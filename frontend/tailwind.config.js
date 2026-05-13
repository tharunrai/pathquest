/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   "#e0e5ec", // Classic soft Neumorphism base
          secondary: "#e0e5ec",
          card:      "#e0e5ec",
          border:    "#d1d9e6",
        },
        brand: {
          blue:   "#1976d2", // Material Primary Blue
          purple: "#7b1fa2", // Material Purple
          cyan:   "#0097a7",
          emerald:"#388e3c",
          amber:  "#f57c00",
          red:    "#d32f2f",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "neumorph-grad": "linear-gradient(145deg, #f0f5ff, #cacfdb)",
      },
      boxShadow: {
        "neu-out": "var(--skeuo-shadow-out)",
        "neu-out-sm": "var(--skeuo-shadow-out-sm)",
        "neu-in": "var(--skeuo-shadow-inset)",
        "neu-in-sm": "var(--skeuo-shadow-inset-sm)",
        "material-1": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        "material-2": "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in":   "slideIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

