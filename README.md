# 💈 770 Barbería

Aplicación web de **agendamiento de citas para 770 Barbería** (Caldas, Antioquia — Colombia). Los clientes eligen barbero, plan y horario en línea, y el pago del anticipo y las notificaciones se manejan por **WhatsApp**, sin pasarelas de pago ni servicios externos. Stack **100 % gratuito**: Next.js 14 + MongoDB + WhatsApp.

## ¿De qué se trata?

770 Barbería agrupa a varios barberos bajo una misma marca. La app permite que cualquier cliente vea a los barberos disponibles, agende su cita en tiempo real y reciba la confirmación por WhatsApp. Cada barbero administra su propia agenda y el administrador gestiona el equipo y los precios.

## Funciones principales

- **Cliente**: agenda con solo *nombre + celular* (sin contraseña). Elige barbero, plan y horario en tiempo real. Consulta y cancela sus citas solo con el celular.
- **Barbero**: panel con vista **Lista** y **Calendario**, acepta/rechaza citas, agenda **citas manuales** para clientes presenciales, configura horario laboral y días bloqueados, edita su foto y redes, y ve un **resumen diario** de cortes e ingresos.
- **Administrador**: aprueba/rechaza barberos, activa/desactiva cuentas y configura los **planes (Bronce/Plata/Oro)** con precios, duración, servicios incluidos y métodos de pago colombianos (Nequi, Daviplata, QR, cuenta) de forma individual por barbero. Puede reordenar los planes y gestionar los servicios de cada plan como lista.
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
> automáticamente un MongoDB en memoria y **carga datos de ejemplo** (seed) con
> barberos y un administrador de demostración.

> El seed crea cuentas de prueba locales. Las credenciales **no** se documentan
> aquí; revísalas en el código del seed (`src/lib/seed.js`) durante el desarrollo.

## Producción (Vercel + MongoDB Atlas)

1. Crea un cluster gratuito en MongoDB Atlas y copia la cadena de conexión.
2. En Vercel define las variables de entorno necesarias (ver los nombres en `.env.example`). **No** subas valores reales al repositorio.
3. Al primer arranque con una base vacía, se ejecuta el seed automático (crea el administrador).

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
