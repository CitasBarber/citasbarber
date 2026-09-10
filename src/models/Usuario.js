import mongoose from "mongoose";
import { ROLES } from "@/lib/constants";

// Usuario con credenciales (admin y barbero). El cliente NO usa este modelo.
const UsuarioSchema = new mongoose.Schema(
  {
    role: { type: String, enum: Object.values(ROLES), required: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordTemporal: { type: Boolean, default: false },
    // Solo para role=barbero: referencia al documento Barbero
    barbero: { type: mongoose.Schema.Types.ObjectId, ref: "Barbero" },
  },
  { timestamps: true }
);

export default mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema);
