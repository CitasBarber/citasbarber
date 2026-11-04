"use client";

import { useBrand } from "./BrandProvider";

// Selector de submarca (CitasBarber / CitasPet / CitasSpa). Cada botón pinta
// "Citas" con el color de SU marca, no con el de la activa, para que se
// reconozcan antes de escogerlas. En pantallas angostas pasa a un <select>
// compacto para no generar scroll horizontal.
export default function BrandSwitcher() {
  const { id, setMarca, marcas } = useBrand();

  return (
    <>
      <div role="group" aria-label="Marca" className="hidden sm:flex items-center gap-1">
        {marcas.map((m) => {
          const activa = m.id === id;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={activa}
              onClick={() => setMarca(m.id)}
              className={`relative min-h-[44px] px-2.5 rounded-md font-display font-semibold text-xl lg:text-2xl tracking-wide transition-[opacity,background-color] duration-200 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hueso ${
                activa ? "bg-white/[.08] opacity-100" : "opacity-70 hover:opacity-100"
              }`}
            >
              <span style={{ color: m.colores.brandOnDark }}>Citas</span>
              <span className="text-hueso">{m.nicho}</span>
              {activa && (
                <span
                  aria-hidden="true"
                  className="absolute left-2.5 right-2.5 bottom-1 h-[3px] rounded-full"
                  style={{ background: m.colores.brandOnDark }}
                />
              )}
            </button>
          );
        })}
      </div>

      <label className="sm:hidden relative inline-flex items-center">
        <span className="sr-only">Marca</span>
        <select
          value={id}
          onChange={(e) => setMarca(e.target.value)}
          className="appearance-none min-h-[44px] rounded-md bg-white/[.08] border border-white/20 pl-3 pr-8 font-display font-semibold text-lg tracking-wide text-hueso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hueso"
        >
          {marcas.map((m) => (
            <option key={m.id} value={m.id} className="text-tinta">
              {m.nombre}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute right-2.5 text-hueso/70 text-xs">▼</span>
      </label>
    </>
  );
}
