import { dbConnect } from "@/lib/db";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { enviarPush } from "@/lib/push";

export const dynamic = "force-dynamic";

// POST /api/push/test -> Envía una notificación push de prueba al usuario autenticado (barbero o admin)
export const POST = handler(async () => {
  await dbConnect();
  const session = getSession();
  if (!session) return fail("No autenticado", 401);

  let target;
  if (session.role === ROLES.BARBERO && session.barberoId) {
    target = { ownerRole: ROLES.BARBERO, ownerId: session.barberoId };
  } else if (session.role === ROLES.ADMIN) {
    target = { ownerRole: ROLES.ADMIN, ownerId: session.id };
  } else {
    return fail("Rol no autorizado", 403);
  }

  const res = await enviarPush(target, {
    title: "CitasBarber 💈",
    body: "¡Prueba exitosa! Las notificaciones están activas en este dispositivo.",
    url: session.role === ROLES.BARBERO ? "/barbero/panel" : "/admin/panel",
    tag: `test-${Date.now()}`,
  });

  if (res.motivo === "sin-config") {
    return fail("Las claves VAPID no están configuradas en el servidor", 500);
  }

  if (res.enviadas === 0) {
    return fail(
      "No se encontró ninguna suscripción activa para este usuario. Asegúrate de haber tocado 'Activar' en este dispositivo.",
      404
    );
  }

  return ok({
    ok: true,
    enviadas: res.enviadas,
    mensaje: `¡Notificación enviada a ${res.enviadas} dispositivo(s)!`,
  });
});
