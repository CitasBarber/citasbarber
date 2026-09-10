import mongoose from "mongoose";

// El cliente se identifica únicamente por celular (sin contraseña).
const ClienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    celular: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Cliente || mongoose.model("Cliente", ClienteSchema);
