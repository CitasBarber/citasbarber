# Especificación Técnica

## Visión del Producto

La visión del producto es crear una plataforma web SaaS orientada al mercado colombiano para la gestión de citas de barberías, con un modelo de suscripción mensual dirigido a barberos independientes. El Administrador es el eje central: valida qué barberos pueden usar la app, configura los planes de servicio (Bronce, Plata, Oro) con sus precios, duraciones y métodos de pago colombianos (Nequi, Daviplata, QR, cuenta bancaria) de forma individual por barbero, y controla la activación de cuentas. Los clientes viven una experiencia de registro mínima —solo Nombre completo y Celular— para eliminar fricciones. El barbero gestiona su agenda por jornada laboral, acepta o rechaza solicitudes, agenda citas manuales para clientes presenciales y recibe un resumen diario de cortes e ingresos. Todo el stack es 100 % gratuito: sin pasarelas de pago externas ni servicios de notificación de pago; las comunicaciones se realizan mediante redirección a WhatsApp (wa.me) y los pagos anticipados se verifican a través de comprobantes que el cliente envía directamente al WhatsApp del barbero.

---

## Usuarios Objetivo

- **Administrador de la plataforma**: gestiona la suscripción mensual de los barberos, configura los planes de servicio y precios por barbero, y controla el acceso a la app.
- **Barbero independiente**: requiere controlar su agenda por jornada laboral, bloquear días no disponibles, aceptar o rechazar citas, agendar clientes presenciales y revisar un resumen diario de su actividad.
- **Cliente final**: necesita agendar un corte de forma rápida y sencilla con el mínimo de datos posibles (solo Nombre completo y Celular), sin formularios extensos ni contraseñas, desde cualquier dispositivo móvil.

---

## Funcionalidades

1. El Administrador puede aprobar o rechazar solicitudes de barberos nuevos y activar/desactivar cuentas existentes según el estado de la suscripción mensual.
2. El Administrador puede configurar los planes (Bronce, Plata, Oro) con servicios, precios, duración y métodos de pago colombianos permitidos de forma independiente para cada barbero.
3. El Cliente puede registrarse únicamente con Nombre completo y Celular; en visitas posteriores el sistema lo reconoce automáticamente por su número sin contraseña.
4. El Cliente puede seleccionar un barbero, una franja horaria disponible y un plan (Bronce / Plata / Oro) para crear una solicitud de cita.
5. El Cliente con plan Plata u Oro puede pagar el 50 % de anticipo por transferencia colombiana (Nequi, Daviplata, QR o cuenta bancaria), subir el comprobante y enviarlo al WhatsApp del barbero.
6. El Cliente puede recibir el resumen de la cita confirmada por WhatsApp (wa.me) incluyendo: barbero, plan, servicios del plan, fecha, hora y duración estimada.
7. El Cliente puede consultar el estado de su cita (Pendiente / Confirmada / Rechazada / Completada / Cancelada) ingresando solo su número de celular.
8. El Cliente puede cancelar su cita dentro de la ventana mínima configurada por el barbero.
9. El Barbero puede configurar su horario laboral diario (hora de inicio y fin) y bloquear días completos o franjas específicas por ausencia o vacaciones.
10. El Barbero puede aceptar o rechazar solicitudes de cita; al rechazar, se abre automáticamente una conversación de WhatsApp con el cliente para aclarar el motivo.
11. El Barbero puede agendar citas manuales para clientes presenciales (adultos mayores, sin celular), dejando registro completo en el historial y en el resumen diario.
12. El Barbero puede alternar entre una vista de **Lista** (citas del día en orden cronológico) y una vista de **Calendario** (semanal/mensual) desde su panel.
13. El Barbero recibe un resumen diario automático al finalizar su jornada con total de citas, ingresos estimados y desglose por plan.
14. El sistema bloquea automáticamente el slot en la agenda del barbero según la duración del plan: Bronce 25 min, Plata y Oro 55 min (buffer de 5 min incluido).

---

## Flujos de Usuario

**Registro de barbero y aprobación por el Admin:**
1. El barbero completa el formulario con nombre, nombre del local, celular y ciudad. Estado inicial: *Pendiente*.
2. El Administrador recibe la solicitud en su panel, revisa los datos y aprueba o rechaza.
3. Si es aprobado, el Admin configura los planes del barbero (servicios, precios, métodos de pago). El barbero queda *Activo* y puede recibir citas.

**Agendamiento de cita por el cliente:**
1. El cliente ingresa su Nombre completo y Celular (o solo el celular si ya está registrado).
2. Selecciona el barbero, la fecha, la franja horaria disponible y el plan deseado.
3. Si elige Plata u Oro: paga el 50 % por Nequi / Daviplata / QR / cuenta bancaria, sube el comprobante y se abre WhatsApp con el barbero para enviárselo.
4. Si elige Bronce: selecciona transferencia o efectivo y envía la solicitud.
5. El barbero ve la solicitud en su panel y acepta o rechaza.
6. Si acepta: el slot queda bloqueado en la agenda (25 min Bronce / 55 min Plata y Oro) y el cliente recibe el resumen por WhatsApp (wa.me).
7. Si rechaza: se abre una conversación de WhatsApp entre cliente y barbero para aclarar el motivo.

**Cita manual por el barbero (cliente presencial):**
1. El barbero accede a su panel y crea una cita manual ingresando el nombre del cliente y el plan.
2. La cita queda registrada en el historial, en la agenda y en el resumen diario.

**Resumen diario del barbero:**
1. Al finalizar la jornada configurada, el panel del barbero muestra el resumen del día.
2. El resumen incluye: número de citas realizadas, ingresos estimados y desglose por plan (Bronce / Plata / Oro).

---

## Arquitectura Técnica

```
Arquitectura serverless 100% gratuita basada en Vercel para el frontend (Next.js con React y Tailwind CSS) y API Routes como capa de negocio en Node.js/Express. La persistencia de datos se gestiona con MongoDB Atlas free tier con colecciones para: clientes (identificados por celular), barberos, citas y configuración de planes por barbero. Se usa JWT para autenticación de barberos y administradores; los clientes no tienen contraseña, se identifican solo por celular. El motor de disponibilidad calcula slots en tiempo real según el horario laboral del barbero (configurable) y bloquea automáticamente la duración exacta por plan: Bronce 25 min, Plata y Oro 55 min. Los pagos son gestionados externamente por el cliente (Nequi, Daviplata, QR o cuenta bancaria) sin ningún gateway integrado; el comprobante se sube como imagen y se envía al WhatsApp del barbero mediante un link wa.me. Las notificaciones al cliente también se realizan por WhatsApp (wa.me) con el resumen pre-llenado de la cita. Los logs se envían a Vercel Analytics para trazabilidad operativa.
```

---

## Requisitos No Funcionales

- Disponibilidad mínima del 99.5 % en producción (garantizada por Vercel + MongoDB Atlas)
- Tiempo de respuesta de API inferior a 200 ms para consultas de disponibilidad
- Escalabilidad horizontal automática mediante funciones serverless en Vercel
- Cifrado de datos en tránsito (TLS 1.3) y en reposo (MongoDB Atlas encriptado)
- Cumplimiento con la Ley 1581 de 2012 (Habeas Data, Colombia) para gestión de datos personales
- Stack 100 % gratuito: sin gateway de pagos externo, sin servicios de notificación de pago
- Auditoría de eventos críticos y trazabilidad de cambios en la agenda mediante Vercel Analytics
- Accesibilidad en la interfaz del calendario (soporte móvil prioritario)
- Respaldo diario automático de la base de datos con retención de 30 días (MongoDB Atlas)
