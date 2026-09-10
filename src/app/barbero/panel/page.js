"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import CitasLista from "@/components/barbero/CitasLista";
import Calendario from "@/components/barbero/Calendario";
import CitaManual from "@/components/barbero/CitaManual";
import ConfigHorario from "@/components/barbero/ConfigHorario";
import ResumenDiario from "@/components/barbero/ResumenDiario";

const TABS = [
  { key: "calendario", label: "Calendario",       short: "Agenda" },
  { key: "lista",      label: "Lista del día",    short: "Hoy" },
  { key: "manual",     label: "Cita manual",      short: "Manual" },
  { key: "resumen",    label: "Resumen diario",   short: "Resumen" },
  { key: "config",     label: "Horario y pagos",  short: "Config" },
];

export default function PanelBarberoPage() {
  const router = useRouter();
  const [sesion, setSesion] = useState(undefined);
  const [perfil, setPerfil] = useState(null);
  const [tab, setTab] = useState("calendario");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.session || d.session.role !== "barbero") {
          router.replace("/barbero/login");
          setSesion(null);
        } else if (d.session.passwordTemporal) {
          router.replace("/barbero/cambiar-password");
        } else {
          setSesion(d.session);
        }
      });
  }, [router]);

  useEffect(() => {
    if (!sesion) return;
    fetch("/api/barbero/perfil")
      .then((r) => r.json())
      .then((d) => setPerfil(d.barbero));
  }, [sesion, refresh]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  if (sesion === undefined) return <div className="p-10 text-center text-barber-gray">Cargando…</div>;
  if (!sesion) return null;

  const recargar = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen">
      <Header>
        <span className="text-white/70 hidden sm:inline text-sm">{perfil?.local}</span>
        <button onClick={logout} className="text-white/80 hover:text-white font-semibold text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition min-h-[44px]">
          Salir
        </button>
      </Header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
        <h1 className="font-display text-2xl sm:text-3xl">Hola, {sesion.nombre.split(" ")[0]} 👋</h1>

        <div className="mt-3 sm:mt-4 flex overflow-x-auto border-b border-black/10 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 sm:px-4 py-2.5 font-semibold whitespace-nowrap border-b-2 -mb-px flex-1 sm:flex-none min-w-0 ${tab === t.key ? "border-barber-red text-barber-red" : "border-transparent text-barber-gray hover:text-barber-ink"}`}
            >
              <span className="sm:hidden text-sm">{t.short}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "lista" && <CitasLista onCambio={recargar} />}
          {tab === "calendario" && <Calendario perfil={perfil} />}
          {tab === "manual" && perfil && <CitaManual planes={perfil.planes} onCreada={() => setTab("lista")} />}
          {tab === "resumen" && <ResumenDiario />}
          {tab === "config" && perfil && <ConfigHorario perfil={perfil} onGuardado={recargar} />}
        </div>

        <p className="mt-8 text-center text-xs text-barber-gray">
          <Link href="/" className="underline">Ver sitio público</Link>
        </p>
      </main>
    </div>
  );
}
