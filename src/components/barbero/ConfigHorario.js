"use client";

import { useState } from "react";
import { DIAS_SEMANA } from "@/lib/constants";
import { fechaLocalHoy } from "@/lib/disponibilidad";

export default function ConfigHorario({ perfil, onGuardado }) {
  const [horaInicio, setHoraInicio] = useState(perfil.horario?.horaInicio || "10:00");
  const [horaFin, setHoraFin] = useState(perfil.horario?.horaFin || "19:00");
  const [dias, setDias] = useState(perfil.horario?.diasLaborales || [1, 2, 3, 4, 5, 6]);
  const [ventana, setVentana] = useState(perfil.ventanaCancelacionHoras ?? 24);
  const [diasBloqueados, setDiasBloqueados] = useState(perfil.diasBloqueados || []);
  const [nuevoBloqueo, setNuevoBloqueo] = useState(fechaLocalHoy());
  const [datosPago, setDatosPago] = useState(perfil.datosPago || {});
  const [foto, setFoto] = useState(perfil.foto || "");
  const [redes, setRedes] = useState(perfil.redes || {});
  const [msg, setMsg] = useState("");
  const [guardando, setGuardando] = useState(false);

  function toggleDia(d) {
    setDias((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }
  function agregarBloqueo() {
    if (!diasBloqueados.includes(nuevoBloqueo)) setDiasBloqueados([...diasBloqueados, nuevoBloqueo].sort());
  }
  function quitarBloqueo(f) {
    setDiasBloqueados(diasBloqueados.filter((x) => x !== f));
  }
  function onQR(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDatosPago((d) => ({ ...d, qrImagen: reader.result }));
    reader.readAsDataURL(file);
  }
  function onFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setMsg("La foto no debe pasar de 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result);
    reader.readAsDataURL(file);
  }

  async function guardar() {
    setGuardando(true); setMsg("");
    const res = await fetch("/api/barbero/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        horario: { horaInicio, horaFin, diasLaborales: dias },
        ventanaCancelacionHoras: Number(ventana),
        diasBloqueados,
        datosPago,
        foto,
        redes,
      }),
    });
    setGuardando(false);
    if (res.ok) { setMsg("Cambios guardados ✔"); onGuardado?.(); }
    else setMsg("Error al guardar");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl">Tu foto y redes</h2>
        <div className="flex items-center gap-4">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt="Tu foto" className="w-20 h-20 rounded-full object-cover border border-black/10" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-barber-black text-white grid place-items-center font-display text-3xl">
              {perfil.nombre?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <label className="btn-outline text-sm py-1.5 cursor-pointer">
              Subir foto
              <input type="file" accept="image/*" onChange={onFoto} className="hidden" />
            </label>
            {foto && (
              <button type="button" onClick={() => setFoto("")} className="ml-2 text-sm text-red-600 font-semibold">Quitar</button>
            )}
            <p className="text-xs text-barber-gray mt-1">Esta es la foto que ven tus clientes.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">📸 Instagram</label>
            <input className="input" value={redes.instagram || ""} onChange={(e) => setRedes({ ...redes, instagram: e.target.value })} placeholder="@usuario o link" />
          </div>
          <div>
            <label className="label">📘 Facebook</label>
            <input className="input" value={redes.facebook || ""} onChange={(e) => setRedes({ ...redes, facebook: e.target.value })} placeholder="Link o usuario" />
          </div>
          <div>
            <label className="label">🎵 TikTok</label>
            <input className="input" value={redes.tiktok || ""} onChange={(e) => setRedes({ ...redes, tiktok: e.target.value })} placeholder="@usuario o link" />
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-display text-xl">Horario laboral</h2>

        {/* Resumen visual */}
        <div className="rounded-xl bg-barber-cream border border-black/10 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🕐</span>
          <div className="text-sm leading-snug">
            <p>
              Atendés de{" "}
              <span className="font-bold text-barber-blue">{hora12simple(horaInicio)}</span>
              {" "}a{" "}
              <span className="font-bold text-barber-blue">{hora12simple(horaFin)}</span>
              {" "}·{" "}
              <span className="font-semibold">{duracionJornada(horaInicio, horaFin)} horas al día</span>
            </p>
            <p className="text-barber-gray mt-0.5">
              {dias.length === 0
                ? "⚠️ Ningún día seleccionado"
                : `${dias.length} día${dias.length !== 1 ? "s" : ""} a la semana`}
            </p>
          </div>
        </div>

        {/* Hora apertura / cierre */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">🟢 Apertura</label>
            <input type="time" className="input" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
          </div>
          <div>
            <label className="label">🔴 Cierre</label>
            <input type="time" className="input" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
          </div>
        </div>

        {/* Días — grid fijo 7 columnas para que siempre quepan en una fila */}
        <div>
          <label className="label">Días que trabajás</label>
          <div className="grid grid-cols-7 gap-1.5">
            {DIAS_SEMANA.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDia(i)}
                className={`rounded-lg py-3 text-xs font-bold text-center border transition active:scale-95 ${
                  dias.includes(i)
                    ? "bg-barber-blue text-white border-barber-blue"
                    : "border-gray-200 text-barber-gray hover:border-barber-blue hover:text-barber-blue"
                }`}
              >
                {d.slice(0, 2)}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-2 text-xs text-barber-gray">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-barber-blue inline-block" /> Trabajás</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm border border-gray-300 inline-block" /> Descanso</span>
          </div>
        </div>

        {/* Cancelación — explicado en lenguaje claro */}
        <div>
          <label className="label">¿Hasta cuándo pueden cancelar los clientes?</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              className="input max-w-[90px] text-center font-bold text-lg"
              value={ventana}
              onChange={(e) => setVentana(e.target.value)}
              min={0}
            />
            <span className="text-sm text-barber-gray">horas antes de la cita</span>
          </div>
          {Number(ventana) === 0 ? (
            <p className="text-xs text-amber-600 mt-1.5">⚠️ Con 0 horas, los clientes pueden cancelar en cualquier momento, incluso el mismo día.</p>
          ) : (
            <p className="text-xs text-barber-gray mt-1.5">
              Ej: si tiene cita a las 3:00 p.m., puede cancelar hasta las{" "}
              <b>{cancelacionEjemplo(ventana)}</b>.
            </p>
          )}
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-display text-xl">Días libres / vacaciones</h2>
        <p className="text-sm text-barber-gray">Bloqueá fechas en las que no vas a atender. Los clientes no podrán agendar esos días.</p>
        <div className="flex gap-2">
          <input type="date" className="input" value={nuevoBloqueo} onChange={(e) => setNuevoBloqueo(e.target.value)} />
          <button type="button" className="btn-outline text-sm whitespace-nowrap" onClick={agregarBloqueo}>+ Bloquear</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {diasBloqueados.length === 0
            ? <span className="text-sm text-barber-gray">Ningún día bloqueado.</span>
            : diasBloqueados.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm font-medium">
                  📅 {formatFechaBloq(f)}
                  <button onClick={() => quitarBloqueo(f)} className="text-red-500 hover:text-red-700 font-bold leading-none" aria-label="Quitar">×</button>
                </span>
              ))
          }
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-display text-xl">Datos de pago (para tus clientes)</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Nequi</label><input className="input" value={datosPago.nequi || ""} onChange={(e) => setDatosPago({ ...datosPago, nequi: e.target.value })} placeholder="Número Nequi" /></div>
          <div><label className="label">Daviplata</label><input className="input" value={datosPago.daviplata || ""} onChange={(e) => setDatosPago({ ...datosPago, daviplata: e.target.value })} placeholder="Número Daviplata" /></div>
          <div className="sm:col-span-2"><label className="label">Cuenta bancaria</label><input className="input" value={datosPago.cuenta || ""} onChange={(e) => setDatosPago({ ...datosPago, cuenta: e.target.value })} placeholder="Banco y número de cuenta" /></div>
          <div className="sm:col-span-2">
            <label className="label">Código QR (imagen)</label>
            <input type="file" accept="image/*" onChange={onQR} className="text-sm" />
            {datosPago.qrImagen && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={datosPago.qrImagen} alt="QR" className="mt-2 w-32 h-32 object-contain border rounded" />
            )}
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : "Guardar cambios"}</button>
        {msg && <span className="text-sm font-semibold text-green-700">{msg}</span>}
      </div>
    </div>
  );
}

function hora12simple(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "a.m." : "p.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function duracionJornada(inicio, fin) {
  if (!inicio || !fin) return "?";
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  const diff = hf * 60 + mf - (hi * 60 + mi);
  if (diff <= 0) return "?";
  const horas = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins === 0 ? `${horas}` : `${horas}h ${mins}m`;
}

function cancelacionEjemplo(horas) {
  const h = Number(horas);
  if (!h) return "";
  // Usamos día 2 para que restar horas no pise el día 1 y se calcule bien
  const base = new Date(2000, 0, 2, 15, 0);
  base.setMinutes(base.getMinutes() - h * 60);
  const hora = base.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
  if (h >= 24) return `${hora} del día anterior`;
  if (h >= 12) return `${hora} (mismo día)`;
  return hora;
}

function formatFechaBloq(fechaISO) {
  if (!fechaISO) return fechaISO;
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
}
