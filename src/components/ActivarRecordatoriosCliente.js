"use client";

import { useCallback, useEffect, useState } from "react";
import { obtenerVapidPublicKey, urlBase64ToUint8Array } from "@/lib/vapidClient";

function esAppInstalada() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function esDispositivoIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Opt-in del cliente para recibir el recordatorio de su cita el mismo día, a la
// hora en que abre el barbero. Requiere que el cliente ya tenga su celular
// identificado (se pasa por prop).
export default function ActivarRecordatoriosCliente({ celular }) {
  const [estado, setEstado] = useState("cargando"); // cargando|no-soportado|ios-necesita-instalar|activo|inactivo|denegado
  const [ocupado, setOcupado] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (esDispositivoIOS() && !esAppInstalada()) {
      setEstado("ios-necesita-instalar");
      return;
    }

    const tieneSW = "serviceWorker" in navigator;
    const tienePush = "PushManager" in window;
    const tieneNotif = "Notification" in window;

    if (!tieneSW || !tienePush || !tieneNotif) {
      setEstado("no-soportado");
      return;
    }

    if (Notification.permission === "denied") {
      setEstado("denegado");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {})
      .finally(() => {
        navigator.serviceWorker.ready
          .then((reg) => reg.pushManager.getSubscription())
          .then((sub) => setEstado(sub ? "activo" : "inactivo"))
          .catch(() => setEstado("inactivo"));
      });
  }, []);

  const activar = useCallback(async () => {
    const cel = (celular || "").replace(/\D/g, "");
    if (cel.length < 10) return;
    setOcupado(true);
    setErrorMsg("");
    try {
      let permiso = Notification.permission;
      if (permiso === "default") {
        permiso = await Notification.requestPermission();
      }
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "denegado" : "inactivo");
        return;
      }

      const vapidKey = await obtenerVapidPublicKey();
      if (!vapidKey) {
        throw new Error("No se pudo conectar con el servicio de notificaciones.");
      }

      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const res = await fetch("/api/push/cliente/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          celular,
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo registrar la suscripción");
      }

      setEstado("activo");
    } catch (e) {
      console.error("Error al activar recordatorios:", e);
      setErrorMsg(e.message || "No se pudieron activar los recordatorios");
      setEstado((p) => (p === "activo" ? p : "inactivo"));
    } finally {
      setOcupado(false);
    }
  }, [celular]);

  async function desactivar() {
    setOcupado(true);
    setErrorMsg("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/cliente/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setEstado("inactivo");
    } catch {
      // si falla, dejamos el estado
    } finally {
      setOcupado(false);
    }
  }

  if (estado === "cargando" || estado === "no-soportado") return null;
  if ((celular || "").replace(/\D/g, "").length < 10) return null;

  return (
    <div className="card p-4 flex items-start gap-3 bg-white/80 backdrop-blur-sm border border-black/5 shadow-sm rounded-xl">
      <span className="text-2xl leading-none select-none" aria-hidden>🔔</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-barber-ink">Recordatorio de tu cita</h3>

        {estado === "ios-necesita-instalar" && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg p-2 mt-1">
            📱 <strong>En iPhone:</strong> Para recibir recordatorios, agrega la web a tu pantalla de inicio
            (tocá <strong>Compartir ⬆️</strong> → <strong>“Agregar a inicio”</strong>).
          </p>
        )}

        {estado === "denegado" && (
          <p className="text-xs text-barber-gray mt-0.5">
            Las notificaciones están bloqueadas en tu navegador. Puedes habilitarlas desde los ajustes del sitio.
          </p>
        )}

        {estado === "inactivo" && (
          <p className="text-xs text-barber-gray mt-0.5 leading-relaxed">
            Te avisamos el día de tu cita apenas abra la barbería, y cuando el barbero confirme o modifique tu turno.
          </p>
        )}

        {estado === "activo" && (
          <p className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <span>✓</span> Recordatorios activados en este dispositivo
          </p>
        )}

        {errorMsg && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-1.5 mt-1.5">
            {errorMsg}
          </p>
        )}
      </div>

      {estado === "inactivo" && (
        <button
          onClick={activar}
          disabled={ocupado}
          className="btn-primary text-xs py-2 px-3.5 shrink-0 rounded-lg shadow-sm font-semibold"
        >
          {ocupado ? "Activando…" : "Activar"}
        </button>
      )}

      {estado === "activo" && (
        <button
          onClick={desactivar}
          disabled={ocupado}
          className="btn-outline text-xs py-1.5 px-3 shrink-0 rounded-lg text-barber-gray hover:text-red-600"
        >
          {ocupado ? "…" : "Desactivar"}
        </button>
      )}
    </div>
  );
}
