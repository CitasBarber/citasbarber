// Crea (o actualiza la contraseña de) el usuario administrador en producción.
// El seed automático no corre en producción, así que este script es la forma
// segura de crear el admin con una contraseña fuerte.
//
// Uso (PowerShell):
//   $env:MONGODB_URI="mongodb+srv://..."; `
//   $env:ADMIN_EMAIL="tu@correo.com"; `
//   $env:ADMIN_PASSWORD="una-contraseña-larga-y-fuerte"; `
//   node scripts/crear-admin.mjs
//
// Uso (bash):
//   MONGODB_URI="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node scripts/crear-admin.mjs

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Faltan variables: MONGODB_URI, ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias.");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
  process.exit(1);
}

const UsuarioSchema = new mongoose.Schema(
  {
    role: String,
    nombre: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    passwordHash: String,
    passwordTemporal: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema);

const email = ADMIN_EMAIL.toLowerCase().trim();

await mongoose.connect(MONGODB_URI, { dbName: "citasbarber" });
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

const res = await Usuario.updateOne(
  { email },
  { $set: { role: "admin", nombre: "Administrador", email, passwordHash, passwordTemporal: false } },
  { upsert: true }
);

console.log(res.upsertedCount ? `✅ Admin creado: ${email}` : `✅ Contraseña de admin actualizada: ${email}`);
await mongoose.disconnect();
process.exit(0);
