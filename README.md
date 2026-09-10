# 💈 CitasBarber

Plataforma SaaS de gestión de citas para barberías (mercado colombiano). Stack **100 % gratuito**: Next.js 14 + MongoDB + WhatsApp (sin pasarelas de pago ni servicios externos de notificación).

## Características

- **Cliente**: agenda con solo *nombre + celular* (sin contraseña). Elige barbero, plan y horario en tiempo real. Consulta y cancela sus citas solo con el celular.
- **Barbero**: panel con vista **Lista** y **Calendario**, acepta/rechaza citas, agenda **citas manuales** para clientes presenciales, configura horario laboral y días bloqueados, y ve un **resumen diario** de cortes e ingresos.
- **Administrador**: aprueba/rechaza barberos, activa/desactiva cuentas y configura los **planes (Bronce/Plata/Oro)** con precios, duración y métodos de pago colombianos (Nequi, Daviplata, QR, cuenta) de forma individual por barbero.
- **Pagos**: el anticipo (Plata/Oro) se paga por transferencia colombiana; el cliente sube el comprobante y lo envía al **WhatsApp** del barbero (`wa.me`).
- **Notificaciones**: confirmación y rechazo por WhatsApp con mensaje pre-llenado.

## Duración de planes

| Plan   | Duración slot | Anticipo | Métodos de pago |
|--------|---------------|----------|-----------------|
| Bronce | 25 min        | No       | Nequi, Daviplata, QR, cuenta, efectivo |
| Plata  | 55 min        | 50 %     | Solo transferencia |
| Oro    | 55 min        | 50 %     | Solo transferencia |

*(Incluyen 5 min de buffer entre citas.)*

## Requisitos

- Node.js 20+ (probado con Node 24)

## Cómo ejecutar (desarrollo)

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

> **No necesitas instalar MongoDB.** Si `MONGODB_URI` está vacío, la app arranca
> automáticamente un MongoDB en memoria y **carga datos de ejemplo** (seed).

### Cuentas de prueba (seed automático)

| Rol     | URL             | Usuario                    | Clave        |
|---------|-----------------|----------------------------|--------------|
| Admin   | `/admin/login`  | `admin@citasbarber.com`    | `admin123`   |
| Barbero | `/barbero/login`| `brahian@citasbarber.com`  | `barbero123` |
| Barbero | `/barbero/login`| `andres@citasbarber.com`   | `barbero123` |
| Barbero | `/barbero/login`| `santiago@citasbarber.com` | `barbero123` |
| Cliente | `/mis-citas`    | celular `3201234567`       | —            |

Hay además un barbero **pendiente** (`Urban Cuts`, Cali) para probar la aprobación desde el panel de admin.

## Producción (Vercel + MongoDB Atlas)

1. Crea un cluster gratuito en MongoDB Atlas y copia la cadena de conexión.
2. En Vercel define las variables de entorno (ver `.env.example`): `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_BASE_URL`.
3. Al primer arranque con una base vacía, se ejecuta el seed automático (crea el admin).

## Estructura

```
src/
  app/
    page.js                 # Landing + lista de barberos
    agendar/[barberId]/     # Asistente de agendamiento (cliente)
    mis-citas/              # Consulta por celular (cliente)
    barbero/{login,registro,panel}/
    admin/{login,panel}/
    api/                    # API Routes (auth, barberos, citas, admin…)
  components/               # UI, íconos, paneles de barbero y admin
  lib/                      # db, auth, disponibilidad, whatsapp, constantes, seed
  models/                   # Usuario, Barbero, Cliente, Cita (Mongoose)
```

## Stack

Next.js 14 · React 18 · Tailwind CSS · MongoDB/Mongoose · JWT · mongodb-memory-server (dev).
