"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { PosteBarbero, OjoAbierto, OjoCerrado } from "@/components/Icons";

export default function LoginAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  async function login(e) {
    e.preventDefault();
    setError(""); setEnviando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error");
      if (d.role !== "admin") throw new Error("Esta cuenta no es de administrador.");
      router.push("/admin/panel");
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header><Link href="/" className="hover:text-barber-red">Inicio</Link></Header>
      <main className="mx-auto max-w-sm px-4 py-12">
        <div className="flex justify-center mb-4"><PosteBarbero className="w-10 h-24" /></div>
        <h1 className="font-display text-3xl text-center">Administración</h1>
        <form onSubmit={login} className="card p-6 mt-6 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <input className="input pr-10" type={verPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setVerPassword(!verPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-barber-gray hover:text-barber-dark" tabIndex={-1} aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {verPassword ? <OjoCerrado className="w-5 h-5" /> : <OjoAbierto className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button className="btn-primary w-full" disabled={enviando}>{enviando ? "Ingresando…" : "Ingresar"}</button>
        </form>
      </main>
    </div>
  );
}
