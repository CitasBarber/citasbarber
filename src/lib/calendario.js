// Utilidades para exportar citas a Google Calendar y Calendario de celular (iCalendar .ics)
// Zona horaria: America/Bogota (UTC-5)

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Convierte fecha ('YYYY-MM-DD') y hora ('HH:mm') en zona horaria de Bogotá (UTC-5)
 * al formato UTC requerido por el estándar iCalendar: 'YYYYMMDDTHHmmssZ'.
 */
export function fechaHoraAUfc(fechaStr, horaStr) {
  if (!fechaStr || !horaStr) return "";
  const isoBogota = `${fechaStr}T${horaStr}:00-05:00`;
  const d = new Date(isoBogota);
  if (isNaN(d.getTime())) return "";

  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const dia = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());

  return `${y}${m}${dia}T${h}${min}${s}Z`;
}

/**
 * Convierte fecha y hora a formato local 'YYYYMMDDTHHmm00' para Google Calendar.
 */
export function fechaHoraLocal(fechaStr, horaStr) {
  if (!fechaStr || !horaStr) return "";
  const f = fechaStr.replace(/-/g, "");
  const h = horaStr.replace(/:/g, "");
  return `${f}T${h}00`;
}

/**
 * Escapa texto según especificación RFC 5545 para archivos .ics
 */
function escaparIcs(texto = "") {
  return String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Genera la URL para abrir y prellenar el evento en Google Calendar
 */
export function generarGoogleCalendarUrl(cita, barbero = {}) {
  const titulo = `Cita: ${cita.clienteNombre || "Cliente"} - ${cita.planSnapshot?.nombre || cita.plan || "Corte"}`;
  const start = fechaHoraLocal(cita.fecha, cita.horaInicio);
  const end = fechaHoraLocal(cita.fecha, cita.horaFin);

  const lineas = [
    `Cliente: ${cita.clienteNombre || "Sin nombre"}`,
    cita.clienteCelular ? `Teléfono: ${cita.clienteCelular}` : null,
    `Servicio: ${cita.planSnapshot?.nombre || cita.plan || "Corte"}`,
    cita.planSnapshot?.precio ? `Precio: $${cita.planSnapshot.precio.toLocaleString("es-CO")} COP` : null,
    cita.metodoPago ? `Método de pago: ${cita.metodoPago}` : null,
    cita.esManual ? "Nota: Agendada manualmente por el barbero" : null,
  ].filter(Boolean);

  const ubicacion = [
    barbero.local || "Barbería 770 Caldas",
    barbero.direccion,
    barbero.ciudad,
  ].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo,
    dates: `${start}/${end}`,
    details: lineas.join("\n"),
    location: ubicacion,
    ctz: "America/Bogota",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera el bloque VEVENT para una cita
 */
function generarVEvent(cita, barbero = {}) {
  const dtStart = fechaHoraAUfc(cita.fecha, cita.horaInicio);
  const dtEnd = fechaHoraAUfc(cita.fecha, cita.horaFin);
  const dtStamp = fechaHoraAUfc(new Date().toISOString().slice(0, 10), "12:00");
  const uid = `cita-${cita.id || cita._id || Math.random().toString(36).slice(2)}@barberia770.com`;

  const titulo = `Cita: ${cita.clienteNombre || "Cliente"} - ${cita.planSnapshot?.nombre || cita.plan || "Corte"}`;
  const lineas = [
    `Cliente: ${cita.clienteNombre || "Sin nombre"}`,
    cita.clienteCelular ? `Teléfono: ${cita.clienteCelular}` : null,
    `Servicio: ${cita.planSnapshot?.nombre || cita.plan || "Corte"}`,
    cita.planSnapshot?.precio ? `Precio: $${cita.planSnapshot.precio.toLocaleString("es-CO")} COP` : null,
    cita.metodoPago ? `Método de pago: ${cita.metodoPago}` : null,
    cita.esManual ? "Nota: Agendada manualmente por el barbero" : null,
  ].filter(Boolean);

  const ubicacion = [
    barbero.local || "Barbería 770 Caldas",
    barbero.direccion,
    barbero.ciudad,
  ].filter(Boolean).join(", ");

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escaparIcs(titulo)}`,
    `DESCRIPTION:${escaparIcs(lineas.join("\n"))}`,
    `LOCATION:${escaparIcs(ubicacion)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ].join("\r\n");
}

/**
 * Genera el archivo .ics completo para una sola cita
 */
export function generarIcsCita(cita, barbero = {}) {
  const vevent = generarVEvent(cita, barbero);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Barberia 770 Caldas//Citas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    vevent,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Genera un archivo .ics multievento con todas las citas confirmadas de un día
 */
export function generarIcsDia(citas = [], barbero = {}) {
  const vevents = citas.map((c) => generarVEvent(c, barbero)).join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Barberia 770 Caldas//Citas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Dispara la descarga del archivo .ics en el navegador del celular o computadora
 */
export function descargarIcs(nombreArchivo, contenidoIcs) {
  if (typeof window === "undefined") return;
  const blob = new Blob([contenidoIcs], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo.endsWith(".ics") ? nombreArchivo : `${nombreArchivo}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
