import { METODOS_PAGO_LABEL, formatoCOP } from "./constants";

// String.fromCodePoint evita problemas de encoding en Windows con emoji U+1F000+.
// El archivo fuente queda en ASCII puro; los caracteres se generan en runtime.
const E = {
  NAVAJA:   String.fromCodePoint(0x1F488), // 💈
  TIJERAS:  String.fromCodePoint(0x2702, 0xFE0F), // ✂️
  UBICACION:String.fromCodePoint(0x1F4CD), // 📍
  RELOJ:    String.fromCodePoint(0x1F550), // 🕐
  CELULAR:  String.fromCodePoint(0x1F4F2), // 📲
  BILLETE:  String.fromCodePoint(0x1F4B5), // 💵
  DINERO:   String.fromCodePoint(0x1F4B0), // 💰
  CALENDARIO:String.fromCodePoint(0x1F4C5),// 📅
  PERSONA:  String.fromCodePoint(0x1F464), // 👤
};

export function normalizarCelular(celular) {
  if (!celular) return "";
  let n = String(celular).replace(/\D/g, "");
  if (n.startsWith("57")) return n;
  if (n.length === 10) return "57" + n;
  return n;
}

export function linkWhatsApp(celular, mensaje) {
  const num = normalizarCelular(celular);
  const texto = encodeURIComponent(mensaje || "");
  return `https://wa.me/${num}?text=${texto}`;
}

export function mensajeNuevaCita(cita, barbero) {
  const plan = cita.planSnapshot || {};
  const servicios = (plan.servicios || []).join(", ");
  const fecha = formatearFecha(cita.fecha);

  let texto =
    `${E.NAVAJA} *Nueva cita solicitada*\n\n` +
    `${E.PERSONA} *Cliente:* ${cita.clienteNombre}\n` +
    `${E.CELULAR} *Cel:* ${cita.clienteCelular}\n` +
    `${E.TIJERAS} *Plan:* ${plan.nombre || cita.plan}\n` +
    `*Servicios:* ${servicios}\n` +
    `${E.CALENDARIO} *Fecha:* ${fecha}\n` +
    `${E.RELOJ} *Hora:* ${cita.horaInicio} - ${cita.horaFin} (${plan.duracion} min)\n` +
    `${E.BILLETE} *Valor:* ${formatoCOP(plan.precio)}\n`;

  if (cita.metodoPago) {
    texto += `${E.DINERO} *Pago:* ${METODOS_PAGO_LABEL[cita.metodoPago] || cita.metodoPago}\n`;
  }
  if ((plan.anticipo || 0) > 0) {
    const monto = Math.round((plan.precio * plan.anticipo) / 100);
    texto += `\n${E.BILLETE} *Anticipo (${plan.anticipo}%):* ${formatoCOP(monto)} - te adjunto el comprobante.\n`;
  }
  texto += `\n${E.CELULAR} _Entra al panel para confirmar o rechazar._`;
  return texto;
}

export function mensajeConfirmacion(cita, barbero) {
  const plan = cita.planSnapshot || {};
  const servicios = (plan.servicios || []).join(", ");
  const fecha = formatearFecha(cita.fecha);
  const direccion = barbero?.direccion ? `\n${E.UBICACION} *Dirección:* ${barbero.direccion}` : "";
  return (
    `${E.NAVAJA} *Tu cita quedo confirmada en ${barbero?.local || "la barberia"}!* ${E.NAVAJA}\n\n` +
    `${E.PERSONA} *Barbero:* ${barbero?.nombre || ""}\n` +
    `${E.TIJERAS} *Plan:* ${plan.nombre || cita.plan}\n` +
    `*Servicios:* ${servicios}\n` +
    `${E.CALENDARIO} *Fecha:* ${fecha}\n` +
    `${E.RELOJ} *Hora:* ${cita.horaInicio} - ${cita.horaFin} (${plan.duracion} min)\n` +
    `${E.BILLETE} *Valor:* ${formatoCOP(plan.precio)}` +
    direccion +
    `\n\n_Ahi lo esperamos!_`
  );
}

export function mensajeRechazo(cita, barbero) {
  return (
    `Hola ${cita.clienteNombre}, soy *${barbero?.nombre || ""}* de *${barbero?.local || "la barberia"}*.\n\n` +
    `Lamentablemente no puedo atender tu solicitud de cita para el ` +
    `${formatearFecha(cita.fecha)} a las ${cita.horaInicio}.\n\n` +
    `_Hablemos para reprogramar._`
  );
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  try {
    // "YYYY-MM-DD" sin hora se parsea como UTC 00:00, lo que en Bogotá (UTC-5)
    // retrocede al día anterior. Forzar mediodía UTC garantiza el día correcto
    // en cualquier timezone entre UTC-11 y UTC+11.
    const d = new Date(fechaISO + "T12:00:00Z");
    return d.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Bogota",
    });
  } catch {
    return String(fechaISO);
  }
}
