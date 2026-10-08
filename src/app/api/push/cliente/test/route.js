import { dbConnect } from "@/lib/db";
import { ok, fail, handler } from "@/lib/api";
import { normalizarCelular } from "@/lib/whatsapp";
import { enviarPush } from "@/lib/push";

export const dynamic = "force-dynamic";

// POST /api/push/cliente/test -> Envía una notificación push de prueba al
// cliente identificado por su celular (el mismo con el que consulta sus citas).
// No exige sesión: cualquiera que conozca su propio celular puede verificar que
// los recordatorios le llegan (útil para probar con la pantalla bloqueada).
export const POST = handler(async (req) => {
  await dbConnect();
  const { celular } = await req.json().catch(() => ({}));

  const cel = normalizarCelular(celular || "");
  if (!cel || cel.replace(/\D/g, "").length < 10)
    return fail("Celular inválido", 400);

  const res = await enviarPush(
    { ownerRole: "cliente", clienteCelular: cel },
    {
      title: "CitasBarber 💈",
      body: "¡Prueba exitosa! Vas a recibir tus citas como notificaciones, incluso con la pantalla bloqueada.",
      url: "/mis-citas",
      tag: `test-${Date.now()}`,
    }
  );

  if (res.motivo === "sin-config") {
    return fail("Las claves VAPID no están configuradas en el servidor", 500);
  }

  if (res.enviadas === 0) {
    return fail(
      "No se encontró ninguna suscripción activa para este celular. Tocá 'Activar' en Mis Citas con este dispositivo.",
      404
    );
  }

  return ok({
    ok: true,
    enviadas: res.enviadas,
    mensaje: `¡Notificación enviada a ${res.enviadas} dispositivo(s)!`,
  });
});
