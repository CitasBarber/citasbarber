"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EstadoBadge from "@/components/EstadoBadge";
import EditorPlanes from "@/components/admin/EditorPlanes";
import EditorInfoBarbero from "@/components/admin/EditorInfoBarbero";
import ActivarNotificaciones from "@/components/ActivarNotificaciones";

const FILTROS = [
  { key: "pendiente", label: "Pendientes" },
  { key: "activo", label: "Activos" },
  { key: "inactivo", label: "Inactivos" },
  { key: "rechazado", label: "Rechazados" },
  { key: "", label: "Todos" },
];

export default function AdminPanelPage() {
  const router = useRouter();
  const [sesion, setSesion] = useState(undefined);
  const [filtro, setFiltro] = useState("pendiente");
  const [barberos, setBarberos] = useState([]);
  const [editando, setEditando]       = useState(null); // EditorPlanes
  const [editandoInfo, setEditandoInfo] = useState(null); // EditorInfoBarbero
  const [eliminando, setEliminando]   = useState(null); // barbero a eliminar (modal confirmación)
  const [borrando, setBorrando]       = useState(false);
  const [vista, setVista]             = useState("barberos"); // "barberos" | "solicitudes"
  const [solicitudes, setSolicitudes] = useState([]);
  const [nuevasSolicitudes, setNuevasSolicitudes] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.session || d.session.role !== "admin") { router.replace("/admin/login"); setSesion(null); }
        else setSesion(d.session);
      });
  }, [router]);

  const cargar = useCallback(() => {
    const q = filtro ? `?estado=${filtro}` : "";
    fetch(`/api/admin/barberos${q}`).then((r) => r.json()).then((d) => setBarberos(d.barberos || []));
  }, [filtro]);

  useEffect(() => { if (sesion) cargar(); }, [sesion, cargar]);

  const cargarSolicitudes = useCallback(() => {
    fetch("/api/admin/solicitudes")
      .then((r) => r.json())
      .then((d) => { setSolicitudes(d.solicitudes || []); setNuevasSolicitudes(d.nuevas || 0); });
  }, []);

  // Cargar solicitudes al entrar (para el contador) y al abrir la vista.
  useEffect(() => { if (sesion) cargarSolicitudes(); }, [sesion, cargarSolicitudes]);

  async function accionSolicitud(id, accion) {
    if (accion === "eliminar") {
      if (!window.confirm("¿Eliminar esta solicitud?")) return;
      const res = await fetch(`/api/admin/solicitudes/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); return alert(d.error || "Error"); }
    } else {
      const res = await fetch(`/api/admin/solicitudes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      if (!res.ok) { const d = await res.json(); return alert(d.error || "Error"); }
    }
    cargarSolicitudes();
  }

  const CONFIRMAR = {
    rechazar: "¿Rechazar la solicitud de este barbero?",
    desactivar: "¿Desactivar este barbero? No podrá iniciar sesión ni recibir nuevas citas.",
  };

  async function accion(id, accion) {
    if (CONFIRMAR[accion] && !window.confirm(CONFIRMAR[accion])) return;
    const res = await fetch(`/api/admin/barberos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);
    cargar();
  }

  async function eliminarBarbero() {
    if (!eliminando) return;
    setBorrando(true);
    const res = await fetch(`/api/admin/barberos/${eliminando.id}`, { method: "DELETE" });
    const d = await res.json();
    setBorrando(false);
    if (!res.ok) return alert(d.error || "Error al eliminar");
    setEliminando(null);
    cargar();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  if (sesion === undefined) return <div className="p-10 text-center text-barber-gray">Cargando…</div>;
  if (!sesion) return null;

  return (
    <div className="min-h-screen">
      <Header>
        <button onClick={logout} className="btn-outline border-white text-white hover:bg-white hover:text-barber-black text-sm py-1.5">Salir</button>
      </Header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="font-display text-3xl">Panel de administración</h1>

        <div className="mt-4">
          <ActivarNotificaciones descripcion="Recibí un aviso apenas alguien te contacte desde la web, aunque tengas la app cerrada." />
        </div>

        {/* Navegación de vistas */}
        <div className="mt-4 flex gap-2">
          <button onClick={() => setVista("barberos")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${vista === "barberos" ? "bg-barber-ink text-white" : "border"}`}>
            Barberos
          </button>
          <button onClick={() => { setVista("solicitudes"); cargarSolicitudes(); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 ${vista === "solicitudes" ? "bg-barber-ink text-white" : "border"}`}>
            Solicitudes
            {nuevasSolicitudes > 0 && (
              <span className="inline-grid place-items-center min-w-[20px] h-5 px-1.5 rounded-full bg-barber-red text-white text-xs font-bold">
                {nuevasSolicitudes}
              </span>
            )}
          </button>
        </div>

        {vista === "barberos" && (
        <>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTROS.map((f) => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold ${filtro === f.key ? "bg-barber-ink text-white" : "border"}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {barberos.length === 0 && <div className="card p-8 text-center text-barber-gray">Sin barberos en esta categoría.</div>}
          {barberos.map((b) => (
            <div key={b.id} className="card p-4">
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <div>
                  <h3 className="font-display text-lg">{b.local}</h3>
                  <p className="text-sm text-barber-gray">{b.nombre} · {b.ciudad}</p>
                  <p className="text-sm text-barber-gray mt-0.5">📱 {b.celular} · {b.email}</p>
                  {b.direccion && <p className="text-xs text-barber-gray">{b.direccion}</p>}
                  <p className="text-xs text-barber-gray mt-1">
                    {b.numCitas} cita{b.numCitas === 1 ? "" : "s"} registrada{b.numCitas === 1 ? "" : "s"}
                    {b.suscripcionVence && ` · vence ${new Date(b.suscripcionVence).toLocaleDateString("es-CO")}`}
                  </p>
                </div>
                <EstadoBadge estado={b.estado} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {b.estado === "pendiente" && (
                  <>
                    <button className="btn-blue text-sm py-1.5" onClick={() => accion(b.id, "aprobar")}>Aprobar</button>
                    <button className="btn-outline text-sm py-1.5" onClick={() => accion(b.id, "rechazar")}>Rechazar</button>
                  </>
                )}
                {b.estado === "activo" && (
                  <button className="btn-outline text-sm py-1.5" onClick={() => accion(b.id, "desactivar")}>Desactivar</button>
                )}
                {(b.estado === "inactivo" || b.estado === "rechazado") && (
                  <button className="btn-blue text-sm py-1.5" onClick={() => accion(b.id, "activar")}>Activar</button>
                )}
                <button className="btn-outline text-sm py-1.5" onClick={() => setEditandoInfo(b)}>Editar info</button>
                {["activo", "inactivo"].includes(b.estado) && (
                  <button className="btn-dark text-sm py-1.5" onClick={() => setEditando(b)}>Configurar planes</button>
                )}
                <button
                  className="text-sm py-1.5 px-3 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold ml-auto"
                  onClick={() => setEliminando(b)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
        )}

        {vista === "solicitudes" && (
          <div className="mt-6 space-y-3">
            {solicitudes.length === 0 && (
              <div className="card p-8 text-center text-barber-gray">Aún no hay solicitudes de contacto.</div>
            )}
            {solicitudes.map((s) => (
              <div key={s.id} className={`card p-4 ${s.estado === "nueva" ? "border-l-4 border-l-barber-red" : ""}`}>
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <h3 className="font-display text-lg">
                      {s.nombre}
                      {s.local && <span className="text-barber-gray text-base font-normal"> · {s.local}</span>}
                    </h3>
                    <p className="text-sm text-barber-gray mt-0.5">📱 {s.celular}</p>
                    <p className="text-xs text-barber-gray">
                      {new Date(s.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.estado === "nueva" ? "bg-barber-red text-white" : "bg-gray-200 text-barber-gray"}`}>
                    {s.estado === "nueva" ? "Nueva" : "Atendida"}
                  </span>
                </div>
                <p className="mt-3 text-sm bg-barber-cream rounded-lg p-3 whitespace-pre-wrap">{s.mensaje}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="btn-wa text-sm py-1.5" href={`https://wa.me/${s.celular.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    Responder por WhatsApp
                  </a>
                  {s.estado === "nueva" ? (
                    <button className="btn-blue text-sm py-1.5" onClick={() => accionSolicitud(s.id, "atender")}>Marcar atendida</button>
                  ) : (
                    <button className="btn-outline text-sm py-1.5" onClick={() => accionSolicitud(s.id, "reabrir")}>Reabrir</button>
                  )}
                  <button
                    className="text-sm py-1.5 px-3 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold ml-auto"
                    onClick={() => accionSolicitud(s.id, "eliminar")}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editandoInfo && (
        <EditorInfoBarbero
          barbero={editandoInfo}
          onClose={() => setEditandoInfo(null)}
          onGuardado={() => { setEditandoInfo(null); cargar(); }}
        />
      )}

      {editando && (
        <EditorPlanes
          barbero={editando}
          onClose={() => setEditando(null)}
          onGuardado={() => { setEditando(null); cargar(); }}
        />
      )}

      {eliminando && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50">
          <div className="card p-6 w-full max-w-md space-y-4">
            <h2 className="font-display text-2xl text-red-600">Eliminar barbero</h2>
            <p className="text-sm text-barber-gray">
              Vas a eliminar de forma <b>permanente</b> a <b>{eliminando.nombre}</b> ({eliminando.local}).
            </p>
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
              Se borrarán también su acceso (login) y{" "}
              <b>{eliminando.numCitas} cita{eliminando.numCitas === 1 ? "" : "s"}</b>. Esta acción no se puede deshacer.
            </div>
            <div className="flex gap-3 pt-1">
              <button className="btn-outline flex-1" onClick={() => setEliminando(null)} disabled={borrando}>
                Cancelar
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                onClick={eliminarBarbero}
                disabled={borrando}
              >
                {borrando ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
