"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function RegistroBarberoPage() {
  const [form, setForm] = useState({ nombre: "", local: "", celular: "", ciudad: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function enviar(e) {
    e.preventDefault();
    setError(""); setEnviando(true);
    try {
      const res = await fetch("/api/auth/registro-barbero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error");
      setOk(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header><Link href="/" className="hover:text-barber-red">Inicio</Link></Header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="font-display text-3xl">Registra tu barbería</h1>
        <p className="text-barber-gray">El administrador revisará tu solicitud y activará tu cuenta.</p>

        {ok ? (
          <div className="card p-6 mt-6 text-center space-y-3">
            <div className="text-4xl">🎉</div>
            <p className="font-semibold">¡Solicitud enviada!</p>
            <p className="text-barber-gray text-sm">Recibirás acceso cuando el administrador apruebe tu cuenta y configure tus planes.</p>
            <Link href="/barbero/login" className="btn-primary">Ir a iniciar sesión</Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="card p-6 mt-6 space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Campo label="Tu nombre" v={form.nombre} on={(v) => set("nombre", v)} />
            <Campo label="Nombre del local" v={form.local} on={(v) => set("local", v)} />
            <Campo label="Celular (WhatsApp)" v={form.celular} on={(v) => set("celular", v)} placeholder="3001234567" />
            <Campo label="Ciudad" v={form.ciudad} on={(v) => set("ciudad", v)} />
            <Campo label="Email" type="email" v={form.email} on={(v) => set("email", v)} />
            <Campo label="Contraseña" type="password" v={form.password} on={(v) => set("password", v)} />
            <button className="btn-primary w-full" disabled={enviando}>{enviando ? "Enviando…" : "Enviar solicitud"}</button>
            <p className="text-center text-sm text-barber-gray">
              ¿Ya tienes cuenta? <Link href="/barbero/login" className="text-barber-blue font-semibold">Inicia sesión</Link>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}

function Campo({ label, v, on, type = "text", placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} required />
    </div>
  );
}
