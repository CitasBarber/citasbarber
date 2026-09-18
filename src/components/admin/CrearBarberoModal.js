"use client";

import { useState } from "react";
import { OjoAbierto, OjoCerrado, WhatsAppIcon } from "@/components/Icons";
import { BARBERIA_SEDE_DEFAULT } from "@/lib/constants";

export default function CrearBarberoModal({ onClose, onCreado, defaultBarberia }) {
  const sede = defaultBarberia || BARBERIA_SEDE_DEFAULT;
  const [form, setForm] = useState({
    nombre: "",
    local: sede.local || BARBERIA_SEDE_DEFAULT.local,
    celular: "",
    ciudad: sede.ciudad || BARBERIA_SEDE_DEFAULT.ciudad,
    direccion: sede.direccion || BARBERIA_SEDE_DEFAULT.direccion,
    emailAlias: "",
  });

  const [password, setPassword] = useState("Barbero123*");
  const [verPassword, setVerPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Estado de éxito
  const [resultado, setResultado] = useState(null); // { barbero, credenciales }
  const [copiado, setCopiado] = useState(false);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function generarPasswordAleatoria() {
    const num = Math.floor(1000 + Math.random() * 9000);
    setPassword(`Barber#${num}`);
  }

  // Si el usuario pega un correo completo en emailAlias, limpiamos o extraemos
  function handleEmailChange(val) {
    const limpio = val.trim().toLowerCase().replace(/@citasbarber\.com$/, "");
    set("emailAlias", limpio);
  }

  const emailFinal = form.emailAlias
    ? form.emailAlias.includes("@")
      ? form.emailAlias.trim().toLowerCase()
      : `${form.emailAlias.trim().toLowerCase()}@citasbarber.com`
    : "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.celular.trim() || !form.emailAlias.trim()) {
      setError("Nombre, celular y correo son obligatorios.");
      return;
    }

    if (password.trim().length < 6) {
      setError("La contraseña temporal debe tener al menos 6 caracteres.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const res = await fetch("/api/admin/barberos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          local: form.local.trim(),
          celular: form.celular.trim(),
          ciudad: form.ciudad.trim(),
          direccion: form.direccion.trim(),
          email: emailFinal,
          password: password.trim(),
        }),
      });

      const data = await res.json();
      setGuardando(false);

      if (!res.ok) {
        setError(data.error || "Ocurrió un error al crear el barbero.");
        return;
      }

      setResultado(data);
    } catch (err) {
      setGuardando(false);
      setError("Error de conexión. Inténtalo de nuevo.");
    }
  }

  async function copiarCredenciales() {
    if (!resultado) return;
    const texto = `💈 *Bienvenido a CitasBarber*\n\nTus datos de acceso como barbero:\n📧 *Correo:* ${resultado.credenciales.email}\n🔑 *Contraseña temporal:* ${resultado.credenciales.password}\n🌐 *Acceso:* ${window.location.origin}/barbero/panel\n\n_Al ingresar por primera vez, el sistema te solicitará cambiar tu contraseña._`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      alert("No se pudo copiar automáticamente. Por favor copia manualmente los datos.");
    }
  }

  function obtenerEnlaceWhatsApp() {
    if (!resultado) return "#";
    const celular = resultado.barbero.celular.replace(/\D/g, "");
    const numero = celular.startsWith("57") ? celular : `57${celular}`;
    const mensaje = encodeURIComponent(
      `💈 ¡Hola ${resultado.barbero.nombre}! Ya hemos configurado tu cuenta en CitasBarber.\n\n` +
      `Tus datos de acceso son:\n` +
      `📧 Correo: ${resultado.credenciales.email}\n` +
      `🔑 Contraseña temporal: ${resultado.credenciales.password}\n` +
      `🌐 Ingresa aquí: ${window.location.origin}/barbero/panel\n\n` +
      `Al entrar por primera vez el sistema te solicitará definir tu nueva contraseña personal.`
    );
    return `https://wa.me/${numero}?text=${mensaje}`;
  }

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50 overflow-y-auto">
      <div className="card p-6 w-full max-w-lg my-8 space-y-6 animate-fade-up">

        {resultado ? (
          /* Pantalla de Éxito */
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h2 className="font-display text-2xl">¡Barbero creado exitosamente!</h2>
              <p className="text-sm text-barber-gray">
                La cuenta para <b>{resultado.barbero.nombre}</b> ({resultado.barbero.local}) quedó <b>activa</b> y lista para usarse.
              </p>
            </div>

            {/* Tarjeta de credenciales */}
            <div className="rounded-xl bg-barber-cream border border-black/10 p-4 space-y-2">
              <div className="text-xs font-semibold uppercase text-barber-gray tracking-wider">
                Credenciales de acceso
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-barber-gray">Usuario / Correo:</span>{" "}
                  <b className="font-mono text-barber-ink select-all">{resultado.credenciales.email}</b>
                </p>
                <p>
                  <span className="text-barber-gray">Contraseña temporal:</span>{" "}
                  <b className="font-mono text-barber-ink select-all">{resultado.credenciales.password}</b>
                </p>
              </div>
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                🔒 El barbero deberá cambiar esta contraseña obligatoriamente en su primer inicio de sesión.
              </p>
            </div>

            {/* Acciones para compartir */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copiarCredenciales}
                  className="btn-outline flex-1 py-2 text-sm flex items-center justify-center gap-2"
                >
                  {copiado ? "✓ ¡Copiado!" : "📋 Copiar credenciales"}
                </button>
                <a
                  href={obtenerEnlaceWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa flex-1 py-2 text-sm flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4" /> Enviar por WhatsApp
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  onCreado?.(resultado.barbero, true); // true = abrir planes
                }}
                className="btn-dark w-full py-2.5 text-sm"
              >
                Configurar o validar planes de este barbero →
              </button>

              <button
                type="button"
                onClick={() => {
                  onCreado?.(resultado.barbero, false);
                }}
                className="btn-outline border-transparent text-barber-gray hover:bg-black/5 hover:text-black w-full py-2 text-sm"
              >
                Volver a la lista de barberos
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Registro Manual */
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-display text-2xl">Crear nuevo barbero</h2>
                <p className="text-xs text-barber-gray">Registro manual directo desde el panel de administración.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl leading-none text-barber-gray hover:text-barber-black"
                disabled={guardando}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre del barbero *</label>
                  <input
                    className="input"
                    value={form.nombre}
                    onChange={(e) => set("nombre", e.target.value)}
                    placeholder="Ej. Carlos Martínez"
                    required
                  />
                </div>
                <div>
                  <label className="label">Celular / WhatsApp *</label>
                  <input
                    className="input"
                    type="tel"
                    value={form.celular}
                    onChange={(e) => set("celular", e.target.value)}
                    placeholder="Ej. 3001234567"
                    required
                  />
                </div>
              </div>

              {/* Sede / Barbería precargada */}
              <div className="rounded-xl bg-barber-cream/70 border border-black/10 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-barber-gray flex items-center gap-1">
                    💈 Sede / Barbería
                  </span>
                  <span className="text-[11px] text-barber-blue font-semibold">
                    Datos del local actual
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Nombre del local</label>
                    <input
                      className="input text-sm py-2 bg-white"
                      value={form.local}
                      onChange={(e) => set("local", e.target.value)}
                      placeholder="770 Barbería"
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Ciudad</label>
                    <input
                      className="input text-sm py-2 bg-white"
                      value={form.ciudad}
                      onChange={(e) => set("ciudad", e.target.value)}
                      placeholder="Caldas, Antioquia"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs">Dirección</label>
                  <input
                    className="input text-sm py-2 bg-white"
                    value={form.direccion}
                    onChange={(e) => set("direccion", e.target.value)}
                    placeholder="Carrera 48 # 133 sur 50"
                  />
                </div>
              </div>

              {/* Correo con dominio @citasbarber.com por defecto */}
              <div>
                <label className="label">Correo electrónico institucional *</label>
                <div className="flex rounded-lg border border-gray-300 focus-within:border-barber-blue focus-within:ring-1 focus-within:ring-barber-blue overflow-hidden bg-white">
                  <input
                    className="flex-1 px-3 py-2.5 outline-none text-base text-right sm:text-left"
                    type="text"
                    value={form.emailAlias}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="nombre.barbero"
                    required
                  />
                  <span className="inline-flex items-center px-3 bg-gray-100 text-barber-gray font-medium text-sm select-none border-l border-gray-200">
                    {form.emailAlias.includes("@") ? "" : "@citasbarber.com"}
                  </span>
                </div>
                <p className="text-xs text-barber-gray mt-1">
                  Dirección final: <span className="font-medium text-barber-ink">{emailFinal || "(escribe el usuario)"}</span>
                </p>
              </div>

              {/* Contraseña temporal */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="label mb-0">Contraseña temporal *</label>
                  <button
                    type="button"
                    onClick={generarPasswordAleatoria}
                    className="text-xs text-barber-blue hover:underline font-semibold"
                  >
                    Generar aleatoria
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={verPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-barber-gray hover:text-barber-dark"
                    tabIndex={-1}
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {verPassword ? <OjoCerrado className="w-5 h-5" /> : <OjoAbierto className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-barber-gray mt-1">
                  El barbero deberá cambiar esta clave obligatoriamente en su primer ingreso.
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 leading-relaxed">
                ℹ️ La cuenta se creará en estado <b>Activo</b> con 30 días de suscripción y los planes base cargados. Luego podrás ajustar o validar sus servicios y precios.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline flex-1"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={guardando}
                >
                  {guardando ? "Creando…" : "Crear barbero"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
