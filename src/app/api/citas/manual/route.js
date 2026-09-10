import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { calcularSlots, minAHhmm, hhmmAMin } from "@/lib/disponibilidad";
import { normalizarCelular } from "@/lib/whatsapp";
import { ESTADO_CITA, ROLES } from "@/lib/constants";
import { serializarCita } from "@/lib/serializers";

// POST /api/citas/manual  -> el barbero crea una cita para un cliente presencial
export const POST = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.BARBERO)
    return fail("No autorizado", 403);

  const body = await req.json();
  const { plan: planKey, fecha, horaInicio, clienteNombre } = body;
  let { clienteCelular } = body;
  if (!planKey || !fecha || !horaInicio || !clienteNombre)
    return fail("Faltan datos de la cita");

  const barbero = await Barbero.findById(session.barberoId);
  if (!barbero) return fail("Barbero no encontrado", 404);

  const plan = (barbero.planes || []).find((p) => p.key === planKey);
  if (!plan) return fail("Plan no configurado", 400);

  const citasDia = await Cita.find({
    barbero: barbero._id,
    fecha,
    estado: { $in: [ESTADO_CITA.SOLICITADA, ESTADO_CITA.CONFIRMADA] },
  })
    .select("horaInicio horaFin")
    .lean();

  const slots = calcularSlots({ barbero, fecha, duracion: plan.duracion, citas: citasDia });
  if (!slots.includes(horaInicio))
    return fail("Ese horario no está disponible en la agenda.", 409);

  const horaFin = minAHhmm(hhmmAMin(horaInicio) + plan.duracion);

  const cita = await Cita.create({
    barbero: barbero._id,
    cliente: null,
    clienteNombre: clienteNombre.trim(),
    clienteCelular: clienteCelular ? normalizarCelular(clienteCelular) : "",
    plan: plan.key,
    planSnapshot: {
      key: plan.key,
      nombre: plan.nombre,
      servicios: plan.servicios,
      precio: plan.precio,
      duracion: plan.duracion,
      anticipo: plan.anticipo,
    },
    fecha,
    horaInicio,
    horaFin,
    metodoPago: "efectivo",
    estado: ESTADO_CITA.CONFIRMADA, // las citas manuales quedan confirmadas
    esManual: true,
  });

  return ok({ cita: serializarCita(cita.toObject()) }, 201);
});
