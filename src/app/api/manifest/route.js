import { manifestDeMarca } from "@/lib/brands";

// GET /api/manifest?marca=barber|pet|spa -> manifest de la PWA de esa marca
export function GET(req) {
  const marca = new URL(req.url).searchParams.get("marca");
  return new Response(JSON.stringify(manifestDeMarca(marca)), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
