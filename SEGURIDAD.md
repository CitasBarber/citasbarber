# Guía de Seguridad y Endurecimiento — CitasBarber

Este documento detalla el modelo de seguridad implementado en el código fuente de la plataforma y los pasos que deben completarse **manualmente en las consolas** de MongoDB Atlas, Vercel, GitHub y proveedores de tareas programadas (Cron).

---

## 🛡️ Medidas de Seguridad Aplicadas en el Código

### 1. Autenticación y Control de Acceso
- **JWT en Cookies Seguras**: Las sesiones de Administrador y Barbero se gestionan con tokens JWT firmados criptográficamente y emitidos en cookies con directivas `httpOnly`, `SameSite=Lax` y `Secure` (en producción), con expiración estricta de 2 días.
- **`JWT_SECRET` Obligatorio**: La aplicación aborta inmediatamente el arranque en producción si falta la variable de entorno `JWT_SECRET`, impidiendo el uso de secretos por defecto o débiles.
- **Hash de Contraseñas**: Contraseñas de acceso hasheadas con `bcryptjs` (salt rounds estándar de la industria).
- **Contraseña Temporal**: Flujo obligatorio de cambio de clave en el primer inicio de sesión de un barbero (`/barbero/cambiar-password`).
- **Clientes sin Contraseñas**: Los clientes se identifican únicamente con Nombre y Celular, eliminando vectores de ataque de reutilización o filtración masiva de contraseñas de usuarios finales.

### 2. Notificaciones Web Push (VAPID RFC 8292)
- **Criptografía Asimétrica de Curva Elíptica**: Todas las notificaciones salientes se firman mediante el estándar VAPID con claves P-256.
- **Aislamiento de Claves**: La clave privada `VAPID_PRIVATE_KEY` reside exclusivamente en el entorno seguro del servidor; en el cliente solo se expone la clave pública `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- **Depuración Automática de Suscripciones**: El servidor detecta respuestas HTTP `404 Not Found` y `410 Gone` de los servicios push de los navegadores (Google, Mozilla, Apple) y elimina automáticamente los registros de la base de datos, evitando fugas de endpoints obsoletos y solicitudes innecesarias.
- **Tolerancia a Fallos**: Si las variables VAPID no están presentes, el sistema desactiva silenciosamente el envío de notificaciones sin bloquear la creación de citas ni las operaciones de la app.

### 3. Tareas Automatizadas y Endpoints Cron
- **Autorización por Token Bearer**: El endpoint `/api/cron/recordatorios` exige la cabecera `Authorization: Bearer <CRON_SECRET>`.
- **Falla Segura (Fail Closed)**: Si la variable `CRON_SECRET` no está configurada, el endpoint devuelve código `500`; si el token recibido no coincide exactamente, rechaza la petición con código `401 Unauthorized`.

### 4. Privacidad y Contact Picker API (Ley 1581 de 2012 - Habeas Data)
- **Consentimiento Explícito del Usuario**: La selección de clientes mediante la **Contact Picker API** (`navigator.contacts.select`) se ejecuta directamente en el navegador del barbero bajo la ventana de permisos nativa del sistema operativo móvil.
- **Minimización de Datos**: No se realiza lectura masiva ni almacenamiento de la libreta de contactos; solo se extrae el contacto individual que el barbero selecciona conscientemente para una cita manual.
- **Derecho de Consulta y Cancelación**: Los clientes pueden consultar sus citas activas e historial en el portal público con su celular y cancelar reservas respetando la ventana de anticipación fijada por el barbero.

### 5. Consistencia de Zona Horaria (Anti-Tampering)
- **Prevención de Horas Pasadas en Servidores UTC**: En arquitecturas serverless como Vercel (cuyos servidores corren en UTC), la hora del sistema difiere 5 horas de Colombia. La app normaliza todas las validaciones de fechas y horas contra la zona horaria oficial `America/Bogota` (UTC-5) mediante la API `Intl`.
- **Validación Estricta Server-Side**: La API rechaza cualquier intento de agendar citas o fijar bloqueos en fechas o franjas horarias que ya hayan transcurrido, independientemente de la manipulación que el cliente realice en el navegador.

### 6. Rate Limiting por IP
- Implementado en `src/middleware.js` mediante un algoritmo de ventana deslizante en memoria para mitigar ataques de fuerza bruta y DoS en endpoints sensibles:
  - `POST /api/auth/login` (mitigación de fuerza bruta en credenciales).
  - `POST /api/auth/registro-barbero`.
  - `POST /api/clientes/identificar`.
  - `POST /api/solicitudes` (prevención de spam en formulario de contacto).

### 7. Cabeceras de Seguridad HTTP
Configuradas en `next.config.mjs` para todas las rutas de la aplicación:
- `X-Frame-Options: DENY` (prevención de ataques de Clickjacking).
- `X-Content-Type-Options: nosniff` (prevención de ataques de confusión de tipos MIME).
- `Referrer-Policy: strict-origin-when-cross-origin` (control de fuga de URLs de origen).
- `Strict-Transport-Security` (HSTS: fuerza conexiones HTTPS con `max-age=63072000; includeSubDomains; preload`).
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restricción de APIs del dispositivo no utilizadas).

### 8. Sanitización de UI y Manejo de Diálogos
- Reemplazo integral de los métodos nativos del navegador `window.alert` y `window.confirm` por el contexto personalizado [DialogProvider.js](file:///c:/felipe/proyectos/citasbarber/src/components/DialogProvider.js), eliminando el riesgo de congelamiento de hilo de ejecución o abusos de contexto en navegadores móviles.

### 9. Control de Entornos y Semillas de Datos
- El **seed automático no corre en producción**: evita la existencia de cuentas de prueba con contraseñas conocidas.
- La creación del administrador en producción se efectúa exclusivamente mediante el script manual `scripts/crear-admin.mjs`.

---

## 🛠️ Configuración Manual en Consolas de Servicios

### 1. MongoDB Atlas (Consola Web)

1. **Network Access**:
   - Evita la regla `0.0.0.0/0` siempre que sea posible.
   - Si no cuentas con IP estática fija, utiliza la lista de IPs de salida de Vercel o la integración oficial de MongoDB Atlas para Vercel.
2. **Principio de Menor Privilegio**:
   - Crea un usuario de base de datos con rol `readWrite` restringido **exclusivamente a la base de datos `citasbarber`**.
   - No utilices usuarios con permisos de superadministrador (`atlasAdmin`).
3. **Separación de Ambientes**:
   - Utiliza bases de datos o clústeres distintos para **Producción** y para despliegues de **Preview/Staging**.
4. **Cifrado y Copias de Seguridad**:
   - Verifica que el cifrado en reposo esté activo y habilita respaldos automáticos continuos en Atlas.

### 2. Vercel (Project Settings)

1. **Variables de Entorno por Entorno (Production vs Preview)**:
   - Configura valores independientes y contraseñas robustas para cada ambiente.
   - `JWT_SECRET`: genera un secreto de al menos 48 bytes en base64url:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
     ```
   - `CRON_SECRET`: genera un token de al menos 32 bytes:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
     ```
   - `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`: genera el par de claves mediante:
     ```bash
     node -e "console.log(require('web-push').generateVAPIDKeys())"
     ```
2. **Protección de Despliegues Preview**:
   - En *Settings → Deployment Protection*, activa **Vercel Authentication** para evitar que las URLs de vista previa sean accesibles al público general.
3. **Firewall y Protección DDoS**:
   - Activa el *Attack Challenge Mode* o reglas de Web Application Firewall (WAF) si tu plan de Vercel lo incluye.

### 3. GitHub (Configuración del Repositorio)

1. **Secret Scanning & Push Protection**:
   - En *Settings → Code security and analysis*, mantén activos **Secret scanning** y **Push protection** para bloquear commits accidentales que contengan claves API o secretos.
2. **Dependabot**:
   - Asegura que *Dependabot alerts* y *Dependabot security updates* permanezcan habilitados para recibir parches automáticos de vulnerabilidades.
3. **Reglas de Protección de Ramas (Branch Protection)**:
   - Protege la rama `main`: exige Pull Request antes de fusionar y requerimiento de que el flujo de integración continua (`.github/workflows/ci.yml`) pase exitosamente.

### 4. Tareas Programadas (Cron)

- Si utilizas un servicio externo gratuito como [cron-job.org](https://cron-job.org) para disparar `/api/cron/recordatorios`:
  1. Asegúrate de configurar la URL con **HTTPS**.
  2. Añade la cabecera HTTP:
     ```
     Authorization: Bearer TU_CRON_SECRET_AQUI
     ```
  3. No compartas ni expongas la URL con el secreto en repositorios públicos.

---

## 🔍 Estado de Dependencias y Mitigaciones

- **Framework**: `next@14.2` (línea mantenida con parches de seguridad de Next 14).
- **Optimizador de Imágenes**: La app mantiene `images.unoptimized: true` en `next.config.mjs`, mitigando vectores de ataque conocidos relacionados con el procesamiento y descompresión de imágenes en el servidor.
- **Ruta de Actualización Futura**: Se recomienda evaluar el salto a **Next.js 15 / 16** en una rama de mantenimiento para incorporar las últimas actualizaciones de la plataforma una vez finalizada la fase de estabilización.
