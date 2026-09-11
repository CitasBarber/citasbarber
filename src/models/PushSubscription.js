import mongoose from "mongoose";
import { ROLES } from "@/lib/constants";

// Suscripción a notificaciones Web Push de un dispositivo/navegador concreto.
// Un mismo dueño (barbero o admin) puede tener varias (celular, PC, etc.).
// El endpoint es único: si el navegador re-suscribe, se actualiza la existente.
const PushSubscriptionSchema = new mongoose.Schema(
  {
    // A quién pertenece: para barbero -> _id del Barbero; para admin -> _id del Usuario.
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ownerRole: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.BARBERO],
      required: true,
    },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

PushSubscriptionSchema.index({ ownerRole: 1, ownerId: 1 });

export default mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);
