import { dbConnect } from "@/lib/db";
import Usuario from "@/models/Usuario";
import Barbero from "@/models/Barbero";
import { ok, fail, handler } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { ESTADO_BARBERO, ROLES } from "@/lib/constants";

export const POST = handler(async (req) => {
  await dbConnect();
  const body = await req.json();
  const { nombre, local, celular, ciudad, email, password } = body;

  if (!nombre || !local || !celular || !ciudad || !email || !password)
    return fail("Todos los campos son obligatorios");
  if (password.length < 6)
    return fail("La contraseña debe tener al menos 6 caracteres");

  const existe = await Usuario.findOne({ email: email.toLowerCase().trim() });
  if (existe) return fail("Ya existe una cuenta con ese email", 409);

  const barbero = await Barbero.create({
    nombre,
    local,
    celular,
    ciudad,
    email: email.toLowerCase().trim(),
    estado: ESTADO_BARBERO.PENDIENTE,
    planes: [], // el admin los configura al aprobar
  });

  await Usuario.create({
    role: ROLES.BARBERO,
    nombre,
    email: email.toLowerCase().trim(),
    passwordHash: await hashPassword(password),
    barbero: barbero._id,
  });

  return ok(
    {
      ok: true,
      mensaje:
        "Solicitud enviada. El administrador revisará tu registro y activará tu cuenta.",
    },
    201
  );
});
