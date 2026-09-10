"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import EstadoBadge from "@/components/EstadoBadge";
import { WhatsAppIcon } from "@/components/Icons";
import { formatoCOP } from "@/lib/constants";

export default function MisCitasPage() {
  const [celular, setCelular] = useState("");
  const [citas, setCitas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function consultar(e) {
    e?.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`/api/citas/consulta?celular=${encodeURIComponent(celular)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error");
      setCitas(d.citas);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  async function cancelar(id) {
    if (!confirm("¿Seguro que deseas cancelar esta cita?")) return;
    const res = await fetch(`/api/citas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "cancelar", celular }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);
    consultar();
  }

  return (
    <div className="min-h-screen">
      <Header>
        <Link href="/" className="hover:text-barber-red">Inicio</Link>
      </Header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl">Mis citas</h1>
        <p className="text-barber-gray">Pon tu celu y mirá cómo van tus citas.</p>

        <form onSubmit={consultar} className="card p-5 mt-4 flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-end">
          <div className="flex-1">
            <label className="label">Celular</label>
            <input className="input" value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="3001234567" inputMode="numeric" />
          </div>
          <button className="btn-primary w-full sm:w-auto" disabled={cargando || celular.replace(/\D/g, "").length < 10}>
            {cargando ? "…" : "Consultar"}
          </button>
        </form>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {citas && citas.length === 0 && (
          <p className="mt-6 text-barber-gray">No encontramos citas con ese número.</p>
        )}

        <div className="mt-6 space-y-3">
          {citas?.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-lg">{c.barberoLocal}</h3>
                  <p className="text-sm text-barber-gray">{c.barberoNombre}</p>
                </div>
                <EstadoBadge estado={c.estado} />
              </div>
              <div className="mt-2 text-sm space-y-0.5">
                <p><b>Plan:</b> {c.planSnapshot?.nombre} · {formatoCOP(c.planSnapshot?.precio)}</p>
                <p><b>Fecha:</b> {c.fecha} · <b>Hora:</b> {c.horaInicio} - {c.horaFin}</p>
                {c.motivoRechazo && <p className="text-red-600"><b>Motivo:</b> {c.motivoRechazo}</p>}
              </div>
              <div className="mt-3 flex gap-2">
                {["solicitada", "confirmada"].includes(c.estado) && (
                  <button className="btn-outline text-sm py-1.5" onClick={() => cancelar(c.id)}>Cancelar</button>
                )}
                {c.barberoCelular && (
                  <a className="btn-wa text-sm py-1.5" href={`https://wa.me/${c.barberoCelular.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <WhatsAppIcon className="w-4 h-4" /> Contactar
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
