import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { calcularSlots, minAHhmm, hhmmAMin, fechaLocalHoy } from "@/lib/disponibilidad";
import { normalizarCelular, linkWhatsApp, mensajeConfirmacion } from "@/lib/whatsapp";
import { ESTADO_CITA, ROLES } from "@/lib/constants";
import { serializarCita } from "@/lib/serializers";

// POST /api/citas/manual  -> el barbero crea una cita para un cliente presencial
export const POST = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.BARBERO)
    return fail("No autorizado", 403);

  const body = await req.json();
  const { plan: planKey, fecha, horaInicio, clienteNombre, plano } = body;
  let { clienteCelular } = body;
  if (!planKey || !fecha || !horaInicio || !clienteNombre)
    return fail("Faltan datos de la cita");
  if (fecha < fechaLocalHoy())
    return fail("No puedes agendar en una fecha que ya pasó.", 400);

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

  const duracionCita = Number(plan.duracion) || barbero.horario?.duracionTurnoMin || 30;

  const slots = calcularSlots({ barbero, fecha, duracion: duracionCita, citas: citasDia });
  if (!slots.includes(horaInicio))
    return fail("Ese horario no está disponible en la agenda.", 409);

  const horaFin = minAHhmm(hhmmAMin(horaInicio) + duracionCita);

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
      duracion: duracionCita,
      anticipo: plan.anticipo,
    },
    fecha,
    horaInicio,
    horaFin,
    metodoPago: "efectivo",
    estado: ESTADO_CITA.CONFIRMADA, // las citas manuales quedan confirmadas
    esManual: true,
  });

  const citaObj = cita.toObject();

  // Si el barbero registró el celular del cliente, devolvemos el enlace de
  // WhatsApp con la confirmación para que quede el contacto de ambos lados.
  const link = citaObj.clienteCelular
    ? linkWhatsApp(citaObj.clienteCelular, mensajeConfirmacion(citaObj, barbero, { plano: !!plano }))
    : null;

  return ok({ cita: serializarCita(citaObj), linkWhatsApp: link }, 201);
});
