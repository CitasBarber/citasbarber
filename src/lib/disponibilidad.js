// Motor de disponibilidad: calcula slots libres según horario laboral,
// días/franjas bloqueadas, citas existentes y la duración exacta del plan.

const GRANULARIDAD_MIN = 15; // paso entre posibles horas de inicio

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

  // No permitir horas en el pasado si la fecha es hoy
  const ahora = new Date();
  const hoyStr = fechaLocalHoy();
  let minPermitido = inicioJornada;
  if (fecha === hoyStr) {
    const minActual = ahora.getHours() * 60 + ahora.getMinutes();
    minPermitido = Math.max(inicioJornada, minActual);
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

export function fechaLocalHoy() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
