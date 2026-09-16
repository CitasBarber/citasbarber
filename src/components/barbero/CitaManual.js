"use client";

import { useEffect, useRef, useState } from "react";
import { fechaLocalHoy, esFechaPasada } from "@/lib/disponibilidad";
import { esMovil } from "@/lib/dispositivo";

export default function CitaManual({ planes, onCreada, prefill }) {
  const activos = (planes || []).filter((p) => p.activo);
  const [clienteNombre, setNombre] = useState("");
  const [clienteCelular, setCelular] = useState("");
  const [planKey, setPlanKey] = useState(activos[0]?.key || "");
  const [fecha, setFecha] = useState(prefill?.fecha || fechaLocalHoy());
  const [slots, setSlots] = useState([]);
  const [hora, setHora] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [enviando, setEnviando] = useState(false);
  const btnCrearRef = useRef(null);
  // Hora que llega preseleccionada desde el Calendario. Se aplica en cuanto
  // cargan los slots del día/plan, y solo si sigue disponible para ese plan.
  const horaDeseada = useRef(prefill?.hora || "");

  // Al elegir una hora, acercar el botón "Crear cita" para evitar scroll.
  function seleccionarHora(s) {
    setHora(s);
    requestAnimationFrame(() =>
      btnCrearRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    );
  }

  useEffect(() => {
    if (!planKey || !fecha) return;
    setHora("");
    // Reutilizamos disponibilidad: necesitamos el id del barbero -> perfil
    fetch("/api/barbero/perfil")
      .then((r) => r.json())
      .then((d) => d.barbero?.id)
      .then((id) =>
        fetch(`/api/barberos/${id}/disponibilidad?fecha=${fecha}&plan=${planKey}`)
          .then((r) => r.json())
          .then((x) => {
            const lista = x.slots || [];
            setSlots(lista);
            // Aplicar la hora que vino del Calendario (una sola vez).
            const h = horaDeseada.current;
            if (h) {
              horaDeseada.current = "";
              if (lista.includes(h)) {
                seleccionarHora(h);
                setError("");
              } else {
                setError(`La hora ${h} no alcanza para este plan; elegí otra de la lista.`);
              }
            }
          })
      );
  }, [planKey, fecha]);

  async function crear(e) {
    e.preventDefault();
    setError(""); setMsg(""); setEnviando(true);
    try {
      const res = await fetch("/api/citas/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteNombre, clienteCelular, plan: planKey, fecha, horaInicio: hora, plano: !esMovil() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error");
      // Si se registró celular, abrimos WhatsApp con la confirmación para el
      // cliente (así ambos quedan con el contacto guardado).
      if (d.linkWhatsApp) window.open(d.linkWhatsApp, "_blank");
      setMsg(
        d.linkWhatsApp
          ? "Cita creada y confirmada. Abrimos WhatsApp para enviarle la confirmación al cliente."
          : "Cita manual creada y confirmada."
      );
      setNombre(""); setCelular(""); setHora("");
      onCreada?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (activos.length === 0)
    return <p className="text-barber-gray">Aún no tienes planes configurados por el administrador.</p>;

  return (
    <form onSubmit={crear} className="card p-6 max-w-lg space-y-3">
      <h2 className="font-display text-xl">Agendar cliente presencial</h2>
      <p className="text-sm text-barber-gray">Para clientes sin celular o que llegan al local. La cita queda confirmada.</p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {msg && <p className="text-green-700 text-sm">{msg}</p>}

      <div>
        <label className="label">Nombre del cliente</label>
        <input className="input" value={clienteNombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div>
        <label className="label">Celular (opcional)</label>
        <input className="input" value={clienteCelular} onChange={(e) => setCelular(e.target.value)} placeholder="Opcional" />
      </div>
      <div>
        <label className="label">Plan</label>
        <select className="input" value={planKey} onChange={(e) => setPlanKey(e.target.value)}>
          {activos.map((p) => <option key={p.key} value={p.key}>{p.nombre} ({p.duracion} min)</option>)}
        </select>
      </div>
      <div>
        <label className="label">Fecha</label>
        <input type="date" className="input" min={fechaLocalHoy()} value={fecha} onChange={(e) => {
          const v = e.target.value;
          if (esFechaPasada(v)) { setError("No puedes agendar en una fecha que ya pasó."); return; }
          setError(""); setFecha(v);
        }} />
      </div>
      <div>
        <label className="label">Hora</label>
        {slots.length === 0 ? (
          <p className="text-sm text-barber-gray">No hay horarios libres ese día.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((s) => (
              <button type="button" key={s} onClick={() => seleccionarHora(s)}
                className={`rounded-lg border min-h-[44px] py-2 text-sm font-semibold transition active:scale-95 ${hora === s ? "bg-barber-blue text-white border-barber-blue" : "border-gray-300 hover:border-barber-blue"}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <button ref={btnCrearRef} className="btn-primary w-full" disabled={enviando || !hora}>{enviando ? "Creando…" : "Crear cita"}</button>
    </form>
  );
}
