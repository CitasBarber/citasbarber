"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EstadoBadge from "@/components/EstadoBadge";
import EditorPlanes from "@/components/admin/EditorPlanes";
import EditorInfoBarbero from "@/components/admin/EditorInfoBarbero";

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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.session || d.session.role !== "admin") { router.replace("/admin/login"); setSesion(null); }
        else setSesion(d.session);
      });
  }, [router]);

  function cargar() {
    const q = filtro ? `?estado=${filtro}` : "";
    fetch(`/api/admin/barberos${q}`).then((r) => r.json()).then((d) => setBarberos(d.barberos || []));
  }

  useEffect(() => { if (sesion) cargar(); /* eslint-disable-next-line */ }, [sesion, filtro]);

  async function accion(id, accion) {
    const res = await fetch(`/api/admin/barberos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);
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
        <h1 className="font-display text-3xl">Administración de barberos</h1>

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
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
