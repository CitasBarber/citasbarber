import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES, ESTADO_CITA } from "@/lib/constants";
import { citasEnConflicto } from "@/lib/disponibilidad";
import { serializarCita } from "@/lib/serializers";

function requireBarbero() {
  const session = getSession();
  if (!session || session.role !== ROLES.BARBERO) {
    const e = new Error("No autorizado");
    e.status = 403;
    throw e;
  }
  return session;
}

export const GET = handler(async () => {
  await dbConnect();
  const session = requireBarbero();
  const b = await Barbero.findById(session.barberoId).lean();
  if (!b) return fail("Barbero no encontrado", 404);
  return ok({
    barbero: {
      id: b._id.toString(),
      nombre: b.nombre,
      local: b.local,
      celular: b.celular,
      ciudad: b.ciudad,
      direccion: b.direccion || "",
      foto: b.foto || "",
      redes: b.redes || {},
      email: b.email,
      estado: b.estado,
      horario: b.horario,
      diasBloqueados: b.diasBloqueados || [],
      franjasBloqueadas: b.franjasBloqueadas || [],
      ventanaCancelacionHoras: b.ventanaCancelacionHoras,
      datosPago: b.datosPago || {},
      planes: b.planes || [],
    },
  });
});

// PUT -> actualiza configuración editable por el barbero
export const PUT = handler(async (req) => {
  await dbConnect();
  const session = requireBarbero();
  const body = await req.json();
  const b = await Barbero.findById(session.barberoId);
  if (!b) return fail("Barbero no encontrado", 404);

  if (body.horario) {
    b.horario.horaInicio = body.horario.horaInicio ?? b.horario.horaInicio;
    b.horario.horaFin = body.horario.horaFin ?? b.horario.horaFin;
    if (Array.isArray(body.horario.diasLaborales))
      b.horario.diasLaborales = body.horario.diasLaborales;
  }
  if (Array.isArray(body.diasBloqueados)) b.diasBloqueados = body.diasBloqueados;
  if (Array.isArray(body.franjasBloqueadas)) b.franjasBloqueadas = body.franjasBloqueadas;
  if (body.ventanaCancelacionHoras != null)
    b.ventanaCancelacionHoras = body.ventanaCancelacionHoras;
  if (body.datosPago) b.datosPago = { ...b.datosPago, ...body.datosPago };
  if (typeof body.foto === "string") b.foto = body.foto;
  if (body.redes) b.redes = { ...(b.redes || {}), ...body.redes };

  await b.save();

  // Detectar citas activas que quedaron dentro de un día/franja bloqueada, para
  // avisar al barbero. No se cancela nada: él decide qué hacer con cada una.
  const diasBloqueados = b.diasBloqueados || [];
  const franjasBloqueadas = (b.franjasBloqueadas || []).map((f) => ({
    fecha: f.fecha,
    horaInicio: f.horaInicio,
    horaFin: f.horaFin,
  }));
  const fechasRelevantes = [
    ...new Set([...diasBloqueados, ...franjasBloqueadas.map((f) => f.fecha)]),
  ];

  let conflictos = [];
  if (fechasRelevantes.length > 0) {
    const citas = await Cita.find({
      barbero: b._id,
      fecha: { $in: fechasRelevantes },
      estado: { $in: [ESTADO_CITA.SOLICITADA, ESTADO_CITA.CONFIRMADA] },
    }).lean();
    conflictos = citasEnConflicto({ citas, diasBloqueados, franjasBloqueadas }).map(
      serializarCita
    );
  }

  return ok({ ok: true, conflictos });
});
