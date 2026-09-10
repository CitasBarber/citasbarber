import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Barbero from "@/models/Barbero";
import { ok, fail, handler } from "@/lib/api";
import { getSession, hashPassword } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

function requireAdmin() {
  const session = getSession();
  if (!session || session.role !== ROLES.ADMIN) {
    const e = new Error("No autorizado");
    e.status = 403;
    throw e;
  }
}

// POST /api/admin/barberos/:id/password  body: { password }
// Asigna una contraseña temporal al barbero; en el próximo login se le exigirá cambiarla.
export const POST = handler(async (req, { params }) => {
  await dbConnect();
  requireAdmin();
  const { password } = await req.json();
  if (!password || password.trim().length < 6)
    return fail("La contraseña debe tener al menos 6 caracteres");

  const barbero = await Barbero.findById(params.id);
  if (!barbero) return fail("Barbero no encontrado", 404);

  const usuario = await Usuario.findOne({ barbero: barbero._id });
  if (!usuario) return fail("Usuario del barbero no encontrado. El barbero debe registrarse primero.", 404);

  usuario.passwordHash    = await hashPassword(password.trim());
  usuario.passwordTemporal = true;
  await usuario.save();

  return ok({ ok: true });
});
