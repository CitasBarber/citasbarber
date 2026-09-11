import { dbConnect } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";

// POST /api/push/unsubscribe -> elimina la suscripción de este dispositivo
export const POST = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session) return fail("No autorizado", 403);

  const { endpoint } = await req.json();
  if (!endpoint) return fail("Falta el endpoint", 400);

  await PushSubscription.deleteOne({ endpoint });
  return ok({ ok: true });
});
