"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { PosteBarbero } from "@/components/Icons";

export default function CambiarPasswordPage() {
  const router = useRouter();
  const [lista, setLista]           = useState(undefined); // undefined=cargando
  const [nueva, setNueva]           = useState("");
  const [confirmar, setConfirmar]   = useState("");
  const [error, setError]           = useState("");
  const [enviando, setEnviando]     = useState(false);
  const [esTemp, setEsTemp]         = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.session || d.session.role !== "barbero") {
          router.replace("/barbero/login");
          return;
        }
        setEsTemp(d.session.passwordTemporal === true);
        setLista(true);
      });
  }, [router]);

  async function cambiar(e) {
    e.preventDefault();
    setError("");
    if (nueva.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (nueva !== confirmar) { setError("Las contraseñas no coinciden."); return; }

    setEnviando(true);
    const res = await fetch("/api/barbero/cambiar-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevaPassword: nueva }),
    });
    setEnviando(false);

    if (res.ok) {
      router.replace("/barbero/panel");
    } else {
      const d = await res.json();
      setError(d.error || "Error al cambiar la contraseña");
    }
  }

  if (lista === undefined)
    return <div className="p-10 text-center text-barber-gray">Cargando…</div>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-sm px-4 py-12">
        <div className="flex justify-center mb-4">
          <PosteBarbero className="w-10 h-24" />
        </div>
        <h1 className="font-display text-3xl text-center">Cambiar contraseña</h1>

        {esTemp && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">El administrador te asignó una contraseña temporal.</p>
            <p className="mt-0.5">Debes establecer una contraseña personal para continuar.</p>
          </div>
        )}

        <form onSubmit={cambiar} className="card p-6 mt-4 space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <label className="label">Nueva contraseña</label>
            <input
              className="input"
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Confirmar contraseña</label>
            <input
              className="input"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>

          <button className="btn-primary w-full" disabled={enviando}>
            {enviando ? "Guardando…" : "Guardar contraseña"}
          </button>

          {!esTemp && (
            <button type="button" className="btn-outline w-full" onClick={() => router.back()}>
              Cancelar
            </button>
          )}
        </form>
      </main>
    </div>
  );
}
