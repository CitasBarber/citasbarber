import Usuario from "@/models/Usuario";
import Barbero from "@/models/Barbero";
import Cliente from "@/models/Cliente";
import Cita from "@/models/Cita";
import { hashPassword } from "@/lib/auth";
import {
  ESTADO_BARBERO,
  ESTADO_CITA,
  ROLES,
  PLANES_DEFAULT,
} from "@/lib/constants";
import { minAHhmm, hhmmAMin } from "@/lib/disponibilidad";

function fechaMasDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function snapshot(plan) {
  return {
    key: plan.key,
    nombre: plan.nombre,
    servicios: plan.servicios,
    precio: plan.precio,
    duracion: plan.duracion,
    anticipo: plan.anticipo,
  };
}

// Crea datos de ejemplo si la base está vacía (sin usuarios).
export async function seedIfEmpty() {
  const yaHay = await Usuario.countDocuments();
  if (yaHay > 0) return false;

  console.log("🌱 Sembrando datos de ejemplo…");

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@citasbarber.com").toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";

  // Admin
  await Usuario.create({
    role: ROLES.ADMIN,
    nombre: "Administrador",
    email: adminEmail,
    passwordHash: await hashPassword(adminPass),
  });

  const claveBarbero = await hashPassword("barbero123");

  // Barbero 1 (activo, con planes y datos de pago)
  const b1 = await Barbero.create({
    nombre: "Brahian Villegas",
    local: "770 Barbería",
    celular: "3001112233",
    ciudad: "Caldas, Antioquia",
    direccion: "Carrera 48 # 133 sur 50",
    foto: "/barberos/brahian.jpg",
    redes: { instagram: "@770barberia", facebook: "770barberia", tiktok: "@770barberia" },
    email: "brahian@citasbarber.com",
    estado: ESTADO_BARBERO.ACTIVO,
    suscripcionActiva: true,
    suscripcionVence: new Date(Date.now() + 30 * 864e5),
    horario: { horaInicio: "10:00", horaFin: "19:00", diasLaborales: [1, 2, 3, 4, 5, 6] },
    datosPago: { nequi: "300 111 2233", daviplata: "300 111 2233", cuenta: "Bancolombia 123-456789-00" },
    planes: PLANES_DEFAULT,
  });
  await Usuario.create({
    role: ROLES.BARBERO, nombre: b1.nombre, email: b1.email, passwordHash: claveBarbero, barbero: b1._id,
  });

  // Todos los barberos pertenecen a 770 Barbería (mismo local y dirección)
  const LOCAL = "770 Barbería";
  const CIUDAD = "Caldas, Antioquia";
  const DIRECCION = "Carrera 48 # 133 sur 50";

  // Barbero 2 (activo) — de 770 Barbería
  const b2 = await Barbero.create({
    nombre: "Andrés Gómez",
    local: LOCAL,
    celular: "3014445566",
    ciudad: CIUDAD,
    direccion: DIRECCION,
    email: "andres@citasbarber.com",
    estado: ESTADO_BARBERO.ACTIVO,
    suscripcionActiva: true,
    suscripcionVence: new Date(Date.now() + 30 * 864e5),
    horario: { horaInicio: "09:00", horaFin: "18:00", diasLaborales: [1, 2, 3, 4, 5, 6] },
    datosPago: { nequi: "301 444 5566", cuenta: "Davivienda 987-654321-11" },
    redes: { instagram: "@andres.770" },
    planes: PLANES_DEFAULT.map((p) => ({ ...p, precio: Math.round(p.precio * 1.1) })),
  });
  await Usuario.create({
    role: ROLES.BARBERO, nombre: b2.nombre, email: b2.email, passwordHash: claveBarbero, barbero: b2._id,
  });

  // Barbero 3 (activo) — de 770 Barbería
  const b3 = await Barbero.create({
    nombre: "Santiago Ruiz",
    local: LOCAL,
    celular: "3025556677",
    ciudad: CIUDAD,
    direccion: DIRECCION,
    email: "santiago@citasbarber.com",
    estado: ESTADO_BARBERO.ACTIVO,
    suscripcionActiva: true,
    suscripcionVence: new Date(Date.now() + 30 * 864e5),
    horario: { horaInicio: "10:00", horaFin: "20:00", diasLaborales: [2, 3, 4, 5, 6] },
    datosPago: { nequi: "302 555 6677" },
    redes: { instagram: "@santi.fade", tiktok: "@santi.fade" },
    planes: PLANES_DEFAULT,
  });
  await Usuario.create({
    role: ROLES.BARBERO, nombre: b3.nombre, email: b3.email, passwordHash: claveBarbero, barbero: b3._id,
  });

  // Barbero 4 (pendiente, para probar la aprobación del admin) — aspira a entrar a 770
  const b4 = await Barbero.create({
    nombre: "Jhon Torres",
    local: LOCAL,
    celular: "3027778899",
    ciudad: CIUDAD,
    direccion: DIRECCION,
    email: "jhon@citasbarber.com",
    estado: ESTADO_BARBERO.PENDIENTE,
    planes: [],
  });
  await Usuario.create({
    role: ROLES.BARBERO, nombre: b4.nombre, email: b4.email, passwordHash: claveBarbero, barbero: b4._id,
  });

  // Clientes
  const cli1 = await Cliente.create({ nombre: "Juan Pérez", celular: "573201234567" });
  await Cliente.create({ nombre: "María López", celular: "573109876543" });

  // Citas de ejemplo para el barbero 1
  const bronce = b1.planes.find((p) => p.key === "bronce");
  const plata = b1.planes.find((p) => p.key === "plata");
  const hoy = fechaMasDias(0);
  const manana = fechaMasDias(1);

  await Cita.create({
    barbero: b1._id, cliente: cli1._id, clienteNombre: cli1.nombre, clienteCelular: cli1.celular,
    plan: "bronce", planSnapshot: snapshot(bronce),
    fecha: hoy, horaInicio: "11:00", horaFin: minAHhmm(hhmmAMin("11:00") + bronce.duracion),
    metodoPago: "efectivo", estado: ESTADO_CITA.CONFIRMADA,
  });
  await Cita.create({
    barbero: b1._id, clienteNombre: "María López", clienteCelular: "573109876543",
    plan: "plata", planSnapshot: snapshot(plata),
    fecha: manana, horaInicio: "10:00", horaFin: minAHhmm(hhmmAMin("10:00") + plata.duracion),
    metodoPago: "nequi",
    pagoAnticipo: { requerido: true, monto: Math.round((plata.precio * plata.anticipo) / 100), estado: "pendiente", comprobante: "" },
    estado: ESTADO_CITA.SOLICITADA,
  });

  console.log(`✅ Seed listo. Admin: ${adminEmail} / ${adminPass}`);
  console.log("   Barberos de 770 Barbería: brahian@, andres@, santiago@citasbarber.com (clave: barbero123)");
  return true;
}
