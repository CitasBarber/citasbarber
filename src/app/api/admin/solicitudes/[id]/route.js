import { dbConnect } from "@/lib/db";
import Solicitud from "@/models/Solicitud";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

function requireAdmin() {
  const session = getSession();
  if (!session || session.role !== ROLES.ADMIN) {
    const err = new Error("No autorizado");
    err.status = 403;
    throw err;
  }
}

// PATCH /api/admin/solicitudes/:id  body: { accion: "atender" | "reabrir" }
export const PATCH = handler(async (req, { params }) => {
  await dbConnect();
  requireAdmin();
  const { accion } = await req.json();
  const estado = accion === "atender" ? "atendida" : accion === "reabrir" ? "nueva" : null;
  if (!estado) return fail("Acción no válida", 400);

  const s = await Solicitud.findByIdAndUpdate(params.id, { estado }, { new: true });
  if (!s) return fail("Solicitud no encontrada", 404);
  return ok({ id: s._id.toString(), estado: s.estado });
});

// DELETE /api/admin/solicitudes/:id
export const DELETE = handler(async (req, { params }) => {
  await dbConnect();
  requireAdmin();
  const s = await Solicitud.findByIdAndDelete(params.id);
  if (!s) return fail("Solicitud no encontrada", 404);
  return ok({ ok: true });
});
