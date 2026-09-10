// Emojis centralizados y seguros para todo el proyecto.
//
// Se generan con String.fromCodePoint para que el archivo fuente quede en ASCII
// puro y los caracteres se construyan en runtime. Así NUNCA se corrompen por
// problemas de encoding (p. ej. al re-guardar el archivo en Windows con una
// página de códigos distinta de UTF-8).
//
// Regla: no escribir emojis literales en el código. Si necesitas uno nuevo,
// agrégalo aquí con su codepoint.

export const EMOJI = {
  NAVAJA:     String.fromCodePoint(0x1F488),         // poste de barbería
  TIJERAS:    String.fromCodePoint(0x2702, 0xFE0F),  // tijeras
  UBICACION:  String.fromCodePoint(0x1F4CD),         // pin de ubicación
  RELOJ:      String.fromCodePoint(0x1F550),         // reloj
  CELULAR:    String.fromCodePoint(0x1F4F2),         // celular con flecha
  BILLETE:    String.fromCodePoint(0x1F4B5),         // billete
  DINERO:     String.fromCodePoint(0x1F4B0),         // bolsa de dinero
  CALENDARIO: String.fromCodePoint(0x1F4C5),         // calendario
  PERSONA:    String.fromCodePoint(0x1F464),         // silueta de persona
  MASAJE:     String.fromCodePoint(0x1F486),         // masaje facial
  BRILLO:     String.fromCodePoint(0x2728),          // destellos
  CERVEZA:    String.fromCodePoint(0x1F37B),         // jarras de cerveza
  CHOCOLATE:  String.fromCodePoint(0x1F36B),         // chocolate
};
