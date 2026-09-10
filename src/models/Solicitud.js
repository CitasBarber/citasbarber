import mongoose from "mongoose";

// Solicitud de contacto: un barbero/local interesado en tener la app escribe
// al admin desde la página principal. El admin la ve en su panel.
const SolicitudSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    celular: { type: String, required: true, trim: true },
    local: { type: String, default: "", trim: true },
    mensaje: { type: String, required: true, trim: true },
    estado: { type: String, enum: ["nueva", "atendida"], default: "nueva" },
  },
  { timestamps: true }
);

SolicitudSchema.index({ estado: 1, createdAt: -1 });

export default mongoose.models.Solicitud ||
  mongoose.model("Solicitud", SolicitudSchema);
