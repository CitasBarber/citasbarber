"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarioIcon } from "@/components/Icons";
import {
  generarGoogleCalendarUrl,
  generarIcsCita,
  descargarIcs,
} from "@/lib/calendario";

export default function BotonCalendarioCita({ cita }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [abierto]);

  function handleGoogle() {
    setAbierto(false);
    const url = generarGoogleCalendarUrl(cita);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleIcs() {
    setAbierto(false);
    const nombreLimpio = (cita.clienteNombre || "cliente").replace(/\s+/g, "_");
    const ics = generarIcsCita(cita);
    descargarIcs(`cita_${nombreLimpio}_${cita.fecha}`, ics);
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="btn-outline text-sm py-1.5 flex items-center gap-1.5"
        onClick={() => setAbierto(!abierto)}
        title="Agregar al calendario"
      >
        <CalendarioIcon className="w-3.5 h-3.5 text-barber-gray" />
        <span>Calendario</span>
      </button>

      {abierto && (
        <div className="absolute left-0 mt-1 w-48 rounded-lg bg-white dark:bg-stone-900 shadow-lg border border-stone-200 dark:border-stone-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-xs hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-200"
            onClick={handleGoogle}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            Google Calendar
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-xs hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-200"
            onClick={handleIcs}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            Calendario Celular (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
