import mongoose from "mongoose";
import { ESTADO_CITA } from "@/lib/constants";

const CitaSchema = new mongoose.Schema(
  {
    barbero: { type: mongoose.Schema.Types.ObjectId, ref: "Barbero", required: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente" }, // null en citas manuales sin registro
    clienteNombre: { type: String, required: true },
    clienteCelular: { type: String, default: "" },

    plan: { type: String, required: true }, // bronce | plata | oro
    // Copia inmutable del plan al momento de agendar (precio/servicios/duración)
    planSnapshot: {
      key: String,
      nombre: String,
      servicios: [String],
      precio: Number,
      duracion: Number,
      anticipo: Number,
    },

    fecha: { type: String, required: true }, // 'YYYY-MM-DD'
    horaInicio: { type: String, required: true }, // 'HH:mm'
    horaFin: { type: String, required: true }, // 'HH:mm'

    metodoPago: String, // nequi | daviplata | qr | cuenta | efectivo
    pagoAnticipo: {
      requerido: { type: Boolean, default: false },
      monto: Number,
      comprobante: String, // base64 de la imagen
      estado: { type: String, default: "pendiente" }, // pendiente | recibido
    },

    estado: {
      type: String,
      enum: Object.values(ESTADO_CITA),
      default: ESTADO_CITA.SOLICITADA,
    },
    esManual: { type: Boolean, default: false }, // creada por el barbero para cliente presencial
    motivoRechazo: String,

    // true una vez enviado el recordatorio push "cita sin confirmar" (~15 min
    // antes de la hora). Evita que el cron lo mande más de una vez.
    recordatorioEnviado: { type: Boolean, default: false },

    // true una vez enviado al CLIENTE el recordatorio del día de su cita (a
    // partir de la hora de apertura del barbero). Evita repetirlo.
    recordatorioClienteEnviado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CitaSchema.index({ barbero: 1, fecha: 1 });
CitaSchema.index({ clienteCelular: 1 });
CitaSchema.index({ clienteCelular: 1, fecha: -1, horaInicio: -1 });

export default mongoose.models.Cita || mongoose.model("Cita", CitaSchema);
