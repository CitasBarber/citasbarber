import { dbConnect } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { ok, fail, handler } from "@/lib/api";

// POST /api/push/cliente/unsubscribe -> elimina la suscripción de este dispositivo.
export const POST = handler(async (req) => {
  await dbConnect();
  const { endpoint } = await req.json();
  if (!endpoint) return fail("Falta el endpoint", 400);

  await PushSubscription.deleteOne({ endpoint, ownerRole: "cliente" });
  return ok({ ok: true });
});
