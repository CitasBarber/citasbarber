"use client";

import { useEffect, useState } from "react";
import { formatoCOP } from "@/lib/constants";
import { fechaLocalHoy } from "@/lib/disponibilidad";

export default function ResumenDiario() {
  const [fecha, setFecha] = useState(fechaLocalHoy());
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/barbero/resumen?fecha=${fecha}`)
      .then((r) => r.json())
      .then(setData);
  }, [fecha]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <input type="date" className="input max-w-[180px]" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button className="btn-outline text-sm py-1.5" onClick={() => setFecha(fechaLocalHoy())}>Hoy</button>
      </div>

      {!data ? (
        <p className="text-barber-gray">Cargando…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Tarjeta titulo="Citas del día" valor={data.totalCitas} />
            <Tarjeta titulo="Ingresos estimados" valor={formatoCOP(data.ingresosTotales)} />
            <Tarjeta titulo="Completadas" valor={data.completadas} />
          </div>

          <h3 className="font-display text-lg mt-6 mb-2">Desglose por plan</h3>
          <div className="card divide-y">
            {["bronce", "plata", "oro"].map((k) => (
              <div key={k} className="flex justify-between p-3">
                <span className="capitalize font-semibold">{k}</span>
                <span className="text-sm text-barber-gray">
                  {data.desglose[k].cantidad} citas · {formatoCOP(data.desglose[k].ingresos)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Tarjeta({ titulo, valor }) {
  return (
    <div className="card p-5 text-center">
      <p className="text-3xl font-display text-barber-red">{valor}</p>
      <p className="text-sm text-barber-gray mt-1">{titulo}</p>
    </div>
  );
}
