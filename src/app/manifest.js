// Manifest de la PWA. Next lo sirve en /manifest.webmanifest y añade el
// <link rel="manifest"> automáticamente. Permite instalar "770 Barbería"
// como app en la pantalla de inicio (Android en un toque; iOS manual).
export default function manifest() {
  return {
    name: "770 Barbería",
    short_name: "770 Barbería",
    description:
      "Agendá tu motilada en 770 Barbería sin llamadas ni filas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d0d0d",
    theme_color: "#111111",
    lang: "es-CO",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
