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
        throw new Error("Clave pública VAPID no disponible en el servidor");
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
        throw new Error(data.error || "Error al registrar la suscripción");
      }

      setEstado("activo");
    } catch (e) {
      console.error("Error al activar recordatorios:", e);
      alert(`No se pudieron activar los recordatorios: ${e.message}`);
      setEstado((p) => (p === "activo" ? p : "inactivo"));
    } finally {
      setOcupado(false);
    }
  }, [celular]);

  async function desactivar() {
    setOcupado(true);
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
    <div className="card p-4 flex items-start gap-3">
      <span className="text-2xl leading-none" aria-hidden>🔔</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">Recordatorio de tu cita</h3>

        {estado === "ios-necesita-instalar" && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mt-1">
            📱 <strong>En iPhone:</strong> Para recibir recordatorios push, agrega la app a tu pantalla de inicio
            (tocá <strong>Compartir ⬆️</strong> → <strong>“Agregar a inicio”</strong>).
          </p>
        )}

        {estado === "denegado" && (
          <p className="text-xs text-barber-gray mt-0.5">
            Están bloqueadas. Habilitalas desde los ajustes de tu navegador para este sitio.
          </p>
        )}

        {estado === "inactivo" && (
          <p className="text-xs text-barber-gray mt-0.5">
            Te avisamos el día de tu cita apenas abra la barbería, y cuando el barbero confirme tu cita.
          </p>
        )}

        {estado === "activo" && (
          <p className="text-xs text-green-700 font-medium mt-0.5">
            Recordatorios activados en este dispositivo ✓
          </p>
        )}
      </div>

      {estado === "inactivo" && (
        <button
          onClick={activar}
          disabled={ocupado}
          className="btn-primary text-sm py-1.5 px-4 shrink-0 shadow-sm"
        >
          {ocupado ? "Activando…" : "Activar"}
        </button>
      )}

      {estado === "activo" && (
        <button
          onClick={desactivar}
          disabled={ocupado}
          className="btn-outline text-xs py-1.5 px-3 shrink-0 text-barber-gray hover:text-red-600"
        >
          {ocupado ? "…" : "Desactivar"}
        </button>
      )}
    </div>
  );
}
