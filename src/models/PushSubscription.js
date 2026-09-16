import mongoose from "mongoose";
import { ROLES } from "@/lib/constants";

// Suscripción a notificaciones Web Push de un dispositivo/navegador concreto.
// - Barbero/admin: pertenece a un `ownerId` (su documento) y `ownerRole`.
// - Cliente: no tiene login; se identifica por `clienteCelular` (normalizado).
// Un mismo dueño puede tener varias (celular, PC, etc.). El endpoint es único:
// si el navegador re-suscribe, se actualiza la existente.
const PushSubscriptionSchema = new mongoose.Schema(
  {
    // Para barbero -> _id del Barbero; para admin -> _id del Usuario.
    // Para cliente queda vacío (se usa `clienteCelular`).
    ownerId: { type: mongoose.Schema.Types.ObjectId },
    ownerRole: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.BARBERO, "cliente"],
      required: true,
    },
    // Celular normalizado (57XXXXXXXXXX) del cliente dueño de la suscripción.
    clienteCelular: { type: String, default: "" },
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
PushSubscriptionSchema.index({ ownerRole: 1, clienteCelular: 1 });

export default mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);
