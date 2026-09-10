// Cabeceras de seguridad aplicadas a todas las rutas.
const securityHeaders = [
  // Evita que el sitio se embeba en iframes (anti-clickjacking / phishing).
  { key: "X-Frame-Options", value: "DENY" },
  // Evita que el navegador "adivine" tipos MIME (mitiga XSS por sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No filtrar la URL completa a sitios externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Fuerza HTTPS durante 2 años (incluye subdominios).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Desactiva APIs sensibles del navegador que la app no usa.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El lint corre en CI (GitHub Actions), no bloquea el build de despliegue.
  eslint: { ignoreDuringBuilds: true },
  // La app no usa next/image; desactivar el optimizador cierra la superficie de
  // ataque del endpoint /_next/image (advisory RCE del optimizador AVIF) sin
  // perder funcionalidad.
  images: { unoptimized: true },
  // Permite payloads mayores para comprobantes en base64
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
