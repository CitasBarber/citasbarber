import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import { ok, fail, handler } from "@/lib/api";
import { getSession, hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const POST = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.BARBERO) return fail("No autorizado", 403);

  const { nuevaPassword } = await req.json();
  if (!nuevaPassword || nuevaPassword.trim().length < 6)
    return fail("La contraseña debe tener al menos 6 caracteres");

  const usuario = await Usuario.findById(session.id);
  if (!usuario) return fail("Usuario no encontrado", 404);

  usuario.passwordHash     = await hashPassword(nuevaPassword.trim());
  usuario.passwordTemporal = false;
  await usuario.save();

  // Re-emite el JWT sin passwordTemporal para que el panel no redirija de nuevo
  const token = signToken({
    id: usuario._id.toString(),
    role: usuario.role,
    nombre: usuario.nombre,
    barberoId: session.barberoId || null,
    passwordTemporal: false,
  });
  setSessionCookie(token);

  return ok({ ok: true });
});
