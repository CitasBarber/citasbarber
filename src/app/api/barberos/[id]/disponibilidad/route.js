import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { calcularSlots } from "@/lib/disponibilidad";
import { ESTADO_CITA } from "@/lib/constants";

// GET /api/barberos/:id/disponibilidad?fecha=YYYY-MM-DD&plan=bronce
export const GET = handler(async (req, { params }) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha");
  const planKey = searchParams.get("plan");
  if (!fecha || !planKey) return fail("Faltan parámetros fecha o plan");

  const barbero = await Barbero.findById(params.id).lean();
  if (!barbero) return fail("Barbero no encontrado", 404);

  const plan = (barbero.planes || []).find((p) => p.key === planKey);
  if (!plan) return fail("Plan no configurado para este barbero", 404);

  // Citas que ocupan agenda: solicitadas o confirmadas ese día
  const citas = await Cita.find({
    barbero: barbero._id,
    fecha,
    estado: { $in: [ESTADO_CITA.SOLICITADA, ESTADO_CITA.CONFIRMADA] },
  })
    .select("horaInicio horaFin")
    .lean();

  const duracionCita = Number(plan.duracion) || barbero.horario?.duracionTurnoMin || 30;

  const slots = calcularSlots({
    barbero,
    fecha,
    duracion: duracionCita,
    citas,
  });

  return ok({ fecha, plan: planKey, duracion: duracionCita, slots });
});
