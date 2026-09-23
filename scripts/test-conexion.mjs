// Prueba rápida de conexión a MongoDB. Uso: node scripts/test-conexion.mjs
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Carga MONGODB_URI desde .env.local sin dependencias extra
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ No hay MONGODB_URI en .env.local");
  process.exit(1);
}

try {
  console.log("⏳ Conectando a MongoDB Atlas…");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log("✅ Conexión exitosa.");
  console.log("   Base de datos:", mongoose.connection.name);
  console.log("   Colecciones:", cols.length ? cols.map((c) => c.name).join(", ") : "(vacía, aún sin datos)");
  await mongoose.disconnect();
  process.exit(0);
} catch (e) {
  console.error("❌ Falló la conexión:", e.message);
  process.exit(1);
}
