import { NextResponse } from "next/server";

export function ok(data = {}, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Envuelve un handler para capturar errores (incluye los de requireRole con .status)
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      const status = e.status || 500;
      if (status === 500) console.error(e);
      return fail(e.message || "Error interno", status);
    }
  };
}
