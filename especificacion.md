# Especificación Técnica

## Visión del Producto

La visión del producto es ofrecer una plataforma web SaaS orientada al mercado colombiano para la gestión integral de citas en barberías, con un modelo de suscripción mensual dirigido a barberos independientes o sedes de barbería (iniciando con **770 Barbería** en Caldas, Antioquia).

El **Administrador** es el eje central del modelo SaaS: valida qué barberos pueden usar la app (aprobando solicitudes o creándolos directamente), configura los planes de servicio (Bronce, Plata, Oro) con sus precios, duraciones y métodos de pago colombianos (Nequi, Daviplata, QR, cuenta bancaria, efectivo) de forma individual por barbero, y gestiona el **Control de Suscripciones** mensual mediante un tablero de semáforos, alertas por WhatsApp y KPIs de recaudo.

Los **Clientes** disfrutan de una experiencia de reserva ultrarrápida y sin fricciones: solo ingresan su **Nombre completo y Celular** (sin contraseñas). El sistema recuerda su número, ofrece auto-avance paso a paso, busca el primer día con cupos disponibles y permite pagar el anticipo (cuando aplique) subiendo el comprobante y enviándolo directamente al WhatsApp del barbero. Además, los clientes cuentan con el portal **Mis Citas** para consultar reservas activas e historial, activar recordatorios automáticos por **Notificaciones Push Web**, cancelar dentro de la ventana permitida y sincronizar sus citas en **Google Calendar** o el calendario nativo del celular (`.ics`).

El **Barbero** gestiona su jornada con máxima eficiencia: visualiza su agenda en vista de **Lista (Hoy)** o **Calendario interactivo** (semanal/mensual), gestiona citas (aceptar, rechazar, completar, cancelar o marcar como **"No asistió"**), bloquea días completos, ausencias por franjas de horas y su hora fija de **almuerzo**. Para la atención presencial, dispone de un módulo de **Cita Manual** con autocompletado inteligente de clientes anteriores e integración con la **Contact Picker API** de dispositivos móviles para seleccionar clientes directamente de su libreta telefónica.

El sistema funciona bajo un stack serverless optimizado: comunicación directa por **WhatsApp (`wa.me`)** sin costos de mensajería SMS, notificaciones **Web Push (VAPID)** en tiempo real incluso con la app cerrada, recordatorios automáticos programados vía **Cron**, y exportación de citas a calendarios sin dependencias de pasarelas de pago de terceros. La aplicación es **100 % instalable como PWA** (Progressive Web App) en Android e iOS, ofreciendo una experiencia idéntica a una app nativa.

---

## Usuarios Objetivo

- **Administrador de la plataforma**: Gestiona la suscripción mensual de los barberos con control de estados (al día, por vencer, vencido) y registro de pagos; crea barberos manualmente o aprueba solicitudes públicas; gestiona consultas de prospectos; y configura planes, precios y accesos.
- **Barbero independiente**: Controla su jornada laboral diaria (horario, duración de turno, hora de almuerzo y bloqueos de ausencias); acepta/rechaza/completa/cancela citas; marca inasistencias ("No asistió"); registra clientes presenciales mediante autocompletado o libreta telefónica; sincroniza su agenda con Google Calendar o archivos `.ics`; y consulta su balance diario de ingresos discriminado por efectivo y transferencia.
- **Cliente final**: Agenda un corte en segundos con el mínimo de datos (solo Nombre y Celular), sin necesidad de contraseñas; consulta sus reservas activas y pasadas en "Mis Citas"; recibe recordatorios Web Push el día de su servicio; y añade su cita al calendario de su dispositivo con un solo toque.

---

## Funcionalidades

### 1. Administración y Gestión SaaS
1. **Aprobación y control de cuentas**: El Administrador puede aprobar o rechazar solicitudes de barberos y activar o desactivar cuentas existentes.
2. **Creación directa de barberos**: El Administrador puede dar de alta a un barbero directamente desde su panel, configurando en un solo formulario sus datos personales, credenciales, sede/dirección, horario, redes sociales, tarifa mensual y planes iniciales.
3. **Módulo de Control de Suscripciones**: Tablero administrativo con semáforo de estados:
   - *Al día* (más de 5 días de vigencia).
   - *Por vencer* (entre 0 y 5 días restantes).
   - *Vencido* (fecha de corte superada).
   - Métricas clave (KPIs): Total barberos activos, cantidad por cobrar, al día, y recaudo mensual proyectado en COP.
   - Registro de pagos de suscripción con extensión automática de 30 días o fecha personalizada.
   - Enlace directo de cobro/notificación por WhatsApp al barbero con mensaje prellenado según el estado de su suscripción.
4. **Gestión de solicitudes de prospectos ("¿Tienes barbería?")**: Recepción de mensajes de contacto de nuevos barberos desde la landing page, con contador de no leídos, respuesta rápida por WhatsApp, marcado como atendida y eliminación.
5. **Configuración individual de planes**: El Administrador puede editar los planes de servicio (Bronce, Plata, Oro), precios, duraciones, porcentajes de anticipo y métodos de pago colombianos permitidos de forma independiente para cada barbero.

### 2. Experiencia del Cliente
6. **Identificación sin fricción**: El cliente se identifica únicamente con Nombre completo y Celular; en visitas posteriores el sistema lo reconoce y almacena su número localmente para agilizar futuras consultas.
7. **Asistente de agendamiento con auto-avance**:
   - Búsqueda automática del primer día con cupos disponibles dentro de los próximos 30 días al elegir un plan.
   - Avance automático entre pasos (Plan → Horario → Pago) con botón de regreso fijo y accesible.
   - Validación estricta que impide seleccionar fechas u horas pasadas (calculadas en la zona horaria `America/Bogota`).
8. **Pago de anticipo colombiano**: Para planes con anticipo (ej. Plata y Oro al 50 %), el cliente visualiza los datos de pago (Nequi, Daviplata, QR, cuenta bancaria), sube la imagen del comprobante y es redirigido a WhatsApp con un mensaje prellenado para enviarlo al barbero.
9. **Portal "Mis Citas"**:
   - Pestaña de **Próximas citas**: Destaca visualmente la cita más cercana o del día de hoy, estado en vivo, detalles del servicio, dirección del local y botón de contacto por WhatsApp.
   - Pestaña de **Historial**: Registro de servicios anteriores completados, cancelados o no asistidos.
   - Activación de **Recordatorios Push**: El cliente puede suscribirse a alertas web en su navegador para recibir un aviso en la mañana del día de su cita.
   - Cancelación de citas: El cliente puede cancelar su reserva respetando la ventana mínima de anticipación configurada por el barbero (por defecto 24 h).

### 3. Panel y Herramientas del Barbero
10. **Vistas duales (Lista "Hoy" y Calendario)**:
    - **Hoy (Lista)**: Cronología del día actual con acciones rápidas, detalles de pago y acceso a comprobantes.
    - **Calendario**: Navegación por día, semana y mes, visualización de citas compactas, ausencias, almuerzos y franjas libres con paso de 30 minutos.
11. **Ciclo de vida de la cita**: El barbero puede:
    - *Aceptar*: Bloquea definitivamente el cupo y abre un modal para sincronizar la cita con Google Calendar o descargar el archivo `.ics`.
    - *Rechazar*: Abre conversación de WhatsApp con el cliente indicando el motivo del rechazo.
    - *Completar*: Marca el servicio como realizado tras finalizar el corte.
    - *No asistió*: Marca la inasistencia del cliente sin computar ingresos en caja, manteniendo el historial del cliente.
    - *Cancelar*: Cancela una cita confirmada notificando al cliente por WhatsApp con mensaje explicativo.
12. **Cita Manual optimizada (Clientes presenciales)**:
    - Autocompletado de clientes frecuentes al escribir nombre o celular (búsqueda en citas previas y base de clientes).
    - Integración con **Contact Picker API** (`navigator.contacts.select` en Android/Chrome) para seleccionar clientes directamente de la agenda de contactos del teléfono.
    - Selección rápida de fecha, plan y hora con enfoque automático en el botón de creación.
13. **Exportación a Calendarios personales**:
    - Generación de enlaces para **Google Calendar** con todos los detalles (cliente, teléfono, servicio, precio, dirección).
    - Descarga de archivos **iCalendar (`.ics`)** para calendario nativo de iPhone, Android u Outlook (evento individual o paquete completo de citas confirmadas del día).
14. **Gestión de Horarios y Disponibilidad**:
    - Configuración de hora de inicio y fin de jornada, días laborales de la semana y duración estándar por turno.
    - Configuración de franja fija de **Almuerzo** (se descuenta automáticamente de la disponibilidad en días laborales).
    - Bloqueo inmediato de **días completos** o de **franjas de horas específicas** (ausencias personales, citas médicas), con alerta previa si existen citas activas en conflicto.
15. **Balance y Resumen Diario de Ingresos**:
    - Reporte del día con métricas de citas totales, completadas, pendientes, canceladas y no asistidas.
    - Desglose financiero: ingresos reales vs proyectados, y discriminación de dinero en **Efectivo** vs **Transferencia / Anticipos**.
    - Navegación histórica de resúmenes por fecha.

### 4. Automatización y Notificaciones
16. **Notificaciones Push Web (VAPID)**:
    - Alerta al Barbero cuando un cliente solicita una nueva cita.
    - Alerta al Administrador cuando un prospecto llena el formulario de contacto.
    - Auto-suscripción silenciosa para barberos y administradores al abrir la PWA instalada si el permiso ya fue concedido.
17. **Recordatorios programados (Cron Job `/api/cron/recordatorios`)**:
    - Aviso al barbero ~15 minutos antes si una cita de hoy sigue en estado "Solicitada" sin confirmar.
    - Aviso al cliente en la mañana del día de su cita (a la hora de apertura de la barbería) recordando su corte y sede.
18. **Instalación PWA nativa**:
    - Botón de instalación rápida en Android / escritorio mediante evento `beforeinstallprompt`.
    - Guía asistida para iPhone/iOS (Compartir → Agregar a inicio).
    - Service worker para caché offline y recepción de push en segundo plano.

---

## Flujos de Usuario

### 1. Registro y Alta de Barbero
- **Vía Solicitud Pública**:
  1. El barbero llena el formulario de contacto en la landing page.
  2. El Administrador recibe notificación push y revisa la solicitud en la pestaña *Solicitudes*.
  3. El Administrador contacta al barbero vía WhatsApp o aprueba la solicitud.
- **Vía Creación Directa por el Administrador**:
  1. El Administrador hace clic en "+ Nuevo barbero" en el panel.
  2. Completa datos personales, contraseña, dirección, redes sociales, horario de trabajo, almuerzo, tarifa mensual y planes.
  3. El barbero queda activo de inmediato y puede iniciar sesión y recibir citas.

### 2. Agendamiento de Cita por el Cliente
1. El cliente ingresa a la página del barbero, ingresa su Nombre y Celular.
2. Selecciona el plan deseado (Bronce, Plata, Oro). El sistema busca automáticamente el primer día con cupos y avanza al selector de fecha/hora.
3. El cliente elige su hora preferida (en paso de 30 min) y el sistema avanza al paso de pago.
4. **Si requiere anticipo (Plata / Oro)**: Realiza la transferencia, sube la foto del comprobante y pulsa agendar; se abre WhatsApp para enviar el comprobante al barbero.
5. **Si es plan Bronce**: Selecciona efectivo o transferencia y confirma la solicitud.
6. La solicitud queda en estado `solicitada` y el barbero recibe notificación push instantánea.

### 3. Confirmación y Sincronización de Cita por el Barbero
1. El barbero recibe la alerta push o revisa la pestaña *Hoy* o *Calendario*.
2. Al pulsar **Aceptar**:
   - La cita pasa a `confirmada` y el slot queda bloqueado.
   - El barbero puede enviar el resumen de confirmación al cliente por WhatsApp (`wa.me`).
   - Aparece el modal para agregar la cita a **Google Calendar** o descargar el archivo `.ics` a su teléfono.
3. Si el barbero pulsa **Rechazar**: Ingresa el motivo opcional y se abre WhatsApp con el cliente para coordinar otra alternativa.

### 4. Cita Manual para Clientes Presenciales
1. El barbero ingresa a la pestaña *Manual* (o pulsa un espacio libre en el Calendario).
2. Si está en el celular, puede pulsar "Elegir de contactos" para traer nombre y teléfono de su agenda telefónica, o escribir para ver sugerencias de clientes recurrentes.
3. Selecciona el plan y la hora deseada; el botón "Crear cita" se enfoca automáticamente.
4. La cita se registra como confirmada y manual, impactando de inmediato la agenda y el resumen financiero.

### 5. Control de Suscripciones y Cobranza (Admin)
1. El Administrador ingresa a la pestaña *Control* en su panel.
2. Visualiza el total a recaudar y el semáforo de barberos (al día, por vencer en ≤5 días, o vencidos).
3. Con un solo clic puede abrir WhatsApp con el barbero con un mensaje personalizado recordando la mensualidad.
4. Al recibir el pago, pulsa "Registrar pago (+30 días)" o define una fecha personalizada de vencimiento.

---

## Arquitectura Técnica

```
Arquitectura serverless moderna alojada en Vercel, compuesta por:
- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS, Date-fns, Phosphor Icons.
- Backend/API: Next.js API Routes (Node.js) serverless con middlewares de autenticación y rate limiting en memoria por IP.
- Base de Datos: MongoDB Atlas (Mongoose 8) con índices optimizados para barberos, clientes, citas, solicitudes y suscripciones push. En desarrollo local soporta mongodb-memory-server sin configuración previa.
- Notificaciones Push: Web Push API (RFC 8292 / VAPID) mediante la librería web-push, administrando suscripciones activas y depuración automática de endpoints vencidos (404/410).
- Calendarios: Generador estricto RFC 5545 para archivos iCalendar (.ics) y enlaces dinámicos compatibles con Google Calendar Web y móvil.
- Integración Nativa: Contact Picker API de navegadores móviles modernos y Progressive Web App (PWA) con Service Worker y Web App Manifest.
- Zona Horaria: Manejo estricto de zona horaria colombiana ('America/Bogota', UTC-5) mediante Intl en todos los cálculos de fecha/hora, evitando desfases por ejecución UTC en Vercel.
- Automatización: Endpoint de recordatorios (/api/cron/recordatorios) protegido por Bearer CRON_SECRET para invocación programada por crons externos o Vercel Cron.
```

---

## Requisitos No Funcionales

- **Disponibilidad**: Mínimo 99.5 % de tiempo en línea mediante la infraestructura serverless de Vercel y el clúster tolerante a fallos de MongoDB Atlas.
- **Rendimiento de Disponibilidad**: Tiempo de respuesta menor a 250 ms en el cálculo dinámico de franjas horarias libres.
- **Zona Horaria y Precisión**: Todos los cálculos de fecha de hoy, bloqueo de horas pasadas y recordatorios operan bajo `America/Bogota` (UTC-5), garantizando consistencia independientemente de la ubicación del servidor.
- **Seguridad y Cifrado**:
  - Sesiones administrativas y de barbero con JWT en cookies `httpOnly`, `secure`, `sameSite=lax`.
  - Protección de endpoints sensibles con rate limiting por IP.
  - Endpoints de cron protegidos mediante token Bearer criptográfico.
  - Cifrado en tránsito (TLS 1.3) y en reposo (MongoDB Atlas).
- **Privacidad y Consentimiento (Habeas Data)**:
  - Los clientes solo entregan Nombre y Celular, sin contraseñas vulnerables.
  - El acceso a contactos telefónicos mediante la Contact Picker API es 100 % explícito y bajo demanda del usuario en el navegador.
- **Tolerancia a Fallos en Notificaciones**: Si las credenciales VAPID no están configuradas, el sistema desactiva el envío push silenciosamente sin interrumpir el flujo principal de reservas.
- **Experiencia Móvil y Accesibilidad**: Interfaz mobile-first táctil optimizada, diálogos modales nativos en la app y tiempos de carga instantáneos.
