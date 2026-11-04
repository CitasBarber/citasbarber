"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  MARCA_DEFAULT,
  PARAM_URL,
  STORAGE_KEY,
  LISTA_MARCAS,
  esMarcaValida,
  obtenerMarca,
} from "@/lib/brands";

const BrandContext = createContext(null);

// Nombre de la página actual para el título de la pestaña ("CitasPet — Mis citas").
const PAGINAS = [
  ["/admin", "Administración"],
  ["/barbero/panel", "Mi panel"],
  ["/barbero", "Profesionales"],
  ["/agendar", "Agendá tu cita"],
  ["/mis-citas", "Mis citas"],
];

function nombrePagina(pathname) {
  const encontrada = PAGINAS.find(([prefijo]) => pathname?.startsWith(prefijo));
  return encontrada ? encontrada[1] : "";
}

function leerGuardada() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function guardar(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Navegación privada o almacenamiento bloqueado: la marca igual se aplica.
  }
}

// Marca inicial: ?marca= tiene prioridad, luego localStorage, luego la de por
// defecto. El script de <head> (layout.js) ya la aplicó en data-brand antes de
// pintar; aquí solo se sincroniza el estado de React con ella.
function marcaInicial() {
  if (typeof window === "undefined") return MARCA_DEFAULT;
  const param = new URLSearchParams(window.location.search).get(PARAM_URL);
  if (esMarcaValida(param)) {
    guardar(param);
    return param;
  }
  const guardada = leerGuardada();
  return esMarcaValida(guardada) ? guardada : MARCA_DEFAULT;
}

function aplicarEnDocumento(marca, pathname) {
  const html = document.documentElement;
  if (html.getAttribute("data-brand") !== marca.id) {
    // Transición de colores solo durante el cambio (ver globals.css)
    html.classList.add("cambiando-marca");
    html.setAttribute("data-brand", marca.id);
    window.setTimeout(() => html.classList.remove("cambiando-marca"), 250);
  }

  const pagina = nombrePagina(pathname);
  document.title = pagina ? `${marca.nombre} — ${pagina}` : marca.nombre;

  document.querySelectorAll('link[rel~="icon"]').forEach((link) => {
    link.setAttribute("href", marca.favicon);
    link.setAttribute("type", "image/svg+xml");
    link.removeAttribute("sizes");
  });

  document.querySelectorAll('link[rel="apple-touch-icon"]').forEach((link) => {
    link.setAttribute("href", marca.iconoApp);
  });
  document.querySelector('link[rel="manifest"]')?.setAttribute("href", `/api/manifest?marca=${marca.id}`);
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute("content", marca.nombre);

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", marca.colores.brand);
}

export default function BrandProvider({ children }) {
  const pathname = usePathname();
  // El servidor siempre renderiza con la marca por defecto; la real se lee al
  // montar. Hasta entonces no se toca el documento, para no pisar lo que ya
  // aplicó el script de <head>.
  const [id, setId] = useState(MARCA_DEFAULT);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setId(marcaInicial());
    setListo(true);
  }, []);

  const marca = obtenerMarca(id);

  useEffect(() => {
    if (listo) aplicarEnDocumento(marca, pathname);
  }, [listo, marca, pathname]);

  // persistir=false se usa cuando la marca viene del negocio (página de
  // agendar, panel del profesional): se muestra, pero no pisa la elección
  // guardada del selector.
  const setMarca = useCallback((nuevoId, { persistir = true } = {}) => {
    if (!esMarcaValida(nuevoId)) return;
    setId(nuevoId);
    if (persistir) guardar(nuevoId);
  }, []);

  const valor = useMemo(
    // listo=false mientras aún no se lee la marca guardada (primer render)
    () => ({ id: marca.id, marca, t: marca.textos, setMarca, marcas: LISTA_MARCAS, listo }),
    [marca, setMarca, listo]
  );

  return <BrandContext.Provider value={valor}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand debe usarse dentro de <BrandProvider>");
  return ctx;
}

// Aplica la marca de un negocio concreto (cuando ya se conoce) sin tocar la
// elección guardada del selector.
export function useMarcaDelNegocio(marcaId) {
  const { setMarca } = useBrand();
  useEffect(() => {
    if (marcaId) setMarca(marcaId, { persistir: false });
  }, [marcaId, setMarca]);
}
