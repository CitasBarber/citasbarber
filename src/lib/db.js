import mongoose from "mongoose";
import path from "path";

// Conexión a MongoDB con caché global (evita múltiples conexiones en dev/serverless).
// Si no hay MONGODB_URI en desarrollo, arranca un MongoDB en memoria automáticamente.

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function resolveUri() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== "") {
    return process.env.MONGODB_URI.trim();
  }

  // Sin URI: usamos MongoDB en memoria (solo desarrollo/pruebas).
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "MONGODB_URI es obligatoria en producción. Configúrala en las variables de entorno."
    );
  }

  if (!global._mongoMemory) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const { mkdirSync, rmSync, existsSync } = await import("fs");
    const dbPath = path.join(process.cwd(), ".mongo-memory");
    mkdirSync(dbPath, { recursive: true });
    // Eliminar lock file si quedó de un cierre forzado
    const lockFile = path.join(dbPath, "mongod.lock");
    if (existsSync(lockFile)) rmSync(lockFile);
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: "citasbarber",
        storageEngine: "wiredTiger",
        dbPath,
      },
    });
    global._mongoMemory = mongod;
    console.log("🧪 MongoDB en memoria iniciado (desarrollo).");
  }
  return global._mongoMemory.getUri();
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await resolveUri();
      return mongoose.connect(uri, {
        bufferCommands: false,
        dbName: "citasbarber",
      });
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  // Auto-seed: si la base está vacía, se cargan datos de ejemplo (una sola vez).
  if (!global._seedDone) {
    global._seedDone = true;
    try {
      const { seedIfEmpty } = await import("./seed");
      await seedIfEmpty();
    } catch (e) {
      console.error("Error en el seed automático:", e.message);
    }
  }

  return cached.conn;
}

export default dbConnect;
