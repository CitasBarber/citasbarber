import { dbConnect } from "@/lib/db";
import Cita from "@/models/Cita";
import Barbero from "@/models/Barbero";
import { ok, fail, handler } from "@/lib/api";
import { normalizarCelular } from "@/lib/whatsapp";
import { serializarCita } from "@/lib/serializers";

// GET /api/citas/consulta?celular=...  -> el cliente consulta sus citas por celular
export const GET = handler(async (req) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const celularRaw = searchParams.get("celular");
  if (!celularRaw) return fail("El celular es obligatorio");

  const celular = normalizarCelular(celularRaw);
  const citas = await Cita.find({ clienteCelular: celular })
    .sort({ fecha: -1, horaInicio: -1 })
    .lean();

  // Adjuntar datos del barbero
  const barberoIds = [...new Set(citas.map((c) => c.barbero.toString()))];
  const barberos = await Barbero.find({ _id: { $in: barberoIds } })
    .select("nombre local celular")
    .lean();
  const mapaBarbero = {};
  for (const b of barberos) mapaBarbero[b._id.toString()] = b;

  const data = citas.map((c) => {
    const b = mapaBarbero[c.barbero.toString()];
    return {
      ...serializarCita(c),
      barberoNombre: b?.nombre,
      barberoLocal: b?.local,
      barberoCelular: b?.celular,
    };
  });

  return ok({ citas: data });
});
