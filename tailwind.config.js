/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de la marca activa: salen de variables CSS definidas por
        // [data-brand] (ver src/lib/brands.js). Se usan los canales RGB para
        // que funcionen los modificadores de opacidad (bg-brand/10).
        brand: {
          DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)",
          "on-dark": "rgb(var(--brand-on-dark-rgb) / <alpha-value>)",
          deep: "rgb(var(--brand-deep-rgb) / <alpha-value>)",
          soft: "rgb(var(--brand-soft-rgb) / <alpha-value>)",
          accent: "rgb(var(--brand-accent-rgb) / <alpha-value>)",
        },
        "on-brand": "rgb(var(--on-brand-rgb) / <alpha-value>)",
        // Neutros oficiales de CitasApp (iguales en todas las marcas)
        tinta: "rgb(var(--tinta-rgb) / <alpha-value>)",
        hueso: "rgb(var(--hueso-rgb) / <alpha-value>)",
        crema: "rgb(var(--crema-rgb) / <alpha-value>)",
        pizarra: "rgb(var(--pizarra-rgb) / <alpha-value>)",
        linea: "rgb(var(--linea-rgb) / <alpha-value>)",
        whatsapp: {
          DEFAULT: "var(--whatsapp)",
          deep: "var(--whatsapp-deep)",
        },
        cobre: "var(--cobre)",
        "cobre-profundo": "var(--cobre-profundo)",
        "azul-acero": "var(--azul-acero)",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "Impact", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        letrero: ["var(--font-anton)", "Impact", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
