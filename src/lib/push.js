import webpush from "web-push";
import PushSubscription from "@/models/PushSubscription";

// Configuración de las claves VAPID. Si faltan, las notificaciones quedan
// desactivadas silenciosamente: la app sigue funcionando igual.
let configurado = false;
export function pushHabilitado() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  if (!configurado) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@example.com",
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
export async function enviarPush({ ownerRole, ownerId }, payload) {
  try {
    if (!pushHabilitado()) return { enviadas: 0, motivo: "sin-config" };

    const filtro = { ownerRole };
    if (ownerId) filtro.ownerId = ownerId;

    const subs = await PushSubscription.find(filtro).lean();
    if (subs.length === 0) return { enviadas: 0 };

    const cuerpo = JSON.stringify(payload);
    let enviadas = 0;
    const muertas = [];

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: s.keys },
            cuerpo
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

    return { enviadas };
  } catch (e) {
    console.error("enviarPush falló:", e.message);
    return { enviadas: 0, motivo: "error" };
  }
}
