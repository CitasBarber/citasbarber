"use client";

import { useEffect, useState } from "react";
import EstadoBadge from "@/components/EstadoBadge";
import { WhatsAppIcon } from "@/components/Icons";
import { formatoCOP, METODOS_PAGO_LABEL } from "@/lib/constants";
import { fechaLocalHoy } from "@/lib/disponibilidad";
import { esMovil } from "@/lib/dispositivo";

export default function CitasLista({ onCambio }) {
  const [fecha, setFecha] = useState(fechaLocalHoy());
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [comprobante, setComprobante] = useState(null); // {url}

  function cargar() {
    setCargando(true);
    fetch(`/api/citas?fecha=${fecha}`)
      .then((r) => r.json())
      .then((d) => setCitas(d.citas || []))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [fecha]);

  async function accion(id, accion, extra = {}) {
    if (accion === "rechazar") {
      const motivo = prompt("Motivo del rechazo (opcional):") || "";
      extra.motivo = motivo;
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
    onCambio?.();
  }

  async function verComprobante(id) {
    const res = await fetch(`/api/citas/${id}`);
    const d = await res.json();
    if (d.cita?.comprobante) setComprobante(d.cita.comprobante);
    else alert("Esta cita no tiene comprobante.");
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input type="date" className="input max-w-[180px]" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button className="btn-outline text-sm py-1.5" onClick={() => setFecha(fechaLocalHoy())}>Hoy</button>
      </div>

      {cargando ? (
        <p className="text-barber-gray">Cargando…</p>
      ) : citas.length === 0 ? (
        <div className="card p-8 text-center text-barber-gray">No hay citas para este día.</div>
      ) : (
        <div className="space-y-3">
          {citas.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-display text-lg">{c.horaInicio} - {c.horaFin} · {c.clienteNombre}</p>
                  <p className="text-sm text-barber-gray">
                    {c.planSnapshot?.nombre} · {formatoCOP(c.planSnapshot?.precio)}
                    {c.metodoPago ? ` · ${METODOS_PAGO_LABEL[c.metodoPago] || c.metodoPago}` : ""}
                    {c.esManual ? " · Manual" : ""}
                  </p>
                </div>
                <EstadoBadge estado={c.estado} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {c.estado === "solicitada" && (
                  <>
                    <button className="btn-blue text-sm py-1.5" onClick={() => accion(c.id, "confirmar")}>Aceptar</button>
                    <button className="btn-outline text-sm py-1.5" onClick={() => accion(c.id, "rechazar")}>Rechazar</button>
                  </>
                )}
                {c.estado === "confirmada" && (
                  <button className="btn-dark text-sm py-1.5" onClick={() => accion(c.id, "completar")}>Marcar completada</button>
                )}
                {["solicitada", "confirmada"].includes(c.estado) && (
                  <button className="btn-outline text-sm py-1.5" onClick={() => accion(c.id, "cancelar")}>Cancelar</button>
                )}
                {c.pagoAnticipo?.requerido && c.pagoAnticipo?.comprobante && (
                  <button className="btn-outline text-sm py-1.5" onClick={() => verComprobante(c.id)}>Ver comprobante</button>
                )}
                {c.clienteCelular && (
                  <a className="btn-wa text-sm py-1.5" href={`https://wa.me/${c.clienteCelular.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {comprobante && (
        <div className="fixed inset-0 bg-black/70 grid place-items-center p-4 z-50" onClick={() => setComprobante(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={comprobante} alt="Comprobante" className="max-h-[85vh] rounded-lg" />
        </div>
      )}
    </div>
  );
}
