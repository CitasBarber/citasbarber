import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import { ok, handler } from "@/lib/api";
import { ESTADO_BARBERO } from "@/lib/constants";

// Lista pública de barberos activos (para que el cliente elija)
export const GET = handler(async () => {
  await dbConnect();
  const barberos = await Barbero.find({ estado: ESTADO_BARBERO.ACTIVO })
    .select("nombre local ciudad direccion foto planes")
    .lean();

  const data = barberos.map((b) => ({
    id: b._id.toString(),
    nombre: b.nombre,
    local: b.local,
    ciudad: b.ciudad,
    direccion: b.direccion || "",
    foto: b.foto || "",
    planes: (b.planes || []).filter((p) => p.activo),
  }));
  return ok({ barberos: data });
});
