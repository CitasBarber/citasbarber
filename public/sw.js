// Service worker mínimo. Su único objetivo es habilitar la instalación de la
// PWA (Chrome exige un SW con manejador 'fetch' para considerar el sitio
// instalable). No cachea nada: siempre va a la red, así el barbero y el
// cliente ven siempre datos frescos de las citas.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Pass-through: dejamos que el navegador maneje la petición normalmente.
});
