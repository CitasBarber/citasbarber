# Guía de seguridad del despliegue — CitasBarber

Este documento resume el endurecimiento aplicado en el código y los pasos que
debes completar **manualmente en las consolas** de MongoDB Atlas, Vercel y GitHub.

## Ya aplicado en el código

- El **seed no corre en producción** (evita cuentas de ejemplo con contraseñas
  conocidas). El admin se crea con `scripts/crear-admin.mjs`.
- **`JWT_SECRET` obligatorio en producción** (sin fallback débil). Sesión de 2 días.
- **Rate limiting** en login, registro e identificación de clientes (`src/middleware.js`).
- **Cabeceras de seguridad** (anti-clickjacking, HSTS, nosniff…) en `next.config.mjs`.
- **Validación del comprobante** de pago en el servidor (tipo y tamaño real).
- **CI + Dependabot** en `.github/`.

---

## 1. MongoDB Atlas (hazlo en la consola)

1. **Network Access:** elimina la regla `0.0.0.0/0` (acceso desde cualquier IP).
   - Ideal: usa **PrivateLink** o la lista de IPs de salida de Vercel.
   - Si no es viable, deja solo las IPs estrictamente necesarias.
2. **Usuario de base de datos con permisos mínimos:** rol `readWrite` únicamente
   sobre la base `citasbarber`. No uses `atlasAdmin` para la app.
3. **Usa una base distinta para Producción y para Preview** (ver Vercel abajo).
4. Activa **alertas** (accesos inusuales, picos de conexiones) y **backups**.
5. Rota la contraseña del usuario de BD y actualízala en Vercel.

## 2. Vercel (hazlo en Project Settings)

1. **Environment Variables por entorno** (Production y Preview separados):
   - `JWT_SECRET` (genera uno fuerte y **distinto** por entorno).
   - `MONGODB_URI` (base de producción vs base de preview).
   - `NEXT_PUBLIC_BASE_URL`, `JWT_EXPIRES_IN`.
   - **No** definas `ADMIN_PASSWORD` en producción; crea el admin con el script.
2. **Protege los Preview Deployments**: Settings → Deployment Protection →
   Vercel Authentication, para que las URLs de preview no sean públicas.
3. Activa el **Firewall / Attack Challenge Mode** si tu plan lo permite.
4. Revisa que en **Logs** no queden secretos (ya se quitó el log de credenciales).
5. Tras rotar `JWT_SECRET`, todas las sesiones activas se invalidan (esperado).

### Crear el admin en producción (una sola vez)

```bash
MONGODB_URI="mongodb+srv://..." \
ADMIN_EMAIL="tu@correo.com" \
ADMIN_PASSWORD="una-contraseña-larga-y-fuerte" \
node scripts/crear-admin.mjs
```

## 3. GitHub (hazlo en Settings del repositorio)

1. **Secret scanning + Push protection**: Settings → Code security → activar ambos.
2. **Dependabot**: activar *alerts* y *security updates* (el `.github/dependabot.yml`
   ya programa las PRs de actualización).
3. **Branch protection** en `main`: exigir Pull Request, revisiones y que el
   check de **CI** (`.github/workflows/ci.yml`) pase antes de fusionar.
4. Verifica que ningún `.env` real esté versionado (solo `.env.example`).

---

## Estado de dependencias (npm audit)

- **Producción está en `next@14.2.35`** (último parche de la línea 14.2).
- Quedan advisories de Next que **solo se corrigen en Next 16** (la línea 14.2 ya
  no las recibe). Son en su mayoría DoS/SSRF/cache. Las dos **críticas** (RCE):
  - RCE en el optimizador de imágenes (AVIF): **mitigada** desactivando el
    optimizador (`images.unoptimized`), ya que la app no usa `next/image`.
  - RCE en servidores self-hosted en **Windows**: **no aplica** en Vercel (Linux
    gestionado); solo relevante para `next dev` local en Windows.
- **Acción de seguimiento (importante):** planificar y probar el salto a **Next 16**
  para cerrar el resto de advisories. Es un cambio mayor: hacerlo en una rama,
  correr el CI y probar los flujos (login, agendar, panel) antes de fusionar.

## Mejoras futuras recomendadas

- Actualizar a **Next 16** (ver arriba) — es la vía definitiva para las advisories.
- Mover los comprobantes a almacenamiento de objetos (Vercel Blob / Cloudinary)
  y guardar solo la URL, en vez de base64 en la BD.
- Rate limiting global con **Upstash Redis** (el actual es por instancia).
- Content-Security-Policy (empezar en modo `Report-Only`).
