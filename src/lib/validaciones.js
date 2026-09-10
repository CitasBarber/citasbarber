// Validaciones de seguridad reutilizables en las rutas de API.

// Tipos de imagen permitidos para comprobantes de pago.
const MIME_COMPROBANTE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Límite del tamaño real de la imagen (bytes decodificados), no del string base64.
const MAX_COMPROBANTE_BYTES = 4 * 1024 * 1024; // 4 MB

/**
 * Valida un comprobante enviado como data URL base64.
 * Devuelve { ok: true, valor } con el data URL saneado, o { ok: false, error }.
 * Un comprobante vacío/ausente es válido (no requerido a este nivel).
 */
export function validarComprobante(comprobante) {
  if (!comprobante) return { ok: true, valor: "" };

  if (typeof comprobante !== "string")
    return { ok: false, error: "Comprobante inválido" };

  // Formato esperado: data:image/xxx;base64,AAAA...
  const match = /^data:([\w/+.-]+);base64,([A-Za-z0-9+/=]+)$/.exec(comprobante);
  if (!match)
    return { ok: false, error: "El comprobante debe ser una imagen válida" };

  const [, mime, datos] = match;
  if (!MIME_COMPROBANTE.includes(mime.toLowerCase()))
    return { ok: false, error: "Formato de imagen no permitido (usa JPG, PNG, WEBP o GIF)" };

  // Tamaño real aproximado a partir de la longitud base64.
  const padding = (datos.match(/=+$/) || [""])[0].length;
  const bytes = Math.floor((datos.length * 3) / 4) - padding;
  if (bytes > MAX_COMPROBANTE_BYTES)
    return { ok: false, error: "El comprobante no debe superar 4 MB" };

  return { ok: true, valor: comprobante };
}
