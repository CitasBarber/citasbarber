"use client";

import { LISTA_MARCAS } from "@/lib/brands";

// Escoge la submarca de un negocio (CitasBarber, CitasPet, CitasSpa). Define
// los colores de su página de agendar y la firma de sus mensajes.
export default function SelectorMarcaNegocio({ value, onChange }) {
  return (
    <div>
      <span className="label">Marca del negocio *</span>
      <div role="radiogroup" aria-label="Marca del negocio" className="grid grid-cols-3 gap-1.5">
        {LISTA_MARCAS.map((m) => {
          const activa = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={activa}
              onClick={() => onChange(m.id)}
              className={`rounded-lg border-2 px-2 py-2 font-display font-semibold text-sm sm:text-base tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta ${
                activa ? "bg-tinta text-hueso" : "border-linea bg-white text-tinta hover:border-tinta"
              }`}
              style={activa ? { borderColor: m.colores.brand } : undefined}
            >
              <span style={{ color: activa ? m.colores.brandOnDark : m.colores.brandDeep }}>Citas</span>
              {m.nicho}
            </button>
          );
        })}
      </div>
    </div>
  );
}
