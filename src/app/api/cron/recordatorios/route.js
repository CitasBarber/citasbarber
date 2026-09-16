import { dbConnect } from "@/lib/db";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { ESTADO_CITA, ROLES } from "@/lib/constants";
import { enviarPush } from "@/lib/push";
import { fechaLocalHoy, hhmmAMin, minutosActualesColombia } from "@/lib/disponibilidad";

// Minutos de antelación con que se avisa al barbero de una cita sin confirmar.
const MIN_ANTELACION = 15;

// No cachear: cada llamada debe consultar la BD en el momento.
export const dynamic = "force-dynamic";

// GET /api/cron/recordatorios
// Pensado para ser llamado por un cron externo (p. ej. cron-job.org) cada pocos
// minutos. Busca las citas de HOY que siguen SOLICITADA (sin confirmar) y cuya
// hora de inicio está dentro de los próximos MIN_ANTELACION minutos, y le envía
// al barbero una notificación push recordándole que tiene una cita por atender.
//
// Se protege con el header  Authorization: Bearer <CRON_SECRET>  (mismo formato
// que usa Vercel Cron), para que nadie más pueda dispararlo.
export const GET = handler(async (req) => {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return fail("CRON_SECRET no configurado", 500);

  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secreto}`) return fail("No autorizado", 401);

  await dbConnect();

  const hoy = fechaLocalHoy();
  const ahoraMin = minutosActualesColombia();

  // Candidatas: citas de hoy, aún solicitadas, sin recordatorio previo.
  const candidatas = await Cita.find({
    estado: ESTADO_CITA.SOLICITADA,
    fecha: hoy,
    recordatorioEnviado: { $ne: true },
  }).lean();

  // Se avisa cuando faltan entre 0 y MIN_ANTELACION minutos para la cita.
  const porAvisar = candidatas.filter((c) => {
    const faltan = hhmmAMin(c.horaInicio) - ahoraMin;
    return faltan > 0 && faltan <= MIN_ANTELACION;
  });

  let enviadas = 0;
  for (const cita of porAvisar) {
    const plan = cita.planSnapshot?.nombre || cita.plan;
    await enviarPush(
      { ownerRole: ROLES.BARBERO, ownerId: cita.barbero },
      {
        title: "Cita sin confirmar",
        body: `${cita.clienteNombre} · ${plan} · hoy a las ${cita.horaInicio}. Empieza en unos ${MIN_ANTELACION} min y sigue sin confirmar.`,
        url: "/barbero/panel",
        tag: `recordatorio-${cita._id}`,
      }
    );
    // Marcamos aunque no haya suscripción activa: no queremos reintentar en bucle.
    await Cita.updateOne({ _id: cita._id }, { $set: { recordatorioEnviado: true } });
    enviadas++;
  }

  return ok({ revisadas: candidatas.length, notificadas: enviadas });
});
