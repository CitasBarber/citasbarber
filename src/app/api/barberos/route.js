import { dbConnect } from "@/lib/db";
import Barbero from "@/models/Barbero";
import { ok, handler } from "@/lib/api";
import { ESTADO_BARBERO } from "@/lib/constants";
import { seedIfEmpty } from "@/lib/seed";
import { MARCA_DEFAULT, esMarcaValida } from "@/lib/brands";

// Siempre dinámica: evita que Next.js congele la lista en build (datos frescos
// en cada request y sin conectar a la BD durante el build).
export const dynamic = "force-dynamic";

// Lista pública de negocios activos (para que el cliente elija).
// ?marca=barber|pet|spa filtra por submarca; los negocios antiguos sin campo
// `marca` cuentan como la marca por defecto.
export const GET = handler(async (req) => {
  await dbConnect();
  const marca = new URL(req.url).searchParams.get("marca");
  const query = { estado: ESTADO_BARBERO.ACTIVO };
  if (esMarcaValida(marca)) {
    query.marca = marca === MARCA_DEFAULT ? { $in: [marca, null] } : marca;
  }
  const barberos = await Barbero.find(query)
    .select("nombre local ciudad direccion foto planes marca")
    .lean();

  const data = barberos.map((b) => ({
    id: b._id.toString(),
    nombre: b.nombre,
    local: b.local,
    ciudad: b.ciudad,
    direccion: b.direccion || "",
    foto: b.foto || "",
    marca: b.marca || MARCA_DEFAULT,
    planes: (b.planes || []).filter((p) => p.activo),
  }));
  return ok({ barberos: data });
});
