"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import EstadoBadge from "@/components/EstadoBadge";
import { WhatsAppIcon, Tijeras } from "@/components/Icons";
import { formatoCOP } from "@/lib/constants";
import { fechaLocalHoy } from "@/lib/disponibilidad";
import { useDialog } from "@/components/DialogProvider";

const LS_CELULAR_KEY = "cb_cliente_celular";

function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function MisCitasPage() {
  const { confirmar } = useDialog();
  const [celular, setCelular] = useState("");
  const [datos, setDatos] = useState(null); // { proximas: [], historial: [] }
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("proximas"); // 'proximas' | 'historial'
  const [consultado, setConsultado] = useState(false);

  const hoy = fechaLocalHoy();

  const consultar = useCallback(async (celularAConsultar) => {
    const num = celularAConsultar || celular;
    if (!num || num.replace(/\D/g, "").length < 10) return;

    setError("");
    setCargando(true);
    try {
      const res = await fetch(`/api/citas/consulta?celular=${encodeURIComponent(num)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error al consultar las citas");

      setDatos({
        proximas: d.proximas || [],
        historial: d.historial || [],
      });
      setConsultado(true);

      // Predeterminado siempre en próximas citas
      setTab("proximas");

      // Guardar en localStorage para recordar al cliente
      try {
        localStorage.setItem(LS_CELULAR_KEY, num);
      } catch {}
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [celular]);

  // Cargar número guardado al iniciar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(LS_CELULAR_KEY);
      if (guardado && guardado.length >= 10) {
        setCelular(guardado);
        consultar(guardado);
      }
    } catch {}
  }, [consultar]);

  async function cancelar(id) {
    const ok = await confirmar({
      titulo: "Cancelar cita",
      mensaje: "¿Seguro que deseas cancelar esta cita?",
      confirmarLabel: "Sí, cancelar",
      cancelarLabel: "No",
      peligro: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/citas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "cancelar", celular }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);
    consultar();
  }

  function limpiarNumero() {
    setCelular("");
    setDatos(null);
    setConsultado(false);
    try {
      localStorage.removeItem(LS_CELULAR_KEY);
    } catch {}
  }

  const totalProximas = datos?.proximas?.length || 0;
  const totalHistorial = datos?.historial?.length || 0;
  const totalCitas = totalProximas + totalHistorial;

  return (
    <div className="min-h-screen">
      <Header>
        <Link href="/" className="hover:text-barber-red text-sm font-semibold">
          Inicio
        </Link>
      </Header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <h1 className="font-display text-3xl">Mis Citas</h1>
        <p className="text-barber-gray text-sm mt-1">
          Consulta el estado de tus reservas activas y tu historial.
        </p>

        {/* Formulario de consulta */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            consultar();
          }}
          className="card p-4 sm:p-5 mt-4 flex flex-col sm:flex-row gap-3 sm:items-end"
        >
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Número de Celular</label>
              {consultado && (
                <button
                  type="button"
                  onClick={limpiarNumero}
                  className="text-xs text-barber-gray hover:text-barber-red underline"
                >
                  Consultar otro número
                </button>
              )}
            </div>
            <input
              className="input"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Ej: 3001234567"
              inputMode="numeric"
            />
          </div>
          <button
            className="btn-primary w-full sm:w-auto min-w-[120px]"
            disabled={cargando || celular.replace(/\D/g, "").length < 10}
          >
            {cargando ? "Buscando…" : "Consultar"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {/* Si ya consultó y no existe ninguna cita */}
        {consultado && totalCitas === 0 && (
          <div className="card p-8 mt-6 text-center space-y-3">
            <p className="text-lg font-semibold text-barber-ink">
              No encontramos citas asociadas a este número
            </p>
            <p className="text-sm text-barber-gray max-w-md mx-auto">
              Verifica que el número esté bien escrito o agenda tu primera cita ahora mismo.
            </p>
            <div className="pt-2">
              <Link href="/" className="btn-primary text-sm inline-flex">
                Agendar mi primera cita
              </Link>
            </div>
          </div>
        )}

        {/* Si tiene citas, mostrar el sistema de pestañas */}
        {consultado && totalCitas > 0 && (
          <div className="mt-6 space-y-4">
            {/* Pestañas de navegación */}
            <div className="flex border-b border-black/10 gap-2">
              <button
                onClick={() => setTab("proximas")}
                className={`pb-2.5 px-3 font-semibold text-sm border-b-2 transition flex items-center gap-1.5 ${
                  tab === "proximas"
                    ? "border-barber-red text-barber-red"
                    : "border-transparent text-barber-gray hover:text-barber-ink"
                }`}
              >
                <span>Próximas citas</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tab === "proximas"
                      ? "bg-barber-red/10 text-barber-red font-bold"
                      : "bg-black/5 text-barber-gray"
                  }`}
                >
                  {totalProximas}
                </span>
              </button>

              <button
                onClick={() => setTab("historial")}
                className={`pb-2.5 px-3 font-semibold text-sm border-b-2 transition flex items-center gap-1.5 ${
                  tab === "historial"
                    ? "border-barber-red text-barber-red"
                    : "border-transparent text-barber-gray hover:text-barber-ink"
                }`}
              >
                <span>Historial</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tab === "historial"
                      ? "bg-barber-red/10 text-barber-red font-bold"
                      : "bg-black/5 text-barber-gray"
                  }`}
                >
                  {totalHistorial}
                </span>
              </button>
            </div>

            {/* CONTENIDO PESTAÑA: PRÓXIMAS CITAS */}
            {tab === "proximas" && (
              <div className="space-y-4">
                {totalProximas === 0 ? (
                  <div className="card p-8 text-center space-y-3">
                    <p className="font-semibold text-barber-ink">
                      No tienes citas activas ni programadas
                    </p>
                    <p className="text-sm text-barber-gray">
                      ¿Necesitas un corte o mantenimiento? Agenda tu espacio en segundos.
                    </p>
                    <div className="pt-2">
                      <Link href="/" className="btn-primary text-sm inline-flex">
                        Agendar nueva cita
                      </Link>
                    </div>
                  </div>
                ) : (
                  datos.proximas.map((c, index) => {
                    const esHoy = c.fecha === hoy;
                    const esPrimera = index === 0;

                    return (
                      <div
                        key={c.id}
                        className={`card p-5 transition ${
                          esPrimera
                            ? "border-2 border-barber-red/40 shadow-md bg-gradient-to-br from-white to-red-50/20"
                            : ""
                        }`}
                      >
                        {/* Banner si es la más próxima o si es hoy */}
                        {esPrimera && (
                          <div className="mb-3 flex items-center justify-between">
                            <span
                              className={`badge text-xs font-bold ${
                                esHoy
                                  ? "bg-barber-red text-white"
                                  : "bg-barber-blue/10 text-barber-blue border border-barber-blue/20"
                              }`}
                            >
                              {esHoy ? "⚡ ¡Tu cita es HOY!" : "📌 Tu próxima cita"}
                            </span>
                            <span className="text-xs text-barber-gray capitalize">
                              {formatearFecha(c.fecha)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-display text-xl text-barber-ink">
                              {c.barberoLocal}
                            </h3>
                            <p className="text-sm text-barber-gray">
                              Barbero: <strong className="text-barber-ink">{c.barberoNombre}</strong>
                            </p>
                          </div>
                          <EstadoBadge estado={c.estado} />
                        </div>

                        <div className="mt-3 p-3 bg-neutral-100/70 rounded-xl text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-barber-gray">Horario</p>
                            <p className="font-semibold text-barber-ink">
                              {c.fecha} · {c.horaInicio} - {c.horaFin}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-barber-gray">Servicio / Plan</p>
                            <p className="font-semibold text-barber-ink">
                              {c.planSnapshot?.nombre} · {formatoCOP(c.planSnapshot?.precio)}
                            </p>
                          </div>
                        </div>

                        {c.motivoRechazo && (
                          <p className="mt-2 text-xs text-red-600">
                            <b>Motivo:</b> {c.motivoRechazo}
                          </p>
                        )}

                        {/* Botones de acción */}
                        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-black/5">
                          {["solicitada", "confirmada"].includes(c.estado) && (
                            <button
                              className="btn-outline text-xs sm:text-sm py-1.5"
                              onClick={() => cancelar(c.id)}
                            >
                              Cancelar cita
                            </button>
                          )}
                          {c.barberoCelular && (
                            <a
                              className="btn-wa text-xs sm:text-sm py-1.5"
                              href={`https://wa.me/${c.barberoCelular.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <WhatsAppIcon className="w-4 h-4" /> Escribir al barbero
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* CONTENIDO PESTAÑA: HISTORIAL */}
            {tab === "historial" && (
              <div className="space-y-3">
                {totalHistorial === 0 ? (
                  <div className="card p-8 text-center text-barber-gray text-sm">
                    Aún no tienes citas pasadas o finalizadas en tu historial.
                  </div>
                ) : (
                  datos.historial.map((c) => (
                    <div key={c.id} className="card p-4 opacity-90 hover:opacity-100 transition">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-base text-barber-ink">
                              {c.barberoLocal}
                            </h4>
                            <span className="text-xs text-barber-gray">({c.barberoNombre})</span>
                          </div>
                          <p className="text-xs text-barber-gray mt-0.5">
                            {formatearFecha(c.fecha)} ({c.fecha}) · {c.horaInicio}
                          </p>
                        </div>
                        <EstadoBadge estado={c.estado} />
                      </div>

                      <div className="mt-2 text-xs text-barber-gray flex justify-between items-center">
                        <span>
                          {c.planSnapshot?.nombre} · {formatoCOP(c.planSnapshot?.precio)}
                        </span>
                        {c.motivoRechazo && (
                          <span className="text-red-500 truncate max-w-[180px]">
                            {c.motivoRechazo}
                          </span>
                        )}
                      </div>

                      {c.barberoCelular && (
                        <div className="mt-3 pt-2 border-t border-black/5 flex justify-end">
                          <a
                            className="text-xs text-barber-gray hover:text-barber-ink flex items-center gap-1"
                            href={`https://wa.me/${c.barberoCelular.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" /> Contactar
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
