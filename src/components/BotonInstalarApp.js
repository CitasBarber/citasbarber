"use client";

import { useEffect, useRef, useState } from "react";

// Ícono "Compartir" de iOS, para las instrucciones en iPhone.
function IconoCompartir() {
  return (
    <svg viewBox="0 0 24 24" className="inline w-4 h-4 -mt-0.5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
    </svg>
  );
}

function IconoDescarga() {
  return (
    <svg viewBox="0 0 24 24" className="inline w-4 h-4 -mt-0.5 mr-1 align-middle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

// Botón "Descargar app" que instala la PWA. En Android/escritorio con soporte,
// dispara la instalación en un toque; en iPhone (y navegadores sin soporte)
// abre un modal con las instrucciones para agregarla a la pantalla de inicio.
export default function BotonInstalarApp({ className = "hover:text-white" }) {
  const [instalada, setInstalada] = useState(false);
  const [modal, setModal] = useState(null); // null | "ios" | "manual"
  const deferred = useRef(null);

  useEffect(() => {
    // ¿Ya está instalada / abierta como app? Entonces ocultamos el botón.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) {
      setInstalada(true);
      return;
    }

    // Android/Chrome/Edge: capturamos el evento para instalar en un toque.
    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferred.current = e;
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => setInstalada(true);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function instalar() {
    const prompt = deferred.current;

    // Si el navegador nos dio el evento nativo, instalamos en un toque.
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      deferred.current = null;
      if (outcome === "accepted") setInstalada(true);
      return;
    }

    // Sin evento nativo: iPhone o navegador que no soporta instalación directa.
    const esIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setModal(esIOS ? "ios" : "manual");
  }

  if (instalada) return null;

  return (
    <>
      <button type="button" onClick={instalar} className={className}>
        <IconoDescarga />
        Descargar app
      </button>

      {modal && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50" onClick={() => setModal(null)}>
          <div className="card w-full max-w-md p-6 space-y-4 relative text-barber-ink" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setModal(null)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full text-barber-gray hover:bg-black/5"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="770 Barbería" className="w-12 h-12 rounded-xl shrink-0" />
              <h2 className="font-display text-2xl">Instalá 770 Barbería</h2>
            </div>

            {modal === "ios" ? (
              <ol className="text-sm text-barber-gray space-y-2 list-decimal pl-5">
                <li>Tocá el botón <b>Compartir</b> <IconoCompartir /> en la barra de Safari.</li>
                <li>Elegí <b>“Agregar a inicio”</b> (Add to Home Screen).</li>
                <li>Confirmá con <b>Agregar</b>. ¡Listo, ya la tenés como app!</li>
              </ol>
            ) : (
              <div className="text-sm text-barber-gray space-y-2">
                <p>Abrí el menú de tu navegador (⋮) y elegí:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><b>“Instalar aplicación”</b> o <b>“Agregar a la pantalla de inicio”</b>.</li>
                </ul>
                <p>Así la tendrás como una app en tu celular.</p>
              </div>
            )}

            <button type="button" className="btn-primary w-full" onClick={() => setModal(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
