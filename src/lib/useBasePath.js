"use client";

import { usePathname } from "next/navigation";

// Devuelve el prefijo de ruta de la submarca activa, por ejemplo "/page/citasbarber".
// Si el usuario está en una ruta sin prefijo (la app original), devuelve "".
const RE_SLUG = /^(\/page\/(?:citasbarber|citaspet|citasspa))/;

export function useBasePath() {
  const pathname = usePathname() ?? "";
  const match = pathname.match(RE_SLUG);
  return match ? match[1] : "";
}
