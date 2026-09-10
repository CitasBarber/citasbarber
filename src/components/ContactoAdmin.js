"use client";

import { useState } from "react";

const MENSAJE_DEFAULT = "Quiero esta app para mí o para mi barbería.";

export default function ContactoAdmin() {
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [local, setLocal] = useState("");
  const [mensaje, setMensaje] = useState(MENSAJE_DEFAULT);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

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
    <section id="contacto" className="bg-barber-cream border-t border-black/5">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <h2 className="font-display text-3xl">¿Tienes una barbería?</h2>
          <p className="text-barber-gray mt-2">
            Habla con el administrador para tener esta app en tu barbería o para
            unirte a 770. Déjanos tus datos y te contactamos por WhatsApp.
          </p>
        </div>

        {enviado ? (
          <div className="card p-8 mt-6 text-center space-y-2">
            <div className="text-4xl">✅</div>
            <h3 className="font-display text-2xl">¡Solicitud enviada!</h3>
            <p className="text-barber-gray">
              El administrador la verá en su panel y te contactará pronto. ¡Gracias!
            </p>
          </div>
        ) : (
          <form onSubmit={enviar} className="card p-6 mt-6 space-y-4">
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
              <label className="label">Nombre de tu barbería (opcional)</label>
              <input
                className="input"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ej: Barbería El Bigote"
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
    </section>
  );
}
