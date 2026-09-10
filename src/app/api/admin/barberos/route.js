import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
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
      createdAt: b.createdAt,
    })),
  });
});
