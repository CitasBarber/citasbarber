import { dbConnect } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// Devuelve { ownerRole, ownerId } del usuario autenticado (barbero o admin),
// o null si no es ninguno de los dos.
function dueñoDeSesion(session) {
  if (!session) return null;
  if (session.role === ROLES.BARBERO && session.barberoId)
    return { ownerRole: ROLES.BARBERO, ownerId: session.barberoId };
  if (session.role === ROLES.ADMIN)
    return { ownerRole: ROLES.ADMIN, ownerId: session.id };
  return null;
}

// POST /api/push/subscribe -> registra (o actualiza) la suscripción del dispositivo
export const POST = handler(async (req) => {
  await dbConnect();
  const dueño = dueñoDeSesion(getSession());
  if (!dueño) return fail("No autorizado", 403);

  const { subscription, userAgent } = await req.json();
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth)
    return fail("Suscripción inválida", 400);

  // upsert por endpoint: si el navegador re-suscribe, reasignamos el dueño.
  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      ownerId: dueño.ownerId,
      ownerRole: dueño.ownerRole,
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      userAgent: (userAgent || "").slice(0, 300),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ok({ ok: true }, 201);
});
