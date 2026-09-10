"use client";

import { useState } from "react";
import { PLANES_DEFAULT, METODOS_PAGO_LABEL } from "@/lib/constants";

const METODOS = ["nequi", "daviplata", "qr", "cuenta", "efectivo"];

export default function EditorPlanes({ barbero, onClose, onGuardado }) {
  const inicial = (barbero.planes && barbero.planes.length > 0 ? barbero.planes : PLANES_DEFAULT).map(
    (p) => ({ ...p, servicios: Array.isArray(p.servicios) ? p.servicios.join(", ") : p.servicios })
  );
  const [planes, setPlanes] = useState(inicial);
  const [datosPago, setDatosPago] = useState(barbero.datosPago || {});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function setPlan(i, campo, valor) {
    setPlanes((prev) => prev.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));
  }
  function toggleMetodo(i, m) {
    setPlanes((prev) =>
      prev.map((p, idx) => {
        if (idx !== i) return p;
        const set = new Set(p.metodosPago || []);
        set.has(m) ? set.delete(m) : set.add(m);
        return { ...p, metodosPago: [...set] };
      })
    );
  }

  async function guardar() {
    setGuardando(true); setError("");
    const res = await fetch(`/api/admin/barberos/${barbero.id}/planes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planes, datosPago }),
    });
    setGuardando(false);
    if (res.ok) onGuardado?.();
    else { const d = await res.json(); setError(d.error || "Error"); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50 overflow-y-auto">
      <div className="card p-6 w-full max-w-3xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-2xl">Planes de {barbero.local}</h2>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <div className="space-y-5">
          {planes.map((p, i) => (
            <div key={p.key} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg capitalize">{p.nombre || p.key}</h3>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={p.activo !== false} onChange={(e) => setPlan(i, "activo", e.target.checked)} />
                  Activo
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="label">Nombre</label><input className="input" value={p.nombre || ""} onChange={(e) => setPlan(i, "nombre", e.target.value)} /></div>
                <div><label className="label">Precio (COP)</label><input type="number" className="input" value={p.precio} onChange={(e) => setPlan(i, "precio", e.target.value)} /></div>
                <div><label className="label">Duración (min)</label><input type="number" className="input" value={p.duracion} onChange={(e) => setPlan(i, "duracion", e.target.value)} /></div>
                <div><label className="label">Anticipo (%)</label><input type="number" className="input" value={p.anticipo} onChange={(e) => setPlan(i, "anticipo", e.target.value)} /></div>
                <div className="sm:col-span-2"><label className="label">Servicios (separados por coma)</label><input className="input" value={p.servicios} onChange={(e) => setPlan(i, "servicios", e.target.value)} /></div>
              </div>
              <div className="mt-3">
                <label className="label">Métodos de pago</label>
                <div className="flex flex-wrap gap-2">
                  {METODOS.map((m) => (
                    <button key={m} type="button" onClick={() => toggleMetodo(i, m)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${(p.metodosPago || []).includes(m) ? "bg-barber-red text-white border-barber-red" : "border-gray-300"}`}>
                      {METODOS_PAGO_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="border rounded-xl p-4">
            <h3 className="font-display text-lg mb-3">Datos de pago del barbero</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label">Nequi</label><input className="input" value={datosPago.nequi || ""} onChange={(e) => setDatosPago({ ...datosPago, nequi: e.target.value })} /></div>
              <div><label className="label">Daviplata</label><input className="input" value={datosPago.daviplata || ""} onChange={(e) => setDatosPago({ ...datosPago, daviplata: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">Cuenta bancaria</label><input className="input" value={datosPago.cuenta || ""} onChange={(e) => setDatosPago({ ...datosPago, cuenta: e.target.value })} /></div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3 justify-end">
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : "Guardar planes"}</button>
        </div>
      </div>
    </div>
  );
}
