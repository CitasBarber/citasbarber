import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import Usuario from "@/models/Usuario";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ESTADO_BARBERO, ROLES, PLANES_DEFAULT } from "@/lib/constants";

function requireAdmin() {
  const session = getSession();
  if (!session || session.role !== ROLES.ADMIN) {
    const e = new Error("No autorizado");
    e.status = 403;
    throw e;
  }
}

// PUT /api/admin/barberos/:id  body: { nombre, local, celular, ciudad, direccion, email }
export const PUT = handler(async (req, { params }) => {
  await dbConnect();
  requireAdmin();
  const body = await req.json();
  const b = await Barbero.findById(params.id);
  if (!b) return fail("Barbero no encontrado", 404);
  if (body.nombre?.trim())    b.nombre    = body.nombre.trim();
  if (body.local?.trim())     b.local     = body.local.trim();
  if (body.celular?.trim())   b.celular   = body.celular.trim();
  if (body.ciudad?.trim())    b.ciudad    = body.ciudad.trim();
  if (typeof body.direccion === "string") b.direccion = body.direccion.trim();
  if (body.duracionTurnoMin != null) {
    if (!b.horario) b.horario = {};
    b.horario.duracionTurnoMin = Number(body.duracionTurnoMin);
  }
  const nuevoEmail = body.email?.trim().toLowerCase();
  if (nuevoEmail) b.email = nuevoEmail;
  await b.save();

  // Sincronizar el email en el Usuario vinculado para que el login siga funcionando
  if (nuevoEmail) {
    await Usuario.updateOne({ barbero: b._id }, { email: nuevoEmail });
  }

  return ok({ ok: true });
});

// PATCH /api/admin/barberos/:id  body: { accion: aprobar|rechazar|activar|desactivar }
export const PATCH = handler(async (req, { params }) => {
  await dbConnect();
  requireAdmin();
  const { accion, meses } = await req.json();
  const b = await Barbero.findById(params.id);
  if (!b) return fail("Barbero no encontrado", 404);

  switch (accion) {
    case "aprobar":
      b.estado = ESTADO_BARBERO.ACTIVO;
      b.suscripcionActiva = true;
      b.suscripcionVence = new Date(Date.now() + (meses || 1) * 30 * 864e5);
      // Si no tiene planes, se cargan los de plantilla para que el admin los ajuste
      if (!b.planes || b.planes.length === 0) b.planes = PLANES_DEFAULT;
      break;
    case "rechazar":
      b.estado = ESTADO_BARBERO.RECHAZADO;
      b.suscripcionActiva = false;
      break;
    case "activar":
      b.estado = ESTADO_BARBERO.ACTIVO;
      b.suscripcionActiva = true;
      b.suscripcionVence = new Date(Date.now() + (meses || 1) * 30 * 864e5);
      break;
    case "desactivar":
      b.estado = ESTADO_BARBERO.INACTIVO;
      b.suscripcionActiva = false;
      break;
    default:
      return fail("Acción no válida", 400);
  }
  await b.save();
  return ok({ ok: true, estado: b.estado });
});

// DELETE /api/admin/barberos/:id
// Eliminación permanente en cascada: borra el barbero, su usuario/login y todas sus citas.
export const DELETE = handler(async (req, { params }) => {
  await dbConnect();
  requireAdmin();

  const b = await Barbero.findById(params.id);
  if (!b) return fail("Barbero no encontrado", 404);

  const citas = await Cita.deleteMany({ barbero: b._id });
  await Usuario.deleteOne({ barbero: b._id });
  await b.deleteOne();

  return ok({ ok: true, citasEliminadas: citas.deletedCount || 0 });
});
