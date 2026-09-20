import { NextResponse } from "next/server";

// Rate limiting para frenar fuerza bruta de contraseñas, spam de registros y
// enumeración de clientes por celular.
//
// Implementación en memoria (ventana deslizante por IP). Es suficiente para un
// despliegue pequeño; en cada instancia serverless mantiene su propio contador.
// Para un límite global fiable en producción a escala, sustituir el store por
// Upstash Redis (@upstash/ratelimit) usando su REST API (compatible con edge).

const LIMITES = [
  { patron: /^\/api\/auth\/login/, max: 8, ventanaMs: 60_000 },
  { patron: /^\/api\/auth\/registro-barbero/, max: 5, ventanaMs: 60_000 },
  { patron: /^\/api\/clientes\/identificar/, max: 15, ventanaMs: 60_000 },
  { patron: /^\/api\/solicitudes/, max: 5, ventanaMs: 60_000 },
  { patron: /^\/api\/citas\/consulta/, max: 30, ventanaMs: 60_000 },
  { patron: /^\/api\/push\/cliente\/subscribe/, max: 10, ventanaMs: 60_000 },
];

// Map<clave, number[]>  -> timestamps de las peticiones recientes
const golpes = new Map();

function obtenerIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "desconocida";
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const regla = LIMITES.find((l) => l.patron.test(pathname));
  if (!regla) return NextResponse.next();

  const ip = obtenerIp(req);
  const clave = `${ip}:${pathname}`;
  const ahora = Date.now();
  const desde = ahora - regla.ventanaMs;

  const previos = (golpes.get(clave) || []).filter((t) => t > desde);
  previos.push(ahora);
  golpes.set(clave, previos);

  // Limpieza oportunista para no crecer sin límite.
  if (golpes.size > 5000) {
    for (const [k, v] of golpes) {
      if (v.every((t) => t <= desde)) golpes.delete(k);
    }
  }

  if (previos.length > regla.max) {
    const retrySec = Math.ceil(regla.ventanaMs / 1000);
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en unos momentos." },
      { status: 429, headers: { "Retry-After": String(retrySec) } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/login",
    "/api/auth/registro-barbero",
    "/api/clientes/identificar",
    "/api/solicitudes",
    "/api/citas/consulta",
    "/api/push/cliente/subscribe",
  ],
};
