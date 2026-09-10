/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta clásica de barbería (poste de barbero: negro, blanco, rojo, azul)
        barber: {
          black: "#111111",
          ink: "#1c1c1c",
          red: "#e11d2a",
          "red-dark": "#b3121d",
          blue: "#1e50a0",
          "blue-dark": "#173e7d",
          cream: "#f5f3ef",
          gray: "#6b7280",
        },
      },
      fontFamily: {
        display: ["var(--font-oswald)", "Impact", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
