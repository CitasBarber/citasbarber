import { dbConnect } from "@/lib/db";
import Cita from "@/models/Cita";
import Barbero from "@/models/Barbero";
import { ok, fail, handler } from "@/lib/api";
import { ESTADO_CITA, ROLES } from "@/lib/constants";
import { enviarPush } from "@/lib/push";
import { normalizarCelular } from "@/lib/whatsapp";
import { fechaLocalHoy, hhmmAMin, minutosActualesColombia, formatearHora12 } from "@/lib/disponibilidad";

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
        body: `${cita.clienteNombre} · ${plan} · hoy a las ${formatearHora12(cita.horaInicio)}. Empieza en unos ${MIN_ANTELACION} min y sigue sin confirmar.`,
        url: "/barbero/panel",
        tag: `recordatorio-${cita._id}`,
      }
    );
    // Marcamos aunque no haya suscripción activa: no queremos reintentar en bucle.
    await Cita.updateOne({ _id: cita._id }, { $set: { recordatorioEnviado: true } });
    enviadas++;
  }

  // --- Recordatorio al CLIENTE el día de su cita ---
  // Citas confirmadas de hoy, con celular, aún no recordadas. Se le avisa una
  // sola vez, a partir de la hora en que abre el barbero ese día.
  const citasHoy = await Cita.find({
    estado: ESTADO_CITA.CONFIRMADA,
    fecha: hoy,
    clienteCelular: { $nin: [null, ""] },
    recordatorioClienteEnviado: { $ne: true },
  }).lean();

  let recordadasCliente = 0;
  if (citasHoy.length > 0) {
    const barberoIds = [...new Set(citasHoy.map((c) => String(c.barbero)))];
    const barberos = await Barbero.find({ _id: { $in: barberoIds } })
      .select("nombre local horario")
      .lean();
    const mapaBarbero = new Map(barberos.map((b) => [String(b._id), b]));

    for (const cita of citasHoy) {
      const barbero = mapaBarbero.get(String(cita.barbero));
      const apertura = barbero?.horario?.horaInicio || "00:00";
      // Aún no abre el local (hora de Colombia): esperamos a un próximo ciclo.
      if (ahoraMin < hhmmAMin(apertura)) continue;

      const local = barbero?.local || "la barbería";
      await enviarPush(
        { ownerRole: "cliente", clienteCelular: normalizarCelular(cita.clienteCelular) },
        {
          title: "Recordatorio de tu cita ✂️",
          body: `Hoy tenés cita a las ${formatearHora12(cita.horaInicio)} con ${barbero?.nombre || "tu barbero"} en ${local}.`,
          url: "/mis-citas",
          tag: `recordatorio-cliente-${cita._id}`,
        }
      );
      // Marcamos aunque no haya suscripción activa: evita reintentar en bucle.
      await Cita.updateOne({ _id: cita._id }, { $set: { recordatorioClienteEnviado: true } });
      recordadasCliente++;
    }
  }

  return ok({ revisadas: candidatas.length, notificadas: enviadas, recordadasCliente });
});
