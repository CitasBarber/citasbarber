import { dbConnect } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { ok, fail, handler } from "@/lib/api";
import { normalizarCelular } from "@/lib/whatsapp";

// POST /api/push/cliente/subscribe
// Registra (o actualiza) la suscripción push de un cliente. No exige sesión:
// el cliente se identifica por su celular, para recibir el recordatorio del
// día de su cita a la hora en que abre el barbero.
export const POST = handler(async (req) => {
  await dbConnect();
  const { subscription, celular, userAgent } = await req.json();

  const cel = normalizarCelular(celular);
  if (!cel || cel.replace(/\D/g, "").length < 10) return fail("Celular inválido", 400);
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth)
    return fail("Suscripción inválida", 400);

  // upsert por endpoint: si el navegador re-suscribe, actualizamos el dueño.
  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      $set: {
        ownerRole: "cliente",
        clienteCelular: cel,
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
        userAgent: (userAgent || "").slice(0, 300),
      },
      $unset: { ownerId: "" },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ok({ ok: true }, 201);
});
