import { notFound } from "next/navigation";
import { marcaPorSlug } from "@/lib/brands";
import MarcaForzada from "@/components/MarcaForzada";

// Layout server-side para todas las rutas /page/[marca]/*.
// Valida el slug, e inyecta MarcaForzada para que el cliente aplique la marca
// sin flash (el scriptMarcaInicial en <head> ya la detectó desde la URL).
export default function MarcaLayout({ children, params }) {
  const cfg = marcaPorSlug(params.marca);
  if (!cfg) notFound();

  return (
    <>
      <MarcaForzada marcaId={cfg.id} />
      {children}
    </>
  );
}

export function generateStaticParams() {
  return [
    { marca: "citasbarber" },
    { marca: "citaspet" },
    { marca: "citasspa" },
  ];
}
