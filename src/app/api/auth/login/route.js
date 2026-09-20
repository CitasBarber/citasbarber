import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Barbero from "@/models/Barbero";
import { ok, fail, handler } from "@/lib/api";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { ESTADO_BARBERO, ROLES } from "@/lib/constants";

export const POST = handler(async (req) => {
  await dbConnect();
  const { email, password } = await req.json();
  if (!email || !password) return fail("Email y contraseña son obligatorios");

  const emailNorm = email.toLowerCase().trim();
  let usuario = await Usuario.findOne({ email: emailNorm });
  if (!usuario && (emailNorm === "admin@citasbarber" || emailNorm === "admin@citasbarber.com")) {
    usuario = await Usuario.findOne({
      email: emailNorm === "admin@citasbarber" ? "admin@citasbarber.com" : "admin@citasbarber",
    });
  }
  if (!usuario) return fail("Credenciales inválidas", 401);

  const valido = await verifyPassword(password, usuario.passwordHash);
  if (!valido) return fail("Credenciales inválidas", 401);

  let barbero = null;
  if (usuario.role === ROLES.BARBERO) {
    barbero = await Barbero.findById(usuario.barbero);
    if (!barbero) return fail("Perfil de barbero no encontrado", 404);
    if (barbero.estado === ESTADO_BARBERO.PENDIENTE)
      return fail("Tu cuenta está pendiente de aprobación por el administrador.", 403);
    if (barbero.estado === ESTADO_BARBERO.RECHAZADO)
      return fail("Tu solicitud fue rechazada. Contacta al administrador.", 403);
    if (barbero.estado === ESTADO_BARBERO.INACTIVO)
      return fail("Tu cuenta está inactiva (suscripción vencida).", 403);
  }

  const passwordTemporal = usuario.passwordTemporal === true;

  const token = signToken({
    id: usuario._id.toString(),
    role: usuario.role,
    nombre: usuario.nombre,
    barberoId: barbero?._id?.toString() || null,
    passwordTemporal,
  });
  setSessionCookie(token);

  return ok({
    role: usuario.role,
    nombre: usuario.nombre,
    barberoId: barbero?._id?.toString() || null,
    passwordTemporal,
  });
});
