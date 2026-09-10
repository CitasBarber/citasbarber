import { dbConnect } from "@/lib/db";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ESTADO_CITA, ROLES } from "@/lib/constants";
import { fechaLocalHoy } from "@/lib/disponibilidad";

// GET /api/barbero/resumen?fecha=YYYY-MM-DD  -> resumen diario del barbero
export const GET = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.BARBERO)
    return fail("No autorizado", 403);

  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha") || fechaLocalHoy();

  const citas = await Cita.find({
    barbero: session.barberoId,
    fecha,
    estado: { $in: [ESTADO_CITA.CONFIRMADA, ESTADO_CITA.COMPLETADA] },
  }).lean();

  const desglose = { bronce: { cantidad: 0, ingresos: 0 }, plata: { cantidad: 0, ingresos: 0 }, oro: { cantidad: 0, ingresos: 0 } };
  let totalCitas = 0;
  let ingresosTotales = 0;

  for (const c of citas) {
    const key = c.plan;
    const precio = c.planSnapshot?.precio || 0;
    if (desglose[key]) {
      desglose[key].cantidad += 1;
      desglose[key].ingresos += precio;
    }
    totalCitas += 1;
    ingresosTotales += precio;
  }

  return ok({
    fecha,
    totalCitas,
    ingresosTotales,
    desglose,
    completadas: citas.filter((c) => c.estado === ESTADO_CITA.COMPLETADA).length,
    confirmadas: citas.filter((c) => c.estado === ESTADO_CITA.CONFIRMADA).length,
  });
});
