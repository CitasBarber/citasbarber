import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// PUT /api/admin/barberos/:id/planes  body: { planes:[...], datosPago:{...} }
export const PUT = handler(async (req, { params }) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.ADMIN) return fail("No autorizado", 403);

  const { planes, datosPago } = await req.json();
  const b = await Barbero.findById(params.id);
  if (!b) return fail("Barbero no encontrado", 404);

  if (Array.isArray(planes)) {
    b.planes = planes.map((p) => ({
      key: p.key,
      nombre: p.nombre,
      servicios: Array.isArray(p.servicios)
        ? p.servicios
        : String(p.servicios || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      precio: Number(p.precio) || 0,
      duracion: Number(p.duracion) || (p.key === "bronce" ? 25 : 55),
      anticipo: Number(p.anticipo) || 0,
      metodosPago: p.metodosPago || [],
      activo: p.activo !== false,
    }));
  }
  if (datosPago) b.datosPago = { ...b.datosPago, ...datosPago };

  await b.save();
  return ok({ ok: true, planes: b.planes });
});
