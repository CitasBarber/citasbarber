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

// Crea datos de ejemplo si la base está vacía (sin usuarios) o si tiene datos viejos.
export async function seedIfEmpty() {
  const brahian = await Usuario.findOne({ email: "brahian@citasbarber.com" });
  const yaHay = await Usuario.countDocuments();
  if (brahian) {
    console.log("🔄 Actualizando base de datos con los nuevos barberos...");
    await Usuario.deleteMany({});
    await Barbero.deleteMany({});
    await Cita.deleteMany({});
    await Cliente.deleteMany({});
  } else if (yaHay > 0) {
    return false;
  }

  console.log("🌱 Sembrando datos de ejemplo…");

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@citasbarber.com").toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || "Admin123*";

  // Admin
  await Usuario.create({
    role: ROLES.ADMIN,
    nombre: "Administrador",
    email: adminEmail,
    passwordHash: await hashPassword(adminPass),
  });

  const claveBarbero = await hashPassword("barbero123");
  const LOCAL = "CitasBarber";
  const CIUDAD = "Caldas, Antioquia";
  const DIRECCION = "Carrera 48 # 133 sur 50";

  // Barbero 1: Juan Sebastian
  const b1 = await Barbero.create({
    nombre: "Juan Sebastian",
    local: LOCAL,
    celular: "3162921261",
    ciudad: CIUDAD,
    direccion: DIRECCION,
    email: "juansebastian@citasbarber.com",
    estado: ESTADO_BARBERO.ACTIVO,
    suscripcionActiva: true,
    suscripcionVence: new Date(Date.now() + 30 * 864e5),
    horario: { horaInicio: "09:00", horaFin: "19:00", diasLaborales: [1, 2, 3, 4, 5, 6] },
    datosPago: { nequi: "316 292 1261", daviplata: "316 292 1261" },
    redes: { instagram: "@juansebastian.barber" },
    planes: PLANES_DEFAULT,
  });
  await Usuario.create({
    role: ROLES.BARBERO,
    nombre: b1.nombre,
    email: b1.email,
    passwordHash: claveBarbero,
    barbero: b1._id,
  });

  // Barbero 2: Andres Felipe
  const b2 = await Barbero.create({
    nombre: "Andres Felipe",
    local: LOCAL,
    celular: "3173780801",
    ciudad: CIUDAD,
    direccion: DIRECCION,
    email: "andresfelipe@citasbarber.com",
    estado: ESTADO_BARBERO.ACTIVO,
    suscripcionActiva: true,
    suscripcionVence: new Date(Date.now() + 30 * 864e5),
    horario: { horaInicio: "10:00", horaFin: "20:00", diasLaborales: [1, 2, 3, 4, 5, 6] },
    datosPago: { nequi: "317 378 0801", daviplata: "317 378 0801" },
    redes: { instagram: "@andresfelipe.barber" },
    planes: PLANES_DEFAULT,
  });
  await Usuario.create({
    role: ROLES.BARBERO,
    nombre: b2.nombre,
    email: b2.email,
    passwordHash: claveBarbero,
    barbero: b2._id,
  });

  // Clientes
  const cli1 = await Cliente.create({ nombre: "Carlos Gómez", celular: "573201234567" });
  await Cliente.create({ nombre: "María López", celular: "573109876543" });

  // Citas de ejemplo para Juan Sebastian
  const bronce = b1.planes.find((p) => p.key === "bronce");
  const plata = b1.planes.find((p) => p.key === "plata");
  const hoy = fechaMasDias(0);
  const manana = fechaMasDias(1);

  await Cita.create({
    barbero: b1._id,
    cliente: cli1._id,
    clienteNombre: cli1.nombre,
    clienteCelular: cli1.celular,
    plan: "bronce",
    planSnapshot: snapshot(bronce),
    fecha: hoy,
    horaInicio: "11:00",
    horaFin: minAHhmm(hhmmAMin("11:00") + bronce.duracion),
    metodoPago: "efectivo",
    estado: ESTADO_CITA.CONFIRMADA,
  });
  await Cita.create({
    barbero: b1._id,
    clienteNombre: "María López",
    clienteCelular: "573109876543",
    plan: "plata",
    planSnapshot: snapshot(plata),
    fecha: manana,
    horaInicio: "10:00",
    horaFin: minAHhmm(hhmmAMin("10:00") + plata.duracion),
    metodoPago: "nequi",
    pagoAnticipo: {
      requerido: true,
      monto: Math.round((plata.precio * plata.anticipo) / 100),
      estado: "pendiente",
      comprobante: "",
    },
    estado: ESTADO_CITA.SOLICITADA,
  });

  console.log("✅ Seed de desarrollo listo. Consulta .env.example para las credenciales locales.");
  return true;
}
