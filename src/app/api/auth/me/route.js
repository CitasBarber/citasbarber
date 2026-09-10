import { ok, handler } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const GET = handler(async () => {
  const session = getSession();
  if (!session) return ok({ session: null });
  return ok({
    session: {
      id: session.id,
      role: session.role,
      nombre: session.nombre,
      barberoId: session.barberoId || null,
      passwordTemporal: session.passwordTemporal === true,
    },
  });
});
