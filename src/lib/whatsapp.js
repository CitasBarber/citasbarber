import { METODOS_PAGO_LABEL, formatoCOP } from "./constants";
import { EMOJI as E } from "./emojis";

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

// Quita emojis y selectores de variación de un texto. Se usa en la versión
// "plana" (PC), donde WhatsApp Desktop en Windows corrompe los emojis a "�".
function limpiarEmojis(s) {
  return String(s)
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

// plano=true -> mensaje sin emojis (para PC/WhatsApp Desktop, más estético y sin "�").
// plano=false -> mensaje con emojis (para móvil, donde se ven bien).
export function mensajeNuevaCita(cita, barbero, { plano = false } = {}) {
  const plan = cita.planSnapshot || {};
  const em = (k) => (plano ? "" : `${E[k]} `);
  const servicios = (plan.servicios || [])
    .map((s) => (plano ? limpiarEmojis(s) : s))
    .join(", ");
  const fecha = formatearFecha(cita.fecha);

  let texto =
    `${em("NAVAJA")}*Nueva cita solicitada*\n\n` +
    `${em("PERSONA")}*Cliente:* ${cita.clienteNombre}\n` +
    `${em("CELULAR")}*Cel:* ${cita.clienteCelular}\n` +
    `${em("TIJERAS")}*Plan:* ${plan.nombre || cita.plan}\n` +
    `*Servicios:* ${servicios}\n` +
    `${em("CALENDARIO")}*Fecha:* ${fecha}\n` +
    `${em("RELOJ")}*Hora:* ${cita.horaInicio} - ${cita.horaFin} (${plan.duracion} min)\n` +
    `${em("BILLETE")}*Valor:* ${formatoCOP(plan.precio)}\n`;

  if (cita.metodoPago) {
    texto += `${em("DINERO")}*Pago:* ${METODOS_PAGO_LABEL[cita.metodoPago] || cita.metodoPago}\n`;
  }
  if ((plan.anticipo || 0) > 0) {
    const monto = Math.round((plan.precio * plan.anticipo) / 100);
    texto += `\n${em("BILLETE")}*Anticipo (${plan.anticipo}%):* ${formatoCOP(monto)} - te adjunto el comprobante.\n`;
  }
  texto += `\n${em("CELULAR")}_Entra al panel para confirmar o rechazar._`;
  return texto;
}

export function mensajeConfirmacion(cita, barbero, { plano = false } = {}) {
  const plan = cita.planSnapshot || {};
  const em = (k) => (plano ? "" : `${E[k]} `);
  const servicios = (plan.servicios || [])
    .map((s) => (plano ? limpiarEmojis(s) : s))
    .join(", ");
  const fecha = formatearFecha(cita.fecha);
  const cierreTitulo = plano ? "" : ` ${E.NAVAJA}`;
  const direccion = barbero?.direccion
    ? `\n${em("UBICACION")}*Dirección:* ${barbero.direccion}`
    : "";
  return (
    `${em("NAVAJA")}*Tu cita quedo confirmada en ${barbero?.local || "la barberia"}!*${cierreTitulo}\n\n` +
    `${em("PERSONA")}*Barbero:* ${barbero?.nombre || ""}\n` +
    `${em("TIJERAS")}*Plan:* ${plan.nombre || cita.plan}\n` +
    `*Servicios:* ${servicios}\n` +
    `${em("CALENDARIO")}*Fecha:* ${fecha}\n` +
    `${em("RELOJ")}*Hora:* ${cita.horaInicio} - ${cita.horaFin} (${plan.duracion} min)\n` +
    `${em("BILLETE")}*Valor:* ${formatoCOP(plan.precio)}` +
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

export function mensajeCancelacion(cita, barbero, { motivo = "" } = {}) {
  const detalleMotivo = motivo ? `\n\n*Motivo:* ${motivo}` : "";
  return (
    `Hola ${cita.clienteNombre}, soy *${barbero?.nombre || ""}* de *${barbero?.local || "la barberia"}*.\n\n` +
    `Tuve que cancelar tu cita confirmada para el ` +
    `${formatearFecha(cita.fecha)} a las ${cita.horaInicio}.` +
    detalleMotivo +
    `\n\n_Escríbeme para reprogramar cuando quieras._`
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
