"use client";

import { useEffect } from "react";
import { useBrand } from "./BrandProvider";

// Fuerza la marca al id recibido y la persiste en localStorage para que se
// mantenga durante la navegación dentro de esta sesión.
export default function MarcaForzada({ marcaId }) {
  const { setMarca } = useBrand();
  useEffect(() => {
    setMarca(marcaId, { persistir: true });
  }, [marcaId, setMarca]);
  return null;
}
