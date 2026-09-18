"use client";

import { useState } from "react";
import { OjoAbierto, OjoCerrado } from "@/components/Icons";
import { DURACIONES_CORTE_OPCIONES } from "@/lib/constants";

export default function EditorInfoBarbero({ barbero, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre:           barbero.nombre           || "",
    local:            barbero.local            || "",
    celular:          barbero.celular          || "",
    ciudad:           barbero.ciudad           || "",
    direccion:        barbero.direccion        || "",
    email:            barbero.email            || "",
    duracionTurnoMin: barbero.horario?.duracionTurnoMin || barbero.planes?.[0]?.duracion || 30,
  });
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState("");
  const [msgInfo, setMsgInfo]         = useState("");

  const [passTemp, setPassTemp]       = useState("");
  const [asignando, setAsignando]     = useState(false);
  const [msgPass, setMsgPass]         = useState("");
  const [errPass, setErrPass]         = useState("");
  const [verPassTemp, setVerPassTemp] = useState(false);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.local.trim() || !form.celular.trim() || !form.ciudad.trim() || !form.email.trim()) {
      setError("Nombre, local, celular, ciudad y email son obligatorios.");
      return;
    }
    setGuardando(true); setError(""); setMsgInfo("");
    const res = await fetch(`/api/admin/barberos/${barbero.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setGuardando(false);
    if (res.ok) { setMsgInfo("Información actualizada."); onGuardado?.(); }
    else { const d = await res.json(); setError(d.error || "Error al guardar"); }
  }

  async function asignarPassword(e) {
    e.preventDefault();
    setErrPass(""); setMsgPass("");
    if (passTemp.trim().length < 6) { setErrPass("Mínimo 6 caracteres."); return; }
    setAsignando(true);
    const res = await fetch(`/api/admin/barberos/${barbero.id}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passTemp.trim() }),
    });
    setAsignando(false);
    if (res.ok) { setMsgPass("Contraseña temporal asignada. El barbero deberá cambiarla al ingresar."); setPassTemp(""); }
    else { const d = await res.json(); setErrPass(d.error || "Error al asignar"); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50 overflow-y-auto">
      <div className="card p-6 w-full max-w-lg my-8 space-y-6">

        {/* — Información básica — */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-display text-2xl">Editar información</h2>
            <button type="button" onClick={onClose} className="text-2xl leading-none text-barber-gray hover:text-barber-black">×</button>
          </div>

          {error   && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {msgInfo && <p className="text-green-700 text-sm mb-3 font-semibold">{msgInfo}</p>}

          <form onSubmit={guardar} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre del barbero</label>
                <input className="input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre completo" required />
              </div>
              <div>
                <label className="label">Nombre del local</label>
                <input className="input" value={form.local} onChange={(e) => set("local", e.target.value)} placeholder="Barbería XYZ" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Celular / WhatsApp</label>
                <input className="input" type="tel" value={form.celular} onChange={(e) => set("celular", e.target.value)} placeholder="3001234567" required />
                <p className="text-xs text-barber-gray mt-1">Número para comprobantes de clientes.</p>
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input className="input" value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Bogotá" required />
              </div>
            </div>

            <div>
              <label className="label">Dirección</label>
              <input className="input" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Cra. 7 # 32-45" />
            </div>

            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="barbero@email.com" required />
            </div>

            {/* Tiempo por corte / duración por turno */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">⏱️ Tiempo por corte (intervalo)</label>
                <span className="text-xs font-bold text-barber-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {form.duracionTurnoMin} min por turno
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-1.5">
                {DURACIONES_CORTE_OPCIONES.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => set("duracionTurnoMin", min)}
                    className={`rounded-lg py-1.5 text-xs font-bold border transition ${
                      Number(form.duracionTurnoMin) === min
                        ? "bg-barber-ink text-white border-barber-ink shadow-sm"
                        : "border-gray-200 text-barber-gray hover:border-barber-ink hover:text-barber-ink bg-white"
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-outline flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>

        {/* — Contraseña temporal — */}
        <div className="border-t border-black/10 pt-5">
          <h3 className="font-display text-lg mb-1">Contraseña temporal</h3>
          <p className="text-sm text-barber-gray mb-3">
            Asigna una contraseña provisional. Al ingresar, el barbero será obligado a cambiarla.
          </p>

          {errPass && <p className="text-red-600 text-sm mb-2">{errPass}</p>}
          {msgPass && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 mb-2">
              {msgPass}
            </div>
          )}

          <form onSubmit={asignarPassword} className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="input pr-10"
                type={verPassTemp ? "text" : "password"}
                value={passTemp}
                onChange={(e) => setPassTemp(e.target.value)}
                placeholder="Nueva contraseña temporal"
              />
              <button type="button" onClick={() => setVerPassTemp(!verPassTemp)} className="absolute inset-y-0 right-0 flex items-center px-3 text-barber-gray hover:text-barber-dark" tabIndex={-1} aria-label={verPassTemp ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {verPassTemp ? <OjoCerrado className="w-5 h-5" /> : <OjoAbierto className="w-5 h-5" />}
              </button>
            </div>
            <button type="submit" className="btn-dark text-sm whitespace-nowrap px-4" disabled={asignando}>
              {asignando ? "…" : "Asignar"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
