import { dbConnect } from "@/lib/db";
import Cita from "@/models/Cita";
import { ok, fail, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ESTADO_CITA, ROLES, METODOS_PAGO_LABEL } from "@/lib/constants";
import { fechaLocalHoy, minutosActualesColombia, minAHhmm } from "@/lib/disponibilidad";

// GET /api/barbero/resumen?fecha=YYYY-MM-DD  -> resumen diario del barbero (cuadre de caja y productividad)
export const GET = handler(async (req) => {
  await dbConnect();
  const session = getSession();
  if (!session || session.role !== ROLES.BARBERO)
    return fail("No autorizado", 403);

  const hoy = fechaLocalHoy();
  const ahoraHhmm = minAHhmm(minutosActualesColombia());

  // Auto-completar citas pasadas antes de calcular métricas
  await Cita.updateMany(
    {
      barbero: session.barberoId,
      estado: ESTADO_CITA.CONFIRMADA,
      $or: [
        { fecha: { $lt: hoy } },
        { fecha: hoy, horaFin: { $lte: ahoraHhmm } },
      ],
    },
    { $set: { estado: ESTADO_CITA.COMPLETADA } }
  );

  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha") || hoy;

  // Consultar todas las citas del día para obtener métricas completas de estados
  const todasLasCitas = await Cita.find({
    barbero: session.barberoId,
    fecha,
  }).lean();

  const completadas = todasLasCitas.filter((c) => c.estado === ESTADO_CITA.COMPLETADA);
  const confirmadas = todasLasCitas.filter((c) => c.estado === ESTADO_CITA.CONFIRMADA);
  const solicitadas = todasLasCitas.filter((c) => c.estado === ESTADO_CITA.SOLICITADA);
  const canceladas = todasLasCitas.filter(
    (c) => c.estado === ESTADO_CITA.CANCELADA || c.estado === ESTADO_CITA.RECHAZADA
  );
  const noAsistidas = todasLasCitas.filter((c) => c.estado === ESTADO_CITA.NO_ASISTIO);

  // Citas que forman parte del turno activo (completadas + confirmadas)
  const citasActivas = [...completadas, ...confirmadas];

  // 1. Finanzas y Cuadre de Caja (Numeral 1)
  let ingresosCobrados = 0;
  let ingresosPendientes = 0;

  for (const c of completadas) {
    ingresosCobrados += c.planSnapshot?.precio || 0;
  }
  for (const c of confirmadas) {
    ingresosPendientes += c.planSnapshot?.precio || 0;
  }
  const ingresosTotales = ingresosCobrados + ingresosPendientes;

  // Ticket promedio: cobrado real si ya hubo citas, o proyectado del día
  const ticketPromedioCobrado = completadas.length > 0
    ? Math.round(ingresosCobrados / completadas.length)
    : 0;
  const ticketPromedioProyectado = citasActivas.length > 0
    ? Math.round(ingresosTotales / citasActivas.length)
    : 0;

  // Desglose por método de pago (para cuadre de caja)
  const metodosMap = {};
  let efectivoCobrado = 0;
  let efectivoPendiente = 0;
  let digitalCobrado = 0;
  let digitalPendiente = 0;

  for (const c of citasActivas) {
    const rawMetodo = c.metodoPago || "sin_definir";
    const precio = c.planSnapshot?.precio || 0;
    const esCompletada = c.estado === ESTADO_CITA.COMPLETADA;

    if (!metodosMap[rawMetodo]) {
      metodosMap[rawMetodo] = {
        key: rawMetodo,
        label: METODOS_PAGO_LABEL[rawMetodo] || (rawMetodo === "sin_definir" ? "Por definir" : rawMetodo),
        cantidad: 0,
        cobrado: 0,
        pendiente: 0,
        total: 0,
      };
    }

    metodosMap[rawMetodo].cantidad += 1;
    metodosMap[rawMetodo].total += precio;
    if (esCompletada) {
      metodosMap[rawMetodo].cobrado += precio;
      if (rawMetodo === "efectivo") efectivoCobrado += precio;
      else digitalCobrado += precio;
    } else {
      metodosMap[rawMetodo].pendiente += precio;
      if (rawMetodo === "efectivo") efectivoPendiente += precio;
      else digitalPendiente += precio;
    }
  }

  const desgloseMetodos = Object.values(metodosMap).sort((a, b) => b.total - a.total);

  // 2. Desglose por plan (bronce, plata, oro)
  const desglosePlanes = {
    bronce: { cantidad: 0, completadas: 0, pendientes: 0, ingresosCobrados: 0, ingresos: 0 },
    plata: { cantidad: 0, completadas: 0, pendientes: 0, ingresosCobrados: 0, ingresos: 0 },
    oro: { cantidad: 0, completadas: 0, pendientes: 0, ingresosCobrados: 0, ingresos: 0 },
  };

  for (const c of citasActivas) {
    const key = c.plan;
    const precio = c.planSnapshot?.precio || 0;
    if (desglosePlanes[key]) {
      desglosePlanes[key].cantidad += 1;
      desglosePlanes[key].ingresos += precio;
      if (c.estado === ESTADO_CITA.COMPLETADA) {
        desglosePlanes[key].completadas += 1;
        desglosePlanes[key].ingresosCobrados += precio;
      } else {
        desglosePlanes[key].pendientes += 1;
      }
    }
  }

  // 3. Productividad y Tiempo en sillón (Numeral 3)
  let minutosTrabajados = 0;
  let minutosPendientes = 0;

  for (const c of completadas) {
    minutosTrabajados += c.planSnapshot?.duracion || 0;
  }
  for (const c of confirmadas) {
    minutosPendientes += c.planSnapshot?.duracion || 0;
  }
  const minutosTotales = minutosTrabajados + minutosPendientes;

  const totalActivas = citasActivas.length;
  const porcentajeProgreso = totalActivas > 0
    ? Math.round((completadas.length / totalActivas) * 100)
    : 0;

  return ok({
    fecha,
    totalCitas: totalActivas,
    ingresosTotales,
    ingresosCobrados,
    ingresosPendientes,
    ticketPromedio: ticketPromedioCobrado || ticketPromedioProyectado,
    ticketPromedioCobrado,
    ticketPromedioProyectado,
    efectivo: {
      cobrado: efectivoCobrado,
      pendiente: efectivoPendiente,
      total: efectivoCobrado + efectivoPendiente,
    },
    digital: {
      cobrado: digitalCobrado,
      pendiente: digitalPendiente,
      total: digitalCobrado + digitalPendiente,
    },
    desgloseMetodos,
    desglose: desglosePlanes,
    productividad: {
      minutosTrabajados,
      minutosPendientes,
      minutosTotales,
      porcentajeProgreso,
    },
    estados: {
      completadas: completadas.length,
      confirmadas: confirmadas.length,
      solicitadas: solicitadas.length,
      canceladas: canceladas.length,
      noAsistidas: noAsistidas.length,
      totalRegistradas: todasLasCitas.length,
    },
    completadas: completadas.length,
    confirmadas: confirmadas.length,
  });
});
