import { MARCA_DEFAULT, manifestDeMarca } from "@/lib/brands";

// Manifest de la PWA. Next lo sirve en /manifest.webmanifest y añade el
// <link rel="manifest"> automáticamente, con la marca por defecto. Al cambiar
// de marca, BrandProvider apunta ese <link> a /api/manifest?marca=... para que
// la app instalada lleve el nombre e ícono de la marca activa.
export default function manifest() {
  return manifestDeMarca(MARCA_DEFAULT);
}
