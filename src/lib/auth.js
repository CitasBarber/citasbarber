import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// El secret NUNCA debe tener un fallback en producción: si faltara, cualquiera
// podría firmar tokens (incluido rol admin). En desarrollo se permite uno local.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "JWT_SECRET es obligatorio en producción. Configúralo en las variables de entorno."
  );
}
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-no-usar-en-produccion";
// Sesión más corta por defecto (2 días) para limitar el daño de un token robado.
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || "172800", 10);
export const COOKIE_NAME = "cb_token";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Establece la cookie de sesión (httpOnly)
export function setSessionCookie(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: JWT_EXPIRES_IN,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

// Devuelve la sesión actual { id, role, nombre } o null
export function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Helper para exigir un rol en un route handler. Lanza objeto con status si falla.
export function requireRole(role) {
  const session = getSession();
  if (!session) {
    const err = new Error("No autenticado");
    err.status = 401;
    throw err;
  }
  if (role && session.role !== role) {
    const err = new Error("No autorizado");
    err.status = 403;
    throw err;
  }
  return session;
}
