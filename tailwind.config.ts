import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Syntalys Brand Colors
        syntalys: {
          blue: "#03366d", // Color principal de Syntalys
          DEFAULT: "#03366d",
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
