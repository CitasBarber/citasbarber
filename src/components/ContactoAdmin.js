"use client";

import { useState } from "react";
import { useBrand } from "./BrandProvider";
import { capitalizar } from "@/lib/brands";

const mensajeDefault = (t) => `Quiero esta app para mí o para mi ${t.negocio}.`;

export default function ContactoAdmin({ className = "hover:text-white", label }) {
  const { marca, t } = useBrand();
  label ??= `¿Tienes ${t.negocio}?`;
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [local, setLocal] = useState("");
  const [mensaje, setMensaje] = useState(() => mensajeDefault(t));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  function cerrar() {
    setAbierto(false);
    // Reiniciar el formulario para la próxima vez que se abra.
    setError("");
    setEnviado(false);
    setNombre("");
    setCelular("");
    setLocal("");
    setMensaje(mensajeDefault(t));
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, celular, local, mensaje }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo enviar. Intenta de nuevo.");
      setEnviado(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={className}>
        {label}
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50"
          onClick={cerrar}
        >
          <div
            className="card w-full max-w-lg p-6 space-y-4 relative text-tinta"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full text-pizarra hover:bg-black/5"
            >
              ✕
            </button>

            {enviado ? (
              <div className="text-center space-y-2 py-4">
                <div className="text-4xl">✅</div>
                <h3 className="font-display text-2xl">¡Solicitud enviada!</h3>
                <p className="text-pizarra">
                  El administrador la verá en su panel y te contactará pronto. ¡Gracias!
                </p>
                <button type="button" className="btn-primary w-full mt-2" onClick={cerrar}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={enviar} className="space-y-4">
                <div className="text-center">
                  <h2 className="font-display text-2xl">¿Tienes {t.negocio === "spa" ? "un" : "una"} {t.negocio}?</h2>
                  <p className="text-pizarra text-sm mt-1">
                    Habla con el administrador para tener esta app en tu {t.negocio} o para
                    unirte a {marca.nombre}. Te contactamos por WhatsApp.
                  </p>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tu nombre</label>
                    <input
                      className="input"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Carlos Mesa"
                      maxLength={80}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">WhatsApp</label>
                    <input
                      className="input"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      placeholder="Ej: 3001234567"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Nombre de tu {t.negocio} (opcional)</label>
                  <input
                    className="input"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder={`Ej: ${capitalizar(t.negocio)} La Esquina`}
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="label">Mensaje</label>
                  <textarea
                    className="input min-h-[90px] resize-y"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    maxLength={1000}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={enviando || !nombre.trim() || celular.replace(/\D/g, "").length < 10 || !mensaje.trim()}
                >
                  {enviando ? "Enviando…" : "Enviar al administrador"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
