import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// GET /api/admin/barberos?estado=pendiente|activo|...  -> lista para el admin
export const GET = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.ADMIN) return fail("No autorizado", 403);

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");
  const query = estado ? { estado } : {};

  const barberos = await Barbero.find(query).sort({ createdAt: -1 }).lean();

  // Conteo de citas por barbero (para avisar en la eliminación en cascada)
  const conteos = await Cita.aggregate([
    { $match: { barbero: { $in: barberos.map((b) => b._id) } } },
    { $group: { _id: "$barbero", total: { $sum: 1 } } },
  ]);
  const citasPorBarbero = Object.fromEntries(
    conteos.map((c) => [c._id.toString(), c.total])
  );

  return ok({
    barberos: barberos.map((b) => ({
      id: b._id.toString(),
      nombre: b.nombre,
      local: b.local,
      celular: b.celular,
      ciudad: b.ciudad,
      email: b.email,
      estado: b.estado,
      planes: b.planes || [],
      datosPago: b.datosPago || {},
      suscripcionActiva: b.suscripcionActiva,
      suscripcionVence: b.suscripcionVence,
      numCitas: citasPorBarbero[b._id.toString()] || 0,
      createdAt: b.createdAt,
    })),
  });
});
