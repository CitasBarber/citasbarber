import { ok, fail, handler } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/push/vapid-public-key -> Devuelve la clave pública VAPID para que el
// navegador pueda suscribirse a pushManager sin depender exclusivamente de NEXT_PUBLIC_.
export const GET = handler(async () => {
  const publicKey = (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY ||
    ""
  ).trim();

  if (!publicKey) {
    return fail("Clave pública VAPID no configurada en el servidor", 500);
  }

  return ok({ publicKey });
});
