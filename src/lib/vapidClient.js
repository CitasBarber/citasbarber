let cachedKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim();

// Convierte la clave pública VAPID (base64url) al Uint8Array requerido por pushManager.subscribe
export function urlBase64ToUint8Array(base64String) {
  if (!base64String) throw new Error("Clave pública VAPID vacía o no configurada");
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Obtiene la clave pública VAPID desde NEXT_PUBLIC_ si está disponible, o
// mediante fetch a /api/push/vapid-public-key como fallback dinámico.
export async function obtenerVapidPublicKey() {
  if (cachedKey) return cachedKey;
  try {
    const res = await fetch("/api/push/vapid-public-key");
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.publicKey) {
        cachedKey = json.data.publicKey.trim();
        return cachedKey;
      }
    }
  } catch (err) {
    console.error("Error al obtener clave pública VAPID:", err);
  }
  return "";
}
