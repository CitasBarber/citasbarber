"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerVapidPublicKey, urlBase64ToUint8Array } from "@/lib/vapidClient";

const AUTO_KEY = "push-auto-intentado";

// ¿La web está abierta como app instalada (PWA en pantalla completa)?
function esAppInstalada() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// ¿Es un dispositivo iOS (iPhone / iPad)?
function esDispositivoIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function ActivarNotificaciones({ descripcion }) {
  const [estado, setEstado] = useState("cargando"); // cargando | no-soportado | ios-necesita-instalar | activo | inactivo | denegado
  const [ocupado, setOcupado] = useState(false);
  const [mensajePrueba, setMensajePrueba] = useState("");
  const [probando, setProbando] = useState(false);
  const autoHecho = useRef(false);

  // Inicializar y chequear soporte
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tieneSW = "serviceWorker" in navigator;
    const tienePush = "PushManager" in window;
    const tieneNotif = "Notification" in window;

    // Si es iOS y no está instalada como PWA, Apple no expone PushManager en Safari
    if (esDispositivoIOS() && !esAppInstalada()) {
      setEstado("ios-necesita-instalar");
      return;
    }

    if (!tieneSW || !tienePush || !tieneNotif) {
      setEstado("no-soportado");
      return;
    }

    if (Notification.permission === "denied") {
      setEstado("denegado");
      return;
    }

    // Registrar service worker si no está registrado
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {})
      .finally(() => {
        navigator.serviceWorker.ready
          .then((reg) => reg.pushManager.getSubscription())
          .then((sub) => {
            setEstado(sub ? "activo" : "inactivo");
          })
          .catch(() => setEstado("inactivo"));
      });
  }, []);

  // Registra la suscripción en el servidor
  const suscribir = useCallback(
    async ({ pedirPermiso = true, silencioso = false } = {}) => {
      setOcupado(true);
      setMensajePrueba("");
      try {
        let permiso = Notification.permission;
        if (permiso === "default" && pedirPermiso) {
          permiso = await Notification.requestPermission();
        }
        if (permiso !== "granted") {
          setEstado(permiso === "denied" ? "denegado" : "inactivo");
          return false;
        }

        // Obtener la clave pública VAPID (desde env o API del servidor)
        const vapidPublicKey = await obtenerVapidPublicKey();
        if (!vapidPublicKey) {
          throw new Error("No se pudo obtener la clave pública VAPID del servidor.");
        }

        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.register("/sw.js").catch(() => {});
        }
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
        }

        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            userAgent: navigator.userAgent,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "No se pudo registrar la suscripción en el servidor");
        }

        setEstado("activo");
        return true;
      } catch (e) {
        console.error("Error al activar notificaciones:", e);
        if (!silencioso) {
          alert(`No se pudieron activar las notificaciones: ${e.message}`);
        }
        setEstado((prev) => (prev === "activo" ? prev : "inactivo"));
        return false;
      } finally {
        setOcupado(false);
      }
    },
    []
  );

  // Auto-activación al abrir como app instalada (solo si ya tenía permiso concedido)
  useEffect(() => {
    if (estado !== "inactivo" || autoHecho.current) return;
    if (!esAppInstalada()) return;
    autoHecho.current = true;

    if (Notification.permission === "granted") {
      suscribir({ pedirPermiso: false, silencioso: true });
    }
  }, [estado, suscribir]);

  async function desactivar() {
    setOcupado(true);
    setMensajePrueba("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
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

  async function enviarPrueba() {
    setProbando(true);
    setMensajePrueba("");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (res.ok && data?.data?.ok) {
        setMensajePrueba("✅ ¡Notificación enviada! Revisa si sonó o vibró tu celular.");
      } else {
        setMensajePrueba(`❌ Error: ${data.error || "No se pudo enviar la prueba"}`);
      }
    } catch (err) {
      setMensajePrueba(`❌ Error de conexión: ${err.message}`);
    } finally {
      setProbando(false);
    }
  }

  if (estado === "cargando") return null;

  const texto =
    descripcion ||
    "Recibí un aviso en este dispositivo cuando llegue algo nuevo, aunque tengas la app cerrada.";

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none" aria-hidden>🔔</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Notificaciones Push</h3>

          {estado === "ios-necesita-instalar" && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mt-1">
              📱 <strong>En iPhone:</strong> Para recibir notificaciones, agrega esta app a tu pantalla de inicio
              (tocá <strong>Compartir ⬆️</strong> → <strong>“Agregar a inicio”</strong>) y luego ábrela desde el ícono.
            </p>
          )}

          {estado === "no-soportado" && (
            <p className="text-xs text-barber-gray mt-0.5">
              Este navegador no admite notificaciones push.
            </p>
          )}

          {estado === "denegado" && (
            <p className="text-xs text-red-600 mt-0.5">
              Están bloqueadas por el navegador. Habilitalas desde los ajustes de tu sitio web / permisos del teléfono.
            </p>
          )}

          {estado === "inactivo" && (
            <p className="text-xs text-barber-gray mt-0.5">{texto}</p>
          )}

          {estado === "activo" && (
            <div>
              <p className="text-xs text-green-700 font-medium mt-0.5">
                Activadas en este dispositivo ✓
              </p>
              {mensajePrueba && (
                <p className="text-xs mt-1.5 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-1.5">
                  {mensajePrueba}
                </p>
              )}
            </div>
          )}
        </div>

        {estado === "inactivo" && (
          <button
            onClick={() => suscribir({ pedirPermiso: true })}
            disabled={ocupado}
            className="btn-primary text-sm py-1.5 px-4 shrink-0 shadow-sm"
          >
            {ocupado ? "Activando…" : "Activar"}
          </button>
        )}

        {estado === "activo" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={enviarPrueba}
              disabled={probando || ocupado}
              className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
              title="Envía una notificación push de prueba ahora mismo"
            >
              {probando ? "Enviando…" : "🔔 Probar"}
            </button>
            <button
              onClick={desactivar}
              disabled={ocupado || probando}
              className="btn-outline text-xs py-1.5 px-2.5 text-barber-gray hover:text-red-600"
            >
              {ocupado ? "…" : "Desactivar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
