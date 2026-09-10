import { dbConnect } from "@/lib/db";
import Solicitud from "@/models/Solicitud";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// GET /api/admin/solicitudes?estado=nueva|atendida  -> lista para el admin
export const GET = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.ADMIN) return fail("No autorizado", 403);

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");
  const query = estado ? { estado } : {};

  const [solicitudes, nuevas] = await Promise.all([
    Solicitud.find(query).sort({ createdAt: -1 }).lean(),
    Solicitud.countDocuments({ estado: "nueva" }),
  ]);

  return ok({
    nuevas,
    solicitudes: solicitudes.map((s) => ({
      id: s._id.toString(),
      nombre: s.nombre,
      celular: s.celular,
      local: s.local,
      mensaje: s.mensaje,
      estado: s.estado,
      createdAt: s.createdAt,
    })),
  });
});
