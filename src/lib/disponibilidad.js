// Motor de disponibilidad: calcula slots libres según horario laboral,
// días/franjas bloqueadas, citas existentes y la duración exacta del plan.

const GRANULARIDAD_MIN = 15; // paso entre posibles horas de inicio
const ZONA_HORARIA = "America/Bogota"; // Colombia (UTC-5, sin horario de verano)

export function hhmmAMin(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

export function minAHhmm(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// fecha: 'YYYY-MM-DD'. Devuelve día de la semana 0..6 (0=domingo) en zona local del string.
export function diaSemanaDeFecha(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function seSolapa(inicioA, finA, inicioB, finB) {
  return inicioA < finB && inicioB < finA;
}

/**
 * Calcula los slots disponibles para un barbero en una fecha y duración dadas.
 * @param {Object} params
 * @param {Object} params.barbero  documento del barbero (horario, diasBloqueados, franjasBloqueadas)
 * @param {string} params.fecha    'YYYY-MM-DD'
 * @param {number} params.duracion minutos que ocupa la cita (según plan)
 * @param {Array}  params.citas    citas ocupadas ese día [{horaInicio, horaFin}]
 * @returns {string[]} lista de horas de inicio 'HH:mm' disponibles
 */
export function calcularSlots({ barbero, fecha, duracion, citas = [] }) {
  const horario = barbero.horario || {};
  const dia = diaSemanaDeFecha(fecha);

  // ¿Es día laboral?
  const diasLaborales = horario.diasLaborales || [1, 2, 3, 4, 5, 6];
  if (!diasLaborales.includes(dia)) return [];

  // ¿Día completo bloqueado?
  if ((barbero.diasBloqueados || []).includes(fecha)) return [];

  const inicioJornada = hhmmAMin(horario.horaInicio || "10:00");
  const finJornada = hhmmAMin(horario.horaFin || "19:00");

  // Intervalos ocupados: citas + franjas bloqueadas de ese día
  const ocupados = [];
  for (const c of citas) {
    ocupados.push([hhmmAMin(c.horaInicio), hhmmAMin(c.horaFin)]);
  }
  for (const f of barbero.franjasBloqueadas || []) {
    if (f.fecha === fecha) {
      ocupados.push([hhmmAMin(f.horaInicio), hhmmAMin(f.horaFin)]);
    }
  }

  // No permitir horas en el pasado si la fecha es hoy (según hora de Colombia,
  // no la del servidor, que en producción corre en UTC).
  const hoyStr = fechaLocalHoy();
  let minPermitido = inicioJornada;
  if (fecha === hoyStr) {
    minPermitido = Math.max(inicioJornada, minutosActualesColombia());
  }

  const slots = [];
  for (let t = inicioJornada; t + duracion <= finJornada; t += GRANULARIDAD_MIN) {
    if (t < minPermitido) continue;
    const fin = t + duracion;
    const chocaConOcupado = ocupados.some(([oi, of]) => seSolapa(t, fin, oi, of));
    if (!chocaConOcupado) {
      slots.push(minAHhmm(t));
    }
  }
  return slots;
}

// Fecha 'YYYY-MM-DD' de hoy en zona horaria de Colombia, sin depender de la
// zona del servidor (UTC en Vercel) ni del navegador del cliente.
export function fechaLocalHoy() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Minutos transcurridos del día (0..1439) ahora mismo en Colombia.
export function minutosActualesColombia() {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA_HORARIA,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const h = Number(partes.find((p) => p.type === "hour").value);
  const m = Number(partes.find((p) => p.type === "minute").value);
  return h * 60 + m;
}
