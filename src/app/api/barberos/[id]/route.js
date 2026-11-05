import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import { ok, fail, handler } from "@/lib/api";
import { ESTADO_BARBERO } from "@/lib/constants";
import { MARCA_DEFAULT } from "@/lib/brands";

export const dynamic = "force-dynamic";

// Detalle público de un barbero activo (sin datos sensibles de credenciales)
export const GET = handler(async (req, { params }) => {
  await dbConnect();
  const b = await Barbero.findById(params.id)
    .select("nombre local ciudad direccion foto redes celular planes horario datosPago ventanaCancelacionHoras estado marca")
    .lean();
  if (!b || b.estado !== ESTADO_BARBERO.ACTIVO)
    return fail("Profesional no encontrado o inactivo", 404);

  return ok({
    barbero: {
      id: b._id.toString(),
      nombre: b.nombre,
      local: b.local,
      ciudad: b.ciudad,
      direccion: b.direccion || "",
      foto: b.foto || "",
      marca: b.marca || MARCA_DEFAULT,
      redes: b.redes || {},
      celular: b.celular,
      horario: b.horario,
      ventanaCancelacionHoras: b.ventanaCancelacionHoras,
      datosPago: b.datosPago || {},
      planes: (b.planes || []).filter((p) => p.activo),
    },
  });
});
