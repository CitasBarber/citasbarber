// Serializadores de documentos para las respuestas de la API.

export function serializarCita(c) {
  return {
    id: c._id.toString(),
    barbero: c.barbero?.toString?.() || c.barbero,
    clienteNombre: c.clienteNombre,
    clienteCelular: c.clienteCelular,
    plan: c.plan,
    planSnapshot: c.planSnapshot,
    fecha: c.fecha,
    horaInicio: c.horaInicio,
    horaFin: c.horaFin,
    metodoPago: c.metodoPago,
    pagoAnticipo: c.pagoAnticipo
      ? { ...c.pagoAnticipo, comprobante: c.pagoAnticipo.comprobante ? true : false }
      : null,
    estado: c.estado,
    esManual: c.esManual,
    motivoRechazo: c.motivoRechazo,
    createdAt: c.createdAt,
  };
}
