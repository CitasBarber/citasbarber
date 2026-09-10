"use client";

import { useEffect, useMemo, useState } from "react";
import EstadoBadge from "@/components/EstadoBadge";
import { WhatsAppIcon } from "@/components/Icons";
import { DIAS_SEMANA } from "@/lib/constants";
import { fechaLocalHoy, hhmmAMin, minAHhmm, diaSemanaDeFecha } from "@/lib/disponibilidad";
import { esMovil } from "@/lib/dispositivo";

const DOT_COLOR = {
  solicitada: "bg-amber-400",
  confirmada: "bg-green-500",
  completada: "bg-blue-500",
  rechazada:  "bg-red-400",
  cancelada:  "bg-gray-300",
};

const CITA_ESTILO = {
  solicitada: { wrap: "border-amber-200 bg-amber-50",  barra: "bg-amber-400" },
  confirmada: { wrap: "border-green-200 bg-green-50",  barra: "bg-green-500" },
  completada: { wrap: "border-blue-200  bg-blue-50",   barra: "bg-blue-500"  },
};

export default function Calendario({ perfil }) {
  const [citas, setCitas] = useState([]);
  const hoy = fechaLocalHoy();
  const [ref, setRef] = useState(new Date());
  const [diaSel, setDiaSel] = useState(hoy);
  const [vista, setVista] = useState("semana");
  const [abierta, setAbierta] = useState(null); // id de la cita expandida

  function cargar() {
    fetch("/api/citas")
      .then((r) => r.json())
      .then((d) => setCitas(d.citas || []));
  }

  useEffect(() => { cargar(); }, []);

  async function accion(id, accion, extra = {}) {
    if (accion === "rechazar") {
      extra.motivo = prompt("Motivo del rechazo (opcional):") || "";
    }
    const res = await fetch(`/api/citas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion, plano: !esMovil(), ...extra }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);
    if (d.linkWhatsApp) window.open(d.linkWhatsApp, "_blank");
    cargar();
  }

  const porFecha = useMemo(() => {
    const m = {};
    for (const c of citas) {
      if (["cancelada", "rechazada"].includes(c.estado)) continue;
      (m[c.fecha] = m[c.fecha] || []).push(c);
    }
    return m;
  }, [citas]);

  const dias = useMemo(
    () => (vista === "mes" ? diasDelMes(ref) : diasDeLaSemana(ref)),
    [ref, vista]
  );

  const citasDia = (porFecha[diaSel] || []).sort((a, b) =>
    a.horaInicio.localeCompare(b.horaInicio)
  );

  const timeline = useMemo(
    () => (perfil?.horario ? buildTimeline(diaSel, perfil, citasDia) : null),
    [diaSel, perfil, citasDia]
  );

  const titulo = ref.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  return (
    <div>
      {/* Cabecera navegación */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <button
            className="btn-outline text-sm py-1.5 px-3 shrink-0"
            onClick={() => setRef(mover(ref, vista, -1))}
          >‹</button>
          <button
            className="btn-outline text-sm py-1.5 px-3 shrink-0"
            onClick={() => setRef(mover(ref, vista, 1))}
          >›</button>
          <span className="ml-1 font-display text-base sm:text-xl capitalize truncate">{titulo}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            className={`text-sm py-1.5 px-2.5 sm:px-3 rounded-lg min-h-[36px] font-semibold ${vista === "semana" ? "bg-barber-ink text-white" : "border"}`}
            onClick={() => setVista("semana")}
          >Sem.</button>
          <button
            className={`text-sm py-1.5 px-2.5 sm:px-3 rounded-lg min-h-[36px] font-semibold ${vista === "mes" ? "bg-barber-ink text-white" : "border"}`}
            onClick={() => setVista("mes")}
          >Mes</button>
        </div>
      </div>

      {/* Grid días */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-barber-gray mb-1">
        {DIAS_SEMANA.map((d) => <div key={d}>{d.slice(0, 3)}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dias.map((d, i) => {
          if (!d) return <div key={i} />;
          const f = iso(d);
          const items = porFecha[f] || [];
          const esHoy = f === hoy;
          const sel = f === diaSel;
          return (
            <button
              key={i}
              onClick={() => setDiaSel(f)}
              className={`min-h-[64px] rounded-lg border p-1 text-left transition ${sel ? "ring-2 ring-barber-red" : ""} ${esHoy ? "bg-barber-cream" : "bg-white"}`}
            >
              <div className="text-xs font-semibold">{d.getDate()}</div>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {items.slice(0, 4).map((c) => (
                  <span key={c.id} className={`w-2 h-2 rounded-full ${DOT_COLOR[c.estado] || "bg-gray-400"}`} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Timeline del día seleccionado */}
      <div className="mt-6">
        <h3 className="font-display text-lg mb-1 capitalize">{formatDiaDetalle(diaSel)}</h3>

        {timeline === null && (
          <p className="text-barber-gray text-sm">Cargando horario…</p>
        )}

        {timeline?.tipo === "noLaboral" && (
          <div className="card p-5 text-center text-barber-gray">
            <p className="text-2xl mb-1">😴</p>
            <p className="text-sm font-semibold">Día de descanso</p>
            <p className="text-xs mt-0.5">No configuraste trabajo este día.</p>
          </div>
        )}

        {timeline?.tipo === "bloqueado" && (
          <div className="card p-5 text-center text-barber-gray">
            <p className="text-2xl mb-1">🚫</p>
            <p className="text-sm font-semibold">Día bloqueado</p>
            <p className="text-xs mt-0.5">Marcaste este día como libre / vacaciones.</p>
          </div>
        )}

        {timeline?.tipo === "laboral" && (
          <div>
            <p className="text-xs text-barber-gray mb-3">
              Jornada{" "}
              <span className="font-semibold text-barber-ink">{hora12(timeline.inicio)}</span>
              {" "}–{" "}
              <span className="font-semibold text-barber-ink">{hora12(timeline.fin)}</span>
              {timeline.segmentos.length > 0 && (
                <>
                  {" · "}
                  <span className="text-green-700 font-semibold">
                    {timeline.segmentos.filter(s => s.tipo === "libre" && s.duracion >= 25).length} espacios libres
                  </span>
                  {" · "}
                  <span className="font-semibold">
                    {timeline.segmentos.filter(s => s.tipo === "cita").length} cita{timeline.segmentos.filter(s => s.tipo === "cita").length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </p>

            {timeline.segmentos.length === 0 && (
              <div className="card p-5 text-center text-barber-gray">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-sm font-semibold">Día libre — sin citas</p>
                <p className="text-xs mt-0.5">Todo el horario disponible para nuevas citas.</p>
              </div>
            )}

            <div className="space-y-1.5">
              {timeline.segmentos.map((seg, i) => (
                <SegmentoTimeline
                  key={i}
                  seg={seg}
                  abierta={abierta}
                  onToggle={(id) => setAbierta((prev) => (prev === id ? null : id))}
                  onAccion={accion}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SegmentoTimeline({ seg, abierta, onToggle, onAccion }) {
  if (seg.tipo === "libre") {
    const suficiente = seg.duracion >= 25;
    return (
      <div className={`flex items-stretch gap-3 px-3 py-2 rounded-lg border ${suficiente ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
        <div className={`w-1 rounded-full shrink-0 ${suficiente ? "bg-green-400" : "bg-gray-300"}`} />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-barber-gray">{hora12(seg.inicio)} – {hora12(seg.fin)}</span>
          <span className={`text-sm font-semibold ${suficiente ? "text-green-700" : "text-barber-gray"}`}>
            {suficiente ? "Libre" : "Pausa"} · {formatDur(seg.duracion)}
          </span>
        </div>
      </div>
    );
  }

  if (seg.tipo === "bloqueo") {
    const f = seg.franja || {};
    return (
      <div className="flex items-stretch gap-3 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100">
        <div className="w-1 rounded-full shrink-0 bg-gray-400" />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-barber-gray">{hora12(seg.inicio)} – {hora12(seg.fin)}</span>
          <span className="text-sm font-semibold text-barber-gray">
            🚫 Bloqueado{f.motivo ? ` · ${f.motivo}` : ""}
          </span>
        </div>
      </div>
    );
  }

  const c = seg.cita;
  const estilo = CITA_ESTILO[c.estado] || { wrap: "border-gray-200 bg-gray-50", barra: "bg-gray-400" };
  const celular = (c.clienteCelular || "").replace(/\D/g, "");
  const esSolicitada = c.estado === "solicitada";

  // La cita tiene acciones ocultas (bajo el desplegable) cuando NO es solicitada
  // pero sí hay algo que hacer: completar (confirmada) o contactar por WhatsApp.
  const tieneAccionesOcultas =
    !esSolicitada && (c.estado === "confirmada" || !!celular);
  const expandida = abierta === c.id;
  // Las solicitadas muestran sus acciones siempre; el resto, al expandir.
  const mostrarAcciones = esSolicitada || expandida;

  const cabecera = (
    <>
      <div className={`w-1 rounded-full shrink-0 ${estilo.barra}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-barber-gray">{hora12(seg.inicio)} – {hora12(seg.fin)}</span>
          <span className="font-bold text-sm">{c.clienteNombre}</span>
        </div>
        <p className="text-xs text-barber-gray mt-0.5">
          {c.planSnapshot?.nombre} · {formatDur(seg.duracion)}
        </p>
      </div>
      <div className="shrink-0 self-center flex items-center gap-1.5">
        <EstadoBadge estado={c.estado} />
        {tieneAccionesOcultas && (
          <span className={`text-barber-gray transition-transform ${expandida ? "rotate-180" : ""}`}>⌄</span>
        )}
      </div>
    </>
  );

  return (
    <div className={`rounded-lg border ${estilo.wrap} ${esSolicitada ? "ring-1 ring-amber-300" : ""}`}>
      {tieneAccionesOcultas ? (
        <button
          type="button"
          onClick={() => onToggle(c.id)}
          className="w-full flex items-stretch gap-3 px-3 py-2.5 text-left"
        >
          {cabecera}
        </button>
      ) : (
        <div className="w-full flex items-stretch gap-3 px-3 py-2.5">
          {cabecera}
        </div>
      )}

      {mostrarAcciones && (
        <div className="flex flex-wrap gap-2 px-3 pb-3 pt-0">
          {esSolicitada && (
            <>
              <button className="btn-blue text-sm py-1.5" onClick={() => onAccion(c.id, "confirmar")}>Aceptar</button>
              <button className="btn-outline text-sm py-1.5" onClick={() => onAccion(c.id, "rechazar")}>Rechazar</button>
            </>
          )}
          {c.estado === "confirmada" && (
            <button className="btn-dark text-sm py-1.5" onClick={() => onAccion(c.id, "completar")}>Marcar completada</button>
          )}
          {celular && (
            <a
              className="btn-wa text-sm py-1.5"
              href={`https://wa.me/${celular}`}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon className="w-4 h-4" /> WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function buildTimeline(fecha, perfil, citasDia) {
  const horario = perfil.horario || {};
  const diasLaborales = horario.diasLaborales || [1, 2, 3, 4, 5, 6];
  const dia = diaSemanaDeFecha(fecha);

  if (!diasLaborales.includes(dia)) return { tipo: "noLaboral" };
  if ((perfil.diasBloqueados || []).includes(fecha)) return { tipo: "bloqueado" };

  const inicioMin = hhmmAMin(horario.horaInicio || "10:00");
  const finMin = hhmmAMin(horario.horaFin || "19:00");

  // Ocupaciones del día: citas + franjas de horas bloqueadas, ordenadas por hora.
  const ocupaciones = [];
  for (const cita of citasDia) {
    ocupaciones.push({ tipo: "cita", cita, ini: hhmmAMin(cita.horaInicio), fin: hhmmAMin(cita.horaFin) });
  }
  for (const f of perfil.franjasBloqueadas || []) {
    if (f.fecha === fecha) {
      ocupaciones.push({ tipo: "bloqueo", franja: f, ini: hhmmAMin(f.horaInicio), fin: hhmmAMin(f.horaFin) });
    }
  }
  ocupaciones.sort((a, b) => a.ini - b.ini);

  const segmentos = [];
  let cursor = inicioMin;

  for (const oc of ocupaciones) {
    if (oc.ini > cursor) {
      segmentos.push({ tipo: "libre", inicio: minAHhmm(cursor), fin: minAHhmm(oc.ini), duracion: oc.ini - cursor });
    }
    if (oc.tipo === "cita") {
      segmentos.push({ tipo: "cita", cita: oc.cita, inicio: minAHhmm(oc.ini), fin: minAHhmm(oc.fin), duracion: oc.fin - oc.ini });
    } else {
      segmentos.push({ tipo: "bloqueo", franja: oc.franja, inicio: minAHhmm(oc.ini), fin: minAHhmm(oc.fin), duracion: oc.fin - oc.ini });
    }
    cursor = Math.max(cursor, oc.fin);
  }

  if (cursor < finMin) {
    segmentos.push({ tipo: "libre", inicio: minAHhmm(cursor), fin: minAHhmm(finMin), duracion: finMin - cursor });
  }

  return { tipo: "laboral", inicio: minAHhmm(inicioMin), fin: minAHhmm(finMin), segmentos };
}

function hora12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "a.m." : "p.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDur(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatDiaDetalle(fecha) {
  if (!fecha) return "";
  const [y, mo, d] = fecha.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function mover(fecha, vista, dir) {
  const d = new Date(fecha);
  if (vista === "mes") d.setMonth(d.getMonth() + dir);
  else d.setDate(d.getDate() + dir * 7);
  return d;
}
function diasDelMes(ref) {
  const y = ref.getFullYear(), m = ref.getMonth();
  const primero = new Date(y, m, 1);
  const offset = primero.getDay();
  const totalDias = new Date(y, m + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= totalDias; d++) celdas.push(new Date(y, m, d));
  return celdas;
}
function diasDeLaSemana(ref) {
  const d = new Date(ref);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}
