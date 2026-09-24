// Limpia barberos duplicados generados por seeds concurrentes (dev).
// Uso: detené `npm run dev` y ejecutá `node scripts/limpiar-duplicados.mjs`
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import { mkdirSync, rmSync, existsSync } from "fs";

const dbPath = path.join(process.cwd(), ".mongo-memory");
mkdirSync(dbPath, { recursive: true });
const lockFile = path.join(dbPath, "mongod.lock");
if (existsSync(lockFile)) {
  console.error("Parece que el servidor dev está corriendo (mongod.lock presente).");
  console.error("Detené `npm run dev` y volvé a ejecutar este script.");
  process.exit(1);
}

const mongod = await MongoMemoryServer.create({
  instance: { dbName: "citasbarber", storageEngine: "wiredTiger", dbPath },
});
await mongoose.connect(mongod.getUri(), { dbName: "citasbarber", bufferCommands: false });
const db = mongoose.connection.db;

const barberos = await db.collection("barberos").find({}).toArray();
const usuarios = await db.collection("usuarios").find({}).toArray();
const citas = await db.collection("citas").find({}).toArray();

const idCitas = new Set(citas.map((c) => c.barbero?.toString()).filter(Boolean));
const idUsuarioPorBarbero = new Map(
  usuarios.filter((u) => u.barbero).map((u) => [u.barbero.toString(), u._id])
);

const porEmail = new Map();
for (const b of barberos) {
  const k = (b.email || "").toLowerCase();
  if (!porEmail.has(k)) porEmail.set(k, []);
  porEmail.get(k).push(b);
}

const aBorrar = [];
for (const [email, grupo] of porEmail) {
  if (grupo.length <= 1) continue;
  grupo.sort((a, b) => {
    const aRef = idCitas.has(a._id.toString()) ? 0 : 1;
    const bRef = idCitas.has(b._id.toString()) ? 0 : 1;
    if (aRef !== bRef) return aRef - bRef;
    return a._id.toString().localeCompare(b._id.toString());
  });
  for (const extra of grupo.slice(1)) aBorrar.push(extra._id.toString());
}

if (aBorrar.length === 0) {
  console.log("No hay duplicados que limpiar.");
} else {
  console.log(`Eliminando ${aBorrar.length} barbero(s) duplicado(s) y su(s) usuario(s):`);
  for (const id of aBorrar) {
    const b = barberos.find((x) => x._id.toString() === id);
    const uid = idUsuarioPorBarbero.get(id);
    console.log(
      `- ${id} ${b?.nombre || ""} (${b?.email})` + (uid ? ` + usuario ${uid}` : "")
    );
  }
  const ids = aBorrar.map((id) => new mongoose.Types.ObjectId(id));
  await db.collection("barberos").deleteMany({ _id: { $in: ids } });
  await db.collection("usuarios").deleteMany({ barbero: { $in: ids } });
  console.log("Duplicados eliminados.");
}

await mongoose.disconnect();
await mongod.stop();
process.exit(0);