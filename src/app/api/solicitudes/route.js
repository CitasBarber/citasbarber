import { dbConnect } from "@/lib/db";
import Solicitud from "@/models/Solicitud";
import { ok, fail, handler } from "@/lib/api";
import { normalizarCelular } from "@/lib/whatsapp";

// POST /api/solicitudes  -> contacto público: un barbero/local pide la app al admin.
export const POST = handler(async (req) => {
  await dbConnect();
  const body = await req.json();
  let { nombre, celular, local, mensaje } = body;

  nombre = (nombre || "").trim();
  local = (local || "").trim();
  mensaje = (mensaje || "").trim();

  if (!nombre || !celular || !mensaje)
    return fail("Nombre, celular y mensaje son obligatorios.");
  if (nombre.length > 80 || local.length > 120 || mensaje.length > 1000)
    return fail("Alguno de los campos es demasiado largo.");
  if (String(celular).replace(/\D/g, "").length < 10)
    return fail("El celular debe tener al menos 10 dígitos.");

  await Solicitud.create({
    nombre,
    celular: normalizarCelular(celular),
    local,
    mensaje,
  });

  return ok({ mensaje: "Solicitud enviada. El administrador te contactará pronto." }, 201);
});
