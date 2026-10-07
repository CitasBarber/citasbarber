import Cita from "@/models/Cita";
import { ESTADO_CITA, ROLES } from "@/lib/constants";
import { enviarPush } from "@/lib/push";
import {
  fechaLocalHoy,
  hhmmAMin,
  minutosActualesColombia,
  formatearHora12,
} from "@/lib/disponibilidad";

// Minutos de antelación con que se avisa al barbero de una cita sin confirmar.
export const MIN_ANTELACION_AVISO = 15;

// Busca las citas de HOY que siguen SIN CONFIRMAR y cuya hora de inicio está
// dentro de los próximos MIN_ANTELACION_AVISO minutos, y envía un push al
// barbero dueño. Marcamos el flag aunque no haya suscripción activa para no
// reintentar en bucle. Nunca lanza: los errores quedan en el log.
//
// Se usa desde el cron (/api/cron/recordatorios) y de forma oportunista desde
// GET /api/citas, para que el aviso funcione aunque NO haya cron externo
// configurado mientras el barbero tenga su panel abierto.
export async function recordarCitasSinConfirmar({ barberoId = null } = {}) {
  try {
    const hoy = fechaLocalHoy();
    const ahoraMin = minutosActualesColombia();

    const filtro = {
      estado: ESTADO_CITA.SOLICITADA,
      fecha: hoy,
      recordatorioEnviado: { $ne: true },
    };
    if (barberoId) filtro.barbero = barberoId;

    const candidatas = await Cita.find(filtro).lean();

    // Se avisa cuando faltan entre 0 y MIN_ANTELACION_AVISO minutos para la cita.
    const porAvisar = candidatas.filter((c) => {
      const faltan = hhmmAMin(c.horaInicio) - ahoraMin;
      return faltan > 0 && faltan <= MIN_ANTELACION_AVISO;
    });

    let notificadas = 0;
    for (const cita of porAvisar) {
      const plan = cita.planSnapshot?.nombre || cita.plan;
      await enviarPush(
        { ownerRole: ROLES.BARBERO, ownerId: cita.barbero },
        {
          title: "Cita sin confirmar",
          body: `${cita.clienteNombre} · ${plan} · hoy a las ${formatearHora12(cita.horaInicio)}. Empieza en unos ${MIN_ANTELACION_AVISO} min y sigue sin confirmar.`,
          url: "/barbero/panel",
          tag: `recordatorio-${cita._id}`,
        }
      );
      await Cita.updateOne({ _id: cita._id }, { $set: { recordatorioEnviado: true } });
      notificadas++;
    }

    return { revisadas: candidatas.length, notificadas };
  } catch (e) {
    console.error("recordarCitasSinConfirmar falló:", e.message);
    return { revisadas: 0, notificadas: 0 };
  }
}
