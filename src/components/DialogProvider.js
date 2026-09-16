"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";

const DialogContext = createContext(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog debe usarse dentro de <DialogProvider>");
  return ctx;
}

// Reemplaza los window.confirm / window.prompt nativos por un modal propio,
// consistente con el estilo de la app. Expone dos ayudas basadas en promesas:
//   confirmar(opts)   -> Promise<boolean>
//   pedirMotivo(opts) -> Promise<string|null>  (null = el usuario canceló)
export default function DialogProvider({ children }) {
  const [estado, setEstado] = useState(null);
  const [motivo, setMotivo] = useState("");
  const resolver = useRef(null);

  const abrir = useCallback((opts) => {
    setMotivo("");
    setEstado(opts);
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const cerrar = useCallback((resultado) => {
    setEstado(null);
    resolver.current?.(resultado);
    resolver.current = null;
  }, []);

  const confirmar = useCallback(
    (opts) => abrir({ ...opts, conMotivo: false }).then((r) => r !== null),
    [abrir]
  );
  const pedirMotivo = useCallback(
    (opts) => abrir({ ...opts, conMotivo: true }),
    [abrir]
  );

  useEffect(() => {
    if (!estado) return;
    const onKey = (e) => { if (e.key === "Escape") cerrar(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [estado, cerrar]);

  return (
    <DialogContext.Provider value={{ confirmar, pedirMotivo }}>
      {children}
      {estado && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-[2px]"
          onClick={() => cerrar(null)}
        >
          <div
            className="card w-full max-w-sm p-6"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl leading-tight">{estado.titulo}</h2>
            {estado.mensaje && (
              <p className="text-sm text-barber-gray mt-2 leading-snug">{estado.mensaje}</p>
            )}

            {estado.conMotivo && (
              <textarea
                className="input mt-3 min-h-[84px] resize-none"
                placeholder={estado.placeholder || "Motivo (opcional)"}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={200}
                autoFocus
              />
            )}

            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                className="btn-outline text-sm py-2"
                onClick={() => cerrar(null)}
              >
                {estado.cancelarLabel || "Cancelar"}
              </button>
              <button
                type="button"
                className={`text-sm py-2 ${estado.peligro ? "btn-primary" : "btn-dark"}`}
                onClick={() => cerrar(estado.conMotivo ? motivo.trim() : "")}
                autoFocus={!estado.conMotivo}
              >
                {estado.confirmarLabel || "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
