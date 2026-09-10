"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const DISMISS_KEY = "pwa-install-dismissed";

// Ícono del botón "Compartir" de iOS, para las instrucciones en iPhone.
function IconoCompartir() {
  return (
    <svg viewBox="0 0 24 24" className="inline w-3.5 h-3.5 -mt-0.5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
    </svg>
  );
}

// Solo mostramos el banner en la web pública (home y flujo de agendar), no en
// los paneles de barbero/admin ni en "mis-citas".
function esRutaPublica(pathname) {
  return pathname === "/" || pathname.startsWith("/agendar");
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [mostrar, setMostrar] = useState(false);
  const [modo, setModo] = useState(null); // "android" | "ios"
  const deferred = useRef(null);

  useEffect(() => {
    // Registrar el service worker (habilita la instalación). Se hace siempre,
    // independientemente de si mostramos el banner.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Ya la cerró antes → no volver a mostrar.
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Ya está instalada (abierta como app) → no mostrar.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent;
    const esIOS = /iphone|ipad|ipod/i.test(ua);

    if (esIOS) {
      // iOS no permite instalación automática: mostramos instrucciones.
      setModo("ios");
      setMostrar(true);
      return;
    }

    // Android/Chrome: capturamos el evento del sistema para instalar en un toque.
    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferred.current = e;
      setModo("android");
      setMostrar(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Si se instala, ocultamos el banner.
    const onInstalled = () => cerrar();
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cerrar() {
    setMostrar(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  async function instalar() {
    const prompt = deferred.current;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    deferred.current = null;
    cerrar();
  }

  if (!mostrar || !esRutaPublica(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-2xl bg-barber-black text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="770 Barbería" className="w-11 h-11 rounded-xl shrink-0" />

        <div className="flex-1 min-w-0">
          {modo === "ios" ? (
            <>
              <p className="font-semibold text-sm leading-tight">Instalá 770 Barbería</p>
              <p className="text-white/70 text-xs mt-0.5 leading-snug">
                Tocá Compartir <IconoCompartir /> y luego{" "}
                <span className="font-semibold">“Agregar a inicio”</span>.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-sm leading-tight">Instalá la app de 770 Barbería</p>
              <p className="text-white/70 text-xs mt-0.5 leading-snug">
                Agregala a tu celular y agendá más rápido, como una app.
              </p>
            </>
          )}
        </div>

        {modo === "android" && (
          <button onClick={instalar} className="btn-primary text-sm py-1.5 px-4 shrink-0">
            Instalar
          </button>
        )}

        <button
          onClick={cerrar}
          aria-label="Cerrar"
          className="shrink-0 text-white/50 hover:text-white text-xl leading-none px-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
