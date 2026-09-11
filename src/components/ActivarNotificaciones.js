"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Convierte la clave pública VAPID (base64url) al Uint8Array que exige el
// navegador en pushManager.subscribe.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Botón para activar/desactivar las notificaciones push en este dispositivo.
// `descripcion` personaliza el texto según quién lo use (barbero/admin).
export default function ActivarNotificaciones({ descripcion }) {
  const [estado, setEstado] = useState("cargando"); // cargando | no-soportado | activo | inactivo | denegado
  const [ocupado, setOcupado] = useState(false);

  const soportado =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!VAPID_PUBLIC;

  useEffect(() => {
    if (!soportado) {
      setEstado("no-soportado");
      return;
    }
    if (Notification.permission === "denied") {
      setEstado("denegado");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstado(sub ? "activo" : "inactivo"))
      .catch(() => setEstado("inactivo"));
  }, [soportado]);

  async function activar() {
    setOcupado(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "denegado" : "inactivo");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), userAgent: navigator.userAgent }),
      });
      if (!res.ok) throw new Error("No se pudo registrar");
      setEstado("activo");
    } catch (e) {
      alert("No se pudieron activar las notificaciones. Intentá de nuevo.");
      setEstado("inactivo");
    } finally {
      setOcupado(false);
    }
  }

  async function desactivar() {
    setOcupado(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEstado("inactivo");
    } catch {
      // si falla, dejamos el estado como estaba
    } finally {
      setOcupado(false);
    }
  }

  if (estado === "cargando") return null;

  const texto =
    descripcion ||
    "Recibí un aviso en este dispositivo cuando llegue algo nuevo, aunque tengas la app cerrada.";

  return (
    <div className="card p-4 flex items-start gap-3">
      <span className="text-2xl leading-none" aria-hidden>🔔</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">Notificaciones</h3>
        {estado === "no-soportado" && (
          <p className="text-xs text-barber-gray mt-0.5">
            Este navegador no admite notificaciones. En iPhone, instalá primero la app
            (Compartir → “Agregar a inicio”) y abrila desde el ícono.
          </p>
        )}
        {estado === "denegado" && (
          <p className="text-xs text-barber-gray mt-0.5">
            Están bloqueadas. Habilitalas desde los ajustes del navegador para este sitio.
          </p>
        )}
        {estado === "inactivo" && (
          <p className="text-xs text-barber-gray mt-0.5">{texto}</p>
        )}
        {estado === "activo" && (
          <p className="text-xs text-green-700 mt-0.5">Activadas en este dispositivo ✓</p>
        )}
      </div>
      {estado === "inactivo" && (
        <button onClick={activar} disabled={ocupado} className="btn-primary text-sm py-1.5 px-4 shrink-0">
          {ocupado ? "Activando…" : "Activar"}
        </button>
      )}
      {estado === "activo" && (
        <button onClick={desactivar} disabled={ocupado} className="btn-outline text-sm py-1.5 px-4 shrink-0">
          {ocupado ? "…" : "Desactivar"}
        </button>
      )}
    </div>
  );
}
