// Detección simple de dispositivo móvil. Solo tiene sentido en el navegador.
// Se usa para decidir el formato de los mensajes de WhatsApp: con emojis en
// móvil (se ven bien) y en texto plano en PC (WhatsApp Desktop en Windows
// corrompe los emojis a "�").
export function esMovil() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}
