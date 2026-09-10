# Documentación del Proyecto  

---

## 1. Objetivo  

Crear una plataforma web **serverless** que permita a clientes y barberos gestionar citas de forma ágil, segura y transparente. El sistema elimina la fricción de la reserva tradicional al ofrecer un calendario en tiempo real, planes de pago diferenciados (Oro, Plata, Bronce) y notificaciones automáticas, con la meta de alcanzar **un 30 % de reducción del tiempo medio de reserva** y **un 20 % de incremento en la tasa de confirmación de citas** durante los primeros seis meses.

---

## 2. Información General  

| Campo                         | Valor                                                                 |
|------------------------------|-----------------------------------------------------------------------|
| **Nombre del proyecto**       | CitasBarber                                                        |
| **Versión**                  | 1.0.0                                                                 |
| **Fecha**                    | 2026‑09‑01                                                             |
| **Stack tecnológico principal** | Front‑end: Next.js 14 + React 18 + Tailwind CSS  <br>Back‑end: Node.js 20 + Express (API Routes) <br>Auth: JWT + RBAC <br>Base de datos: MongoDB Atlas (Free Tier) <br>Payments: Stripe (Transferencias) + registro de pagos en efectivo <br>Notificaciones: Firebase Cloud Messaging + SendGrid (email) <br>Despliegue: Vercel (Frontend & Serverless Functions) |
| **Perspectivas de expertos consultados** | Ingeniero de Sistemas, Especialista en Gestión de Citas, Consultor de Experiencia de Usuario, Analista de Pagos |

---

## 3. Actores Relacionados  

| Actor        | Responsabilidad dentro del sistema                                                            |
|--------------|----------------------------------------------------------------------------------------------|
| **Administrador** | Aprobar/eliminar barberos, gestionar planes, revisar métricas de uso y auditoría.          |
| **Barbero**        | Configurar disponibilidad, bloquear/habilitar franjas, aceptar o rechazar solicitudes, crear citas offline, recibir pagos y revisar reseñas. |
| **Cliente**        | Registrarse, buscar barberos, seleccionar plan (Oro/Plata/Bronce), reservar una franja, pagar (transferencia o efectivo), recibir notificaciones, cancelar/reprogramar y dejar reseña. |

---

## 4. Descripción de la Necesidad  

En la actualidad, muchos barberos operan de forma independiente sin una herramienta centralizada que sincronice su agenda con los clientes. Los usuarios deben llamar o mensajear, lo que genera pérdidas de tiempo, dobles reservas y dificultades para pagar. Las alternativas existentes (Google Calendar, WhatsApp) carecen de integración de pagos, control de planes y gestión de reseñas. **BarberBooking** resuelve estos problemas al proporcionar:  

* Un **motor de disponibilidad** que calcula slots en tiempo real y evita colisiones.  
* **Planes de pago** que adaptan la experiencia a diferentes presupuestos y métodos (transferencia vs. efectivo).  
* **Notificaciones push y por email** para mantener informados a barberos y clientes.  
* **Auditoría y trazabilidad** mediante logs en Vercel Analytics y webhook de auditoría.  

El resultado esperado es una mayor ocupación de los barberos, menos cancelaciones y una experiencia de usuario coherente y segura.

---

## 5. Diagrama de Solución  

```mermaid
graph TD
    subgraph FrontEnd[Frontend (Next.js + Tailwind)]
        UI[UI React] --> API_GW[API Gateway (Vercel Functions)]
    end

    subgraph BackEnd[Backend (Node.js/Express)]
        API_GW --> Auth[Auth Service (JWT & RBAC)]
        API_GW --> Calendar[Calendar Service]
        API_GW --> Payment[Payment Service (Stripe + Cash)]
        API_GW --> Notify[Notification Service (FCM + SendGrid)]
        API_GW --> DB[MongoDB Atlas]
    end

    AdminConsole[Admin Console] --> Auth
    Barbero[Barbero] --> UI
    Cliente[Cliente] --> UI

    Notify --> Cliente
    Notify --> Barbero
    Payment --> Stripe[(Stripe API)]
    Payment --> CashRecord[Cash Register (internal)]
    Calendar --> UI
    DB -->|CRUD| Users[Usuarios]
    DB -->|CRUD| Barbers[Barberos]
    DB -->|CRUD| Appointments[Citas]
    DB -->|CRUD| Payments[Pagos]
```

---

## 6. Diagrama de Procesos  

```mermaid
flowchart LR
    A[Inicio: Cliente abre la app] --> B[Registro / Login]
    B --> C[Selección de barbero]
    C --> D[Visualiza calendario del barbero]
    D --> E[Selecciona franja horaria]
    E --> F[Elige plan (Oro/Plata/Bronce)]
    F --> G{¿Plan Bronce?}
    G -- Sí --> H[Escoge método de pago: Transferencia o Efectivo]
    G -- No --> I[Pago obligatorio: Transferencia]
    H --> J[Genera solicitud de cita]
    I --> J
    J --> K[Notificación al barbero]
    K --> L{Barbero acepta?}
    L -- Acepta --> M[Estado: Confirmada]
    L -- Rechaza --> N[Estado: Rechazada]
    M --> O[Notificación de confirmación al cliente]
    N --> P[Notificación de rechazo al cliente]
    O --> Q[Realiza pago (si no fue efectivo)]
    Q --> R[Servicio completado]
    R --> S[Cliente deja reseña y calificación]
    S --> T[Fin]
```

---

## 7. Requerimientos Funcionales Específicos  

| ID  | Descripción                                                                                              | Prioridad | Criterio de Aceptación                                                                                                         |
|-----|----------------------------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------------------------------------------------------------------------|
| RF-01 | Registro de usuarios con roles **Cliente** o **Barbero** mediante formulario verificado.               | Alta      | El usuario ingresa datos, recibe email de verificación y al confirmar se crea el registro con el rol seleccionado.            |
| RF-02 | Inicio de sesión con JWT y refresco de token.                                                            | Alta      | Tras enviar credenciales válidas, el backend devuelve un access token (15 min) y un refresh token (7 días).                    |
| RF-03 | Recuperación de contraseña mediante email seguro.                                                         | Alta      | El usuario solicita recuperación, recibe enlace único válido 1 h y puede establecer una nueva contraseña.                       |
| RF-04 | Visualización del calendario del barbero con colores: libre (verde), bloqueado (gris), reservado (rojo). | Alta      | El componente FullCalendar muestra los slots coloreados y actualiza en tiempo real tras cualquier cambio.                     |
| RF-05 | Creación de cita con selección de plan (Oro, Plata, Bronce) y método de pago correspondiente.          | Alta      | Al seleccionar plan, el sistema habilita solo los métodos de pago permitidos y genera la solicitud de cita.                  |
| RF-06 | Notificaciones push y por email cuando el barbero acepta o rechaza la solicitud.                        | Media     | El cliente recibe una notificación en la app y un email dentro de los 5 segundos posteriores a la decisión del barbero.       |
| RF-07 | Bloqueo y habilitación de franjas horarias por parte del barbero.                                        | Alta      | El barbero puede marcar cualquier slot como *bloqueado* o *disponible*; los cambios son persistidos y reflejados al instante.|
| RF-08 | Creación de cita offline (barbero contacta a cliente directamente) con confirmación posterior.          | Media     | El barbero crea una cita manualmente; el cliente ve la cita solo cuando el barbero la marca como *confirmada*.               |
| RF-09 | Cancelación o reprogramación de cita dentro de la ventana configurada por el barbero.                  | Media     | El cliente puede cancelar/reprogramar si la solicitud se hace al menos 24 h antes del slot; el estado cambia a *Cancelada*. |
| RF-10 | Registro de pago en efectivo para plan Bronce con estado *Pendiente* y conciliación posterior.        | Media     | El cliente marca “Pago en efectivo”, el backend guarda el registro como *Pendiente* y el barbero puede cambiar a *Pagado*.  |
| RF-11 | Publicación de reseña y calificación (1‑5 estrellas) después de una cita completada.                    | Baja      | Tras el estado *Completada*, el cliente accede a un formulario de reseña; la información queda vinculada a la cita.          |
| RF-12 | Panel de administración para aprobar o rechazar solicitudes de incorporación de barberos.              | Alta      | El admin visualiza una lista de usuarios con rol *Barbero* en estado *Pendiente* y puede cambiar su estado a *Activo* o *Rechazado*. |

---

## 8. Manual Técnico  

### 8.1 Stack Tecnológico y Justificación  

| Capa                     | Tecnología                         | Motivo de elección |
|--------------------------|------------------------------------|--------------------|
| **Frontend**            | Next.js 14 (SSR + API Routes) + React 18 + Tailwind CSS | SEO amigable, generación estática y server‑side rendering, integración nativa con Vercel y estilos altamente configurables. |
| **Backend / API**       | Node.js 20 + Express (en API Routes) | Compatibilidad con Vercel Functions, ecosistema npm amplio, fácil manejo de middlewares (auth, validación). |
| **Autenticación**       | JSON Web Tokens (jwt) + RBAC      | Stateless, escalable y sencillo de integrar con Vercel Functions. |
| **Base de datos**       | MongoDB Atlas (Free Tier)         | Modelo de documentos flexible para usuarios, citas y pagos; escalado automático y backup gestionado. |
| **Motor de disponibilidad** | Algoritmo de slots atómicos usando transacciones MongoDB | Garantiza consistencia y evita doble reserva. |
| **Calendario**          | FullCalendar (React) + date‑fns   | Soporte de zona horaria, ARIA y personalización visual. |
| **Pagos**               | Stripe (Transferencias) + registro interno de efectivo | Cumple con PCI‑DSS, API robusta y permite registrar pagos offline. |
| **Notificaciones**      | Firebase Cloud Messaging (FCM) + SendGrid | Push a dispositivos móviles y email fiable. |
| **Despliegue**          | Vercel (frontend + serverless functions) | Deploy instantáneo, CDN global, integración con Git y preview URLs. |
| **Analítica & Logs**    | Vercel Analytics + Webhook de auditoría (Kafka‑lite) | Visibilidad operativa y trazabilidad. |

### 8.2 Dependencias Principales  

```bash
# Frontend
next@14
react@18
react-dom@18
tailwindcss@3
@fullcalendar/react@6
@fullcalendar/daygrid@6
date-fns@3

# Backend
express@4
mongoose@8
jsonwebtoken@9
bcryptjs@2
dotenv@16
stripe@12
@sendgrid/mail@8
firebase-admin@12
cors@2
```

### 8.3 Variables de Entorno  

| Variable                     | Descripción                                    | Ejemplo |
|------------------------------|------------------------------------------------|---------|
| `NEXT_PUBLIC_BASE_URL`       | URL pública del frontend (usado en emails)    | `https://barberbooking.vercel.app` |
| `MONGODB_URI`                | Cadena de conexión a MongoDB Atlas              | `mongodb+srv://user:pwd@cluster0.mongodb.net/barberbooking` |
| `JWT_SECRET`                 | Secret para firmar los tokens JWT              | `c0mpl3x$ecretK3y` |
| `JWT_EXPIRES_IN`             | Tiempo de vida del access token (s)            | `900` |
| `REFRESH_TOKEN_EXPIRES_IN`   | Tiempo de vida del refresh token (s)           | `604800` |
| `STRIPE_SECRET_KEY`          | Clave secreta de Stripe                         | `sk_test_XXXX` (ver panel de Stripe) |
| `SENDGRID_API_KEY`           | API key de SendGrid                             | `SG.xxxxxxxx` |
| `FCM_SERVICE_ACCOUNT`        | JSON string con credenciales de Firebase        | `{...}` |
| `ADMIN_EMAIL`                | Email del administrador para alertas críticas   | `admin@barberbooking.com` |

### 8.4 Configuración del Entorno de Desarrollo  

1. **Instalar Node.js 20+** y **Git**.  
2. **Clonar** el repositorio y crear un archivo `.env.local` en la raíz con las variables listadas.  
3. Ejecutar `npm install` para instalar todas las dependencias.  
4. Iniciar la base de datos local (opcional) con **MongoDB Community Server** y apuntar `MONGODB_URI` a `mongodb://localhost:27017/barberbooking`.  
5. Lanzar el proyecto con `npm run dev`. Vercel detectará automáticamente los **API Routes**.  
6. Acceder a `http://localhost:3000` y validar que el login, calendario y pagos funcionan con los **mocks** de Stripe y SendGrid (modo test).

---

## 9. Manual de Instalación  

```bash
# 1. Clonar el repositorio
git clone https://github.com/yourorg/barberbooking.git
cd barberbooking

# 2. Instalar dependencias
npm ci

# 3. Copiar archivo de variables de entorno y completarlo
cp .env.example .env.local
# Editar .env.local con los valores reales (ver sección 8.3)

# 4. Iniciar la base de datos local (opcional)
# Si se usa MongoDB Atlas, saltar este paso
docker run -d -p 27017:27017 --name mongodb mongo:6

# 5. Ejecutar en modo desarrollo
npm run dev
# La app está disponible en http://localhost:3000

# 6. Construir para producción (Vercel)
npm run build
# Vercel CLI (opcional)
npm i -g vercel
vercel --prod
```

**Despliegue en producción**  
- Conectar el repositorio a Vercel mediante GitHub.  
- Definir las variables de entorno en el panel de Vercel (Settings → Environment Variables).  
- Cada push a `main` genera automáticamente una preview y, tras merge, se despliega a producción.

---

## 10. Arquitectura de la Aplicación  

### 10.1 Diagrama de Casos de Uso  

```mermaid
graph LR
    Admin -->|Aprueba| Barbero_Registro
    Admin -->|Gestiona| Planes
    Barbero -->|Configura| Horario
    Barbero -->|Acepta/Rechaza| Solicitud_Cita
    Barbero -->|Registra| Pago_Efectivo
    Cliente -->|Registra| Registro_Cliente
    Cliente -->|Inicia| Login
    Cliente -->|Busca| Buscar_Barbero
    Cliente -->|Ve| Calendario
    Cliente -->|Reserva| Solicitud_Cita
    Cliente -->|Paga| Pago_Transferencia
    Cliente -->|Recibe| Notificacion
    Cliente -->|Deja| Reseña
```

### 10.2 Diagrama de Secuencia (Caso de uso: “Cliente agenda cita”)  

```mermaid
sequenceDiagram
    participant C as Cliente
    participant UI as UI (Next.js)
    participant API as API Gateway
    participant Auth as Auth Service
    participant Cal as Calendar Service
    participant Pay as Payment Service
    participant DB as MongoDB
    participant N as Notification Service

    C->>UI: Ingresa credenciales
    UI->>API: POST /api/auth/login
    API->>Auth: Verifica credenciales
    Auth-->>API: JWT + Refresh
    API-->>UI: Token

    C->>UI: Selecciona barbero y slot
    UI->>API: GET /api/barbers/:id/availability
    API->>Cal: Calcular slots libres
    Cal-->>API: Slots
    API-->>UI: Renderiza calendario

    C->>UI: Elige plan (Bronce) y método (Efectivo)
    UI->>API: POST /api/appointments
    API->>DB: Insert appointment (status: Pending)
    DB-->>API: _id
    API->>N: Envia notificación al barbero
    N-->>Barbero: Push + Email

    Barbero->>UI: Acepta cita
    UI->>API: PATCH /api/appointments/:id/confirm
    API->>DB: Update status = Confirmed
    DB-->>API: OK
    API->>N: Notifica al cliente
    N-->>C: Push + Email

    C->>UI: Registra pago (Transferencia)
    UI->>API: POST /api/payments
    API->>Pay: Crear charge Stripe
    Pay-->>API: paymentId, status=Succeeded
    API->>DB: Update appointment.paymentId
    DB-->>API: OK
    API-->>UI: Confirmación final
```

### 10.3 Diagrama de Clases  

```mermaid
classDiagram
    class User {
        <<abstract>>
        +ObjectId id
        +String email
        +String passwordHash
        +String role
        +Date createdAt
        +Date updatedAt
        +verifyPassword()
    }

    class Client {
        +ObjectId profileId
        +Array<Appointment> appointments
        +bookAppointment()
        +cancelAppointment()
    }

    class Barber {
        +String name
        +String shopName
        +Array<ScheduleSlot> schedule
        +Array<Appointment> appointments
        +blockSlot()
        +unblockSlot()
        +acceptAppointment()
        +rejectAppointment()
    }

    class Appointment {
        +ObjectId id
        +ObjectId clientId
        +ObjectId barberId
        +Date start
        +Date end
        +Plan plan
        +PaymentMethod paymentMethod
        +AppointmentStatus status
        +addReview()
    }

    class Plan {
        <<enumeration>>
        +ORO
        +PLATA
        +BRONCE
    }

    class PaymentMethod {
        <<enumeration>>
        +TRANSFERENCIA
        +EFECTIVO
    }

    class AppointmentStatus {
        <<enumeration>>
        +SOLICITADA
        +PENDIENTE_PAGO
        +CONFIRMADA
        +COMPLETADA
        +CANCELADA
        +RECHAZADA
    }

    class Payment {
        +ObjectId id
        +ObjectId appointmentId
        +Number amount
        +String currency
        +String provider (Stripe|Cash)
        +String status
        +Date processedAt
    }

    User <|-- Client
    User <|-- Barber
    Appointment "1" --> "1" Client : clientId
    Appointment "1" --> "1" Barber : barberId
    Appointment "1" --> "1" Plan : plan
    Appointment "1" --> "1" PaymentMethod : method
    Appointment "1" --> "1" Payment : payment
```

### 10.4 Diagrama de Componentes (Alto Nivel)  

```mermaid
graph TB
    subgraph Frontend
        UI[UI React + Tailwind]
        CalendarComp[FullCalendar Component]
        PaymentForm[Formulario Stripe]
    end

    subgraph Backend
        AuthSrv[Auth Service (JWT/RBAC)]
        CalendarSrv[Calendar Service]
        PaymentSrv[Payment Service]
        NotifySrv[Notification Service]
        UserCtrl[User Controllers]
        AppointmentCtrl[Appointment Controllers]
        DB[MongoDB Atlas]
    end

    UI --> AuthSrv
    UI --> CalendarSrv
    UI --> PaymentSrv
    UI --> NotifySrv
    AuthSrv --> DB
    CalendarSrv --> DB
    PaymentSrv -->