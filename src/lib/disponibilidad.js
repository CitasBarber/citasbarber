// Motor de disponibilidad: calcula slots libres según horario laboral,
// días/franjas bloqueadas, citas existentes y la duración exacta del plan.

// Paso único de tiempo, compartido por el agendamiento (posibles horas de inicio)
// y por la rejilla del Calendario del barbero, para que ambos coincidan.
export const PASO_MIN = 30;
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

export function seSolapa(inicioA, finA, inicioB, finB) {
  return inicioA < finB && inicioB < finA;
}

/**
 * Dadas unas citas y la configuración de ausencias del barbero, devuelve las
 * citas que quedan dentro de un día completo bloqueado o de una franja de horas
 * bloqueada (solape). Sirve para avisar al barbero al configurar ausencias.
 * @param {Object} params
 * @param {Array}  params.citas             citas activas [{fecha, horaInicio, horaFin, ...}]
 * @param {string[]} params.diasBloqueados  ['YYYY-MM-DD']
 * @param {Array}  params.franjasBloqueadas [{fecha, horaInicio, horaFin}]
 * @returns {Array} subconjunto de `citas` en conflicto
 */
export function citasEnConflicto({ citas = [], diasBloqueados = [], franjasBloqueadas = [] }) {
  return citas.filter((c) => {
    if (diasBloqueados.includes(c.fecha)) return true;
    const ini = hhmmAMin(c.horaInicio);
    const fin = hhmmAMin(c.horaFin);
    return franjasBloqueadas.some(
      (f) => f.fecha === c.fecha && seSolapa(ini, fin, hhmmAMin(f.horaInicio), hhmmAMin(f.horaFin))
    );
  });
}

/**
 * Núcleo de disponibilidad y única fuente de verdad de la jornada de un barbero
 * en una fecha. La usan tanto `calcularSlots` (agendamiento manual y público)
 * como la rejilla del Calendario del barbero, para que ambos coincidan siempre.
 *
 * @param {Object} params
 * @param {Object} params.barbero  documento del barbero (horario, diasBloqueados, franjasBloqueadas)
 * @param {string} params.fecha    'YYYY-MM-DD'
 * @param {Array}  params.citas    citas ocupadas ese día [{horaInicio, horaFin, ...}]
 * @returns {Object} { tipo: 'noLaboral' | 'bloqueado' | 'laboral', ... }
 *   Para 'laboral' incluye: inicioMin, finMin, ocupados[], minPermitido.
 *   Cada ocupado: { tipo: 'cita'|'ausencia'|'almuerzo', ini, fin, cita?, franja? }.
 */
export function jornadaDelDia({ barbero, fecha, citas = [] }) {
  const horario = barbero.horario || {};
  const dia = diaSemanaDeFecha(fecha);

  // ¿Es día laboral?
  const diasLaborales = horario.diasLaborales || [1, 2, 3, 4, 5, 6];
  if (!diasLaborales.includes(dia)) return { tipo: "noLaboral" };

  // ¿Día completo bloqueado?
  if ((barbero.diasBloqueados || []).includes(fecha)) return { tipo: "bloqueado" };

  const inicioMin = hhmmAMin(horario.horaInicio || "10:00");
  const finMin = hhmmAMin(horario.horaFin || "19:00");

  // Intervalos ocupados, en orden de prioridad: primero las citas (que ganan al
  // pintar el calendario si solapan), luego franjas bloqueadas y el almuerzo.
  const ocupados = [];
  for (const c of citas) {
    ocupados.push({ tipo: "cita", ini: hhmmAMin(c.horaInicio), fin: hhmmAMin(c.horaFin), cita: c });
  }
  for (const f of barbero.franjasBloqueadas || []) {
    if (f.fecha === fecha) {
      ocupados.push({ tipo: "ausencia", ini: hhmmAMin(f.horaInicio), fin: hhmmAMin(f.horaFin), franja: f });
    }
  }

  // Hora de almuerzo: se aplica a todos los días laborales (ya validamos arriba
  // que la fecha es un día laboral), así que no queda disponible para agendar.
  const almuerzo = horario.almuerzo;
  if (almuerzo && almuerzo.activo && almuerzo.horaInicio && almuerzo.horaFin) {
    const ini = hhmmAMin(almuerzo.horaInicio);
    const fin = hhmmAMin(almuerzo.horaFin);
    if (fin > ini) {
      ocupados.push({
        tipo: "almuerzo",
        ini,
        fin,
        franja: { horaInicio: almuerzo.horaInicio, horaFin: almuerzo.horaFin, motivo: "Almuerzo" },
      });
    }
  }

  // No permitir horas en el pasado si la fecha es hoy (según hora de Colombia,
  // no la del servidor, que en producción corre en UTC).
  const hoyStr = fechaLocalHoy();
  let minPermitido = inicioMin;
  if (fecha === hoyStr) {
    minPermitido = Math.max(inicioMin, minutosActualesColombia());
  }

  return { tipo: "laboral", inicioMin, finMin, ocupados, minPermitido };
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
  const jornada = jornadaDelDia({ barbero, fecha, citas });
  if (jornada.tipo !== "laboral") return [];

  const { inicioMin, finMin, ocupados, minPermitido } = jornada;

  const slots = [];
  for (let t = inicioMin; t + duracion <= finMin; t += PASO_MIN) {
    if (t < minPermitido) continue;
    const fin = t + duracion;
    const chocaConOcupado = ocupados.some((o) => seSolapa(t, fin, o.ini, o.fin));
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

// true si la fecha 'YYYY-MM-DD' es anterior a hoy (zona Colombia). La comparación
// lexicográfica de strings 'YYYY-MM-DD' equivale a comparar fechas.
export function esFechaPasada(fecha) {
  return !!fecha && fecha < fechaLocalHoy();
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
