"use client";

import { CalendarioIcon } from "@/components/Icons";
import { formatearHora12 } from "@/lib/disponibilidad";
import {
  generarGoogleCalendarUrl,
  generarIcsCita,
  generarIcsDia,
  descargarIcs,
} from "@/lib/calendario";

export default function ModalCitaConfirmada({
  cita,
  citasConfirmadasDelDia = [],
  onCerrar,
}) {
  if (!cita) return null;

  const totalDelDia = citasConfirmadasDelDia.length;
  const hayMasCitas = totalDelDia > 1;

  function handleGoogleCalendar() {
    const url = generarGoogleCalendarUrl(cita);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleIcsCita() {
    const nombreLimpio = (cita.clienteNombre || "cliente").replace(/\s+/g, "_");
    const ics = generarIcsCita(cita);
    descargarIcs(`cita_${nombreLimpio}_${cita.fecha}`, ics);
  }

  function handleIcsDiaCompleto() {
    const ics = generarIcsDia(citasConfirmadasDelDia);
    descargarIcs(`citas_dia_${cita.fecha}`, ics);
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-[2px]"
      onClick={onCerrar}
    >
      <div
        className="card w-full max-w-sm p-6 space-y-4 shadow-xl border border-barber-gold/20"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarioIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg leading-tight text-barber-dark">¡Cita confirmada!</h2>
            <p className="text-xs text-barber-gray mt-0.5">
              {formatearHora12(cita.horaInicio)} · {cita.clienteNombre}
            </p>
          </div>
        </div>

        <p className="text-sm text-barber-gray">
          ¿Deseas agregar esta cita a tu calendario personal?
        </p>

        {/* Opciones individuales */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="btn-outline text-xs py-2 px-2 flex items-center justify-center gap-1.5 hover:border-barber-blue hover:text-barber-blue"
            onClick={handleGoogleCalendar}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            Google Calendar
          </button>
          <button
            type="button"
            className="btn-outline text-xs py-2 px-2 flex items-center justify-center gap-1.5 hover:border-barber-gold hover:text-barber-gold"
            onClick={handleIcsCita}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            Calendario Celular
          </button>
        </div>

        {/* Opción en bloque si hay más citas ese día */}
        {hayMasCitas && (
          <div className="p-3 bg-barber-cream/40 dark:bg-stone-800/40 rounded-lg border border-stone-200/60 space-y-2">
            <p className="text-xs text-barber-gray">
              Tienes <strong className="text-barber-dark">{totalDelDia} citas confirmadas</strong> para este día.
            </p>
            <button
              type="button"
              className="w-full btn-outline text-xs py-2 border-dashed border-barber-gold text-barber-gold hover:bg-barber-gold/10 font-medium flex items-center justify-center gap-1.5"
              onClick={handleIcsDiaCompleto}
            >
              <CalendarioIcon className="w-3.5 h-3.5" />
              Guardar las {totalDelDia} citas en el celular (.ics)
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            className="btn-dark text-xs py-2 px-4"
            onClick={onCerrar}
            autoFocus
          >
            Listo, continuar
          </button>
        </div>
      </div>
    </div>
  );
}
