// Crea el admin + 2 barberos en la base de producción (Atlas).
// Idempotente: si ya existen (por email), actualiza en vez de duplicar.
// NO crea clientes ni citas de ejemplo.
//
// Uso (bash):
//   MONGODB_URI="mongodb+srv://..." node scripts/crear-datos-produccion.mjs
//
// Uso (PowerShell):
//   $env:MONGODB_URI="mongodb+srv://..."; node scripts/crear-datos-produccion.mjs

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("Falta MONGODB_URI.");
  process.exit(1);
}

// Emojis por codepoint (ASCII-safe, igual que src/lib/emojis.js)
const E = {
  TIJERAS: String.fromCodePoint(0x2702, 0xfe0f),
  MASAJE: String.fromCodePoint(0x1f486),
  BRILLO: String.fromCodePoint(0x2728),
  CERVEZA: String.fromCodePoint(0x1f37b),
  CHOCOLATE: String.fromCodePoint(0x1f36b),
};

const PLANES_DEFAULT = [
  { key: "bronce", nombre: "Bronce", servicios: [`${E.TIJERAS} Corte basico`], precio: 20000, duracion: 25, anticipo: 0, metodosPago: ["nequi", "daviplata", "qr", "cuenta", "efectivo"], activo: true },
  { key: "plata", nombre: "Plata", servicios: [`${E.TIJERAS} Corte`, `${E.MASAJE} Mascarilla puntos negros`, `${E.BRILLO} Depilacion de oidos y nariz`], precio: 45000, duracion: 55, anticipo: 50, metodosPago: ["nequi", "daviplata", "qr", "cuenta"], activo: true },
  { key: "oro", nombre: "Oro", servicios: [`${E.TIJERAS} Corte`, `${E.MASAJE} Mascarilla puntos negros`, `${E.BRILLO} Depilacion de oidos y nariz`, `${E.CERVEZA} Bebida a gusto`, `${E.CHOCOLATE} Snack`], precio: 70000, duracion: 55, anticipo: 50, metodosPago: ["nequi", "daviplata", "qr", "cuenta"], activo: true },
];

const UsuarioSchema = new mongoose.Schema(
  {
    role: String,
    nombre: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    passwordHash: String,
    passwordTemporal: { type: Boolean, default: false },
    barbero: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true, strict: false }
);
const BarberoSchema = new mongoose.Schema({}, { timestamps: true, strict: false });

const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema);
const Barbero = mongoose.models.Barbero || mongoose.model("Barbero", BarberoSchema);

const LOCAL = "CitasBarber";
const CIUDAD = "Caldas, Antioquia";
const DIRECCION = "Carrera 48 # 133 sur 50";
const vence = new Date(Date.now() + 30 * 864e5);

await mongoose.connect(MONGODB_URI, { dbName: "citasbarber" });

// --- Admin ---
const adminEmail = "admin@citasbarber.com";
await Usuario.updateOne(
  { email: adminEmail },
  { $set: { role: "admin", nombre: "Administrador", email: adminEmail, passwordHash: await bcrypt.hash("Admin123*", 10), passwordTemporal: false } },
  { upsert: true }
);
console.log(`OK admin: ${adminEmail}`);

// --- Barberos ---
const barberos = [
  { nombre: "Juan Sebastian", email: "juansebastian@citasbarber.com", celular: "3162921261", horario: { horaInicio: "09:00", horaFin: "19:00", diasLaborales: [1, 2, 3, 4, 5, 6] }, datosPago: { nequi: "316 292 1261", daviplata: "316 292 1261" }, redes: { instagram: "@juansebastian.barber" } },
  { nombre: "Andres Felipe", email: "andresfelipe@citasbarber.com", celular: "3173780801", horario: { horaInicio: "10:00", horaFin: "20:00", diasLaborales: [1, 2, 3, 4, 5, 6] }, datosPago: { nequi: "317 378 0801", daviplata: "317 378 0801" }, redes: { instagram: "@andresfelipe.barber" } },
];

const claveBarbero = await bcrypt.hash("barbero123", 10);
for (const b of barberos) {
  const doc = await Barbero.findOneAndUpdate(
    { email: b.email },
    {
      $set: {
        nombre: b.nombre, local: LOCAL, celular: b.celular, ciudad: CIUDAD, direccion: DIRECCION, email: b.email,
        estado: "activo", suscripcionActiva: true, suscripcionVence: vence,
        horario: b.horario, datosPago: b.datosPago, redes: b.redes, planes: PLANES_DEFAULT,
      },
    },
    { upsert: true, new: true }
  );
  await Usuario.updateOne(
    { email: b.email },
    { $set: { role: "barbero", nombre: b.nombre, email: b.email, passwordHash: claveBarbero, barbero: doc._id, passwordTemporal: false } },
    { upsert: true }
  );
  console.log(`OK barbero: ${b.nombre} <${b.email}>`);
}

await mongoose.disconnect();
console.log("Listo.");
process.exit(0);
