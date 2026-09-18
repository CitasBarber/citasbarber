import { dbConnect } from "@/lib/db";
import Cita from "@/models/Cita";
import Cliente from "@/models/Cliente";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// GET /api/barbero/clientes?q=...  -> busca clientes frecuentes del barbero
export const GET = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.BARBERO)
    return fail("No autorizado", 403);

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q || q.length < 2) return ok({ clientes: [] });

  const escaped = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  // Buscar en las citas anteriores del barbero
  const citas = await Cita.find({
    barbero: session.barberoId,
    $or: [{ clienteNombre: regex }, { clienteCelular: regex }],
  })
    .sort({ createdAt: -1 })
    .limit(40)
    .lean();

  const map = new Map();
  for (const c of citas) {
    const key = (c.clienteCelular || c.clienteNombre || "").toLowerCase();
    if (key && !map.has(key)) {
      map.set(key, {
        nombre: c.clienteNombre,
        celular: c.clienteCelular || "",
      });
    }
  }

  // Si hay pocos resultados, complementar con la colección de clientes registrados
  if (map.size < 6) {
    const clientes = await Cliente.find({
      $or: [{ nombre: regex }, { celular: regex }],
    })
      .limit(10)
      .lean();

    for (const cl of clientes) {
      const key = (cl.celular || cl.nombre || "").toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, {
          nombre: cl.nombre,
          celular: cl.celular || "",
        });
      }
    }
  }

  return ok({ clientes: Array.from(map.values()).slice(0, 6) });
});
