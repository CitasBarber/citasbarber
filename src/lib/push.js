import webpush from "web-push";
import PushSubscription from "@/models/PushSubscription";

// Configuración de las claves VAPID. Si faltan, las notificaciones quedan
// desactivadas silenciosamente: la app sigue funcionando igual.
let configurado = false;
export function pushHabilitado() {
  const pub = (process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim();
  const priv = (process.env.VAPID_PRIVATE_KEY || "").trim();
  if (!pub || !priv) return false;
  if (!configurado) {
    webpush.setVapidDetails(
      (process.env.VAPID_SUBJECT || "mailto:admin@citasbarber.com").trim(),
      pub,
      priv
    );
    configurado = true;
  }
  return true;
}

// Envía una notificación a todas las suscripciones de un dueño (o de un rol
// completo, p. ej. todos los admin). Limpia las suscripciones caducadas (404/410).
// Nunca lanza: los errores se registran pero no rompen el flujo que la invoca.
export async function enviarPush({ ownerRole, ownerId, clienteCelular }, payload) {
  try {
    if (!pushHabilitado()) {
      console.warn("enviarPush: notificaciones no configuradas (faltan claves VAPID)");
      return { enviadas: 0, motivo: "sin-config" };
    }

    const filtro = { ownerRole };
    if (ownerId) {
      filtro.$or = [{ ownerId: ownerId }, { ownerId: String(ownerId) }];
    }
    if (clienteCelular) filtro.clienteCelular = clienteCelular;

    const subs = await PushSubscription.find(filtro).lean();
    if (subs.length === 0) {
      console.log(`enviarPush: 0 suscriptores encontrados para filtro`, JSON.stringify(filtro));
      return { enviadas: 0 };
    }

    const cuerpo = JSON.stringify(payload);
    let enviadas = 0;
    const muertas = [];

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: s.keys },
            cuerpo,
            { TTL: 86400, urgency: "high" }
          );
          enviadas++;
        } catch (err) {
          // 404/410 -> el navegador ya no acepta esa suscripción: la borramos.
          if (err.statusCode === 404 || err.statusCode === 410) {
            muertas.push(s.endpoint);
          } else {
            console.error("Error enviando push:", err.statusCode, err.body || err.message);
          }
        }
      })
    );

    if (muertas.length > 0) {
      await PushSubscription.deleteMany({ endpoint: { $in: muertas } });
    }

    console.log(`enviarPush: ${enviadas}/${subs.length} notificaciones enviadas exitosamente`);
    return { enviadas };
  } catch (e) {
    console.error("enviarPush falló:", e.message);
    return { enviadas: 0, motivo: "error" };
  }
}
