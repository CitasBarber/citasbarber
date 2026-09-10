import { dbConnect } from "@/lib/db";
import Cliente from "@/models/Cliente";
import { ok, fail, handler } from "@/lib/api";
import { normalizarCelular } from "@/lib/whatsapp";

// El cliente se identifica por celular. Si envía nombre, se crea/actualiza.
// POST { celular, nombre? }
export const POST = handler(async (req) => {
  await dbConnect();
  const { celular, nombre } = await req.json();
  if (!celular) return fail("El celular es obligatorio");

  const cel = normalizarCelular(celular);
  let cliente = await Cliente.findOne({ celular: cel });

  if (!cliente) {
    if (!nombre)
      return ok({ registrado: false, mensaje: "Cliente nuevo, se requiere nombre" });
    cliente = await Cliente.create({ nombre: nombre.trim(), celular: cel });
  } else if (nombre && nombre.trim() && nombre.trim() !== cliente.nombre) {
    cliente.nombre = nombre.trim();
    await cliente.save();
  }

  return ok({
    registrado: true,
    cliente: { id: cliente._id.toString(), nombre: cliente.nombre, celular: cliente.celular },
  });
});
