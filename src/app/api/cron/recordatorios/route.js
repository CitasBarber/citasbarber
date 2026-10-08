import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import { ok, fail, handler } from "@/lib/api";
import {
  recordarCitasSinConfirmar,
  recordarClientesDelDia,
} from "@/lib/recordatorios";

// No cachear: cada llamada debe consultar la BD en el momento.
export const dynamic = "force-dynamic";

// GET /api/cron/recordatorios
// Pensado para ser llamado por un cron externo (p. ej. cron-job.org) cada pocos
// minutos. Envía:
//   1) al BARBERO: aviso de citas de hoy sin confirmar (~15 min antes), y
//   2) al CLIENTE: recordatorio el día de su cita (a partir de la apertura).
//
// La lógica vive en @/lib/recordatorios para poder reutilizarse de forma
// oportunista desde los paneles, aunque no haya cron externo configurado.
//
// Se protege con el header  Authorization: Bearer <CRON_SECRET>  (mismo formato
// que usa Vercel Cron), para que nadie más pueda dispararlo.
export const GET = handler(async (req) => {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return fail("CRON_SECRET no configurado", 500);

  const auth = req.headers.get("authorization") || "";
  const esperado = `Bearer ${secreto}`;
  const hashAuth = crypto.createHash("sha256").update(auth).digest();
  const hashEsperado = crypto.createHash("sha256").update(esperado).digest();
  if (!crypto.timingSafeEqual(hashAuth, hashEsperado)) {
    return fail("No autorizado", 401);
  }

  await dbConnect();

  const avisoBarbero = await recordarCitasSinConfirmar();
  const avisoCliente = await recordarClientesDelDia();

  return ok({
    revisadas: avisoBarbero.revisadas,
    notificadas: avisoBarbero.notificadas,
    recordadasCliente: avisoCliente.recordadas,
  });
});
