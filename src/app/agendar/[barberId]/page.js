"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import SocialLinks from "@/components/SocialLinks";
import { WhatsAppIcon } from "@/components/Icons";
import { formatoCOP, METODOS_PAGO_LABEL } from "@/lib/constants";
import { fechaLocalHoy } from "@/lib/disponibilidad";

export default function AgendarPage() {
  const { barberId } = useParams();
  const [barbero, setBarbero] = useState(null);
  const [paso, setPaso] = useState(1);

  // datos cliente
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");

  // selección
  const [plan, setPlan] = useState(null);
  const [fecha, setFecha] = useState(fechaLocalHoy());
  const [fechaManual, setFechaManual] = useState(false);
  const [slots, setSlots] = useState([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [hora, setHora] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);
  const [comprobante, setComprobante] = useState("");

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    fetch(`/api/barberos/${barberId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setBarbero(d.barbero);
      });
  }, [barberId]);

  // Cargar slots cuando hay plan y fecha
  useEffect(() => {
    if (!plan || !fecha) return;
    setCargandoSlots(true);
    setHora(null);
    fetch(`/api/barberos/${barberId}/disponibilidad?fecha=${fecha}&plan=${plan.key}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .finally(() => setCargandoSlots(false));
  }, [plan, fecha, barberId]);

  // Busca automáticamente el primer día con disponibilidad (evita aterrizar en un día vacío)
  async function buscarPrimeraFecha(planObj) {
    setBuscando(true);
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const f = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      try {
        const res = await fetch(`/api/barberos/${barberId}/disponibilidad?fecha=${f}&plan=${planObj.key}`);
        const data = await res.json();
        if ((data.slots || []).length > 0) {
          setFecha(f);
          setBuscando(false);
          return;
        }
      } catch {}
      d.setDate(d.getDate() + 1);
    }
    setBuscando(false); // no encontró en 30 días; se queda en la fecha actual
  }

  function irAHorario() {
    setError("");
    setPaso(3);
    if (!fechaManual) buscarPrimeraFecha(plan);
  }

  function onArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("El comprobante no debe superar 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setComprobante(reader.result);
    reader.readAsDataURL(file);
  }

  async function crearCita() {
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberoId: barberId,
          plan: plan.key,
          fecha,
          horaInicio: hora,
          metodoPago,
          comprobante,
          clienteNombre: nombre,
          clienteCelular: celular,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error al crear la cita");
      setResultado(d);
      setPaso(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  const requiereAnticipo = plan && (plan.anticipo || 0) > 0;
  const montoAnticipo = requiereAnticipo
    ? Math.round((plan.precio * plan.anticipo) / 100)
    : 0;

  if (error && !barbero) {
    return (
      <Wrap>
        <div className="card p-8 text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/" className="btn-outline mt-4">Volver</Link>
        </div>
      </Wrap>
    );
  }

  if (!barbero) return <Wrap><p className="text-barber-gray">Cargando…</p></Wrap>;

  return (
    <Wrap>
      <div className="mb-5 flex flex-col items-center text-center">
        <Avatar
          foto={barbero.foto}
          nombre={barbero.nombre}
          className="w-28 h-28 sm:w-48 sm:h-48 shadow-card"
          text="text-4xl sm:text-6xl"
        />
        <h1 className="font-display text-2xl sm:text-3xl mt-3">{barbero.nombre}</h1>
        <p className="text-barber-gray text-sm sm:text-base">{barbero.local} · {barbero.ciudad}</p>
        {barbero.direccion && (
          <p className="text-xs sm:text-sm text-barber-gray">📍 {barbero.direccion}</p>
        )}
        <SocialLinks redes={barbero.redes} className="mt-2 justify-center" />
      </div>

      <Pasos paso={paso} />

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      {/* PASO 1: datos del cliente */}
      {paso === 1 && (
        <form
          className="card p-6 mt-4 space-y-4"
          onSubmit={(e) => { e.preventDefault(); setError(""); setPaso(2); }}
        >
          <h2 className="font-display text-xl">¿Quién agenda?</h2>
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label className="label">Celular</label>
            <input className="input" value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Ej: 3001234567" inputMode="numeric" />
            <p className="text-xs text-barber-gray mt-1">Con tu celu después consultás cómo va tu cita.</p>
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!nombre.trim() || celular.replace(/\D/g, "").length < 10}
          >
            Continuar
          </button>
        </form>
      )}

      {/* PASO 2: elegir plan */}
      {paso === 2 && (
        <div className="mt-4 space-y-4">
          <h2 className="font-display text-xl">Escogé tu plan</h2>
          <div className="grid sm:grid-cols-3 gap-4 items-stretch">
            {barbero.planes.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPlan(p); setMetodoPago(null); }}
                className={`card p-5 text-left transition flex flex-col h-full ${plan?.key === p.key ? "ring-2 ring-barber-red" : "hover:-translate-y-1"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-2xl leading-none">{p.nombre}</h3>
                  <span className="text-barber-red font-bold whitespace-nowrap">{formatoCOP(p.precio)}</span>
                </div>
                <ul className="mt-3 text-sm text-barber-gray space-y-1 flex-1">
                  {p.servicios.map((s, i) => (
                    <li key={i} className="flex gap-1.5"><span className="text-barber-red">✓</span>{s}</li>
                  ))}
                </ul>
                <p className="mt-4 pt-3 border-t border-black/5 text-xs font-semibold text-barber-gray">
                  ⏱️ {p.duracion} min {p.anticipo > 0 ? `· Anticipo ${p.anticipo}%` : "· Sin anticipo"}
                </p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="btn-outline" onClick={() => setPaso(1)}>Atrás</button>
            <button className="btn-primary flex-1" disabled={!plan} onClick={irAHorario}>Continuar</button>
          </div>
        </div>
      )}

      {/* PASO 3: fecha y hora */}
      {paso === 3 && (
        <form className={`card p-6 mt-4 space-y-4 ${hora ? "pb-24 sm:pb-6" : ""}`} onSubmit={(e) => { e.preventDefault(); if (hora) setPaso(4); }}>
          <h2 className="font-display text-xl">¿Qué día y a qué hora?</h2>

          {/* Accesos rápidos de fecha */}
          <div className="flex flex-wrap gap-2">
            {chipsFecha().map((c) => (
              <button
                key={c.valor}
                onClick={() => { setFechaManual(true); setFecha(c.valor); }}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${fecha === c.valor ? "bg-barber-ink text-white border-barber-ink" : "border-gray-300 hover:border-barber-ink"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div>
            <label className="label">O elige otra fecha</label>
            <input type="date" className="input" min={fechaLocalHoy()} value={fecha} onChange={(e) => { setFechaManual(true); setFecha(e.target.value); }} />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="label">{etiquetaFecha(fecha, false)}</label>
              {!cargandoSlots && !buscando && slots.length > 0 && (
                <span className="text-xs text-barber-gray">{slots.length} cupos · {plan?.duracion} min c/u</span>
              )}
            </div>

            {buscando ? (
              <p className="text-barber-gray text-sm py-3">Buscando el próximo día con cupos…</p>
            ) : cargandoSlots ? (
              <p className="text-barber-gray text-sm py-3">Cargando horarios…</p>
            ) : slots.length === 0 ? (
              <div className="rounded-lg bg-barber-cream border border-black/10 p-4 text-sm text-barber-gray">
                No hay cupos ese día. Prueba con otra fecha o usa los accesos rápidos de arriba.
              </div>
            ) : (
              <div className="space-y-4">
                <GrupoSlots titulo="🌅 Mañana" lista={slots.filter((s) => s < "12:00")} hora={hora} setHora={setHora} />
                <GrupoSlots titulo="🌇 Tarde" lista={slots.filter((s) => s >= "12:00")} hora={hora} setHora={setHora} />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" className="btn-outline" onClick={() => setPaso(2)}>Atrás</button>
            {/* En móvil se oculta cuando hay hora — la barra fija lo reemplaza */}
            <button
              type="submit"
              className={`btn-primary flex-1 ${hora ? "hidden sm:inline-flex" : ""}`}
              disabled={!hora}
            >
              {hora ? `Continuar · ${hora12(hora)}` : "Elige una hora"}
            </button>
          </div>
        </form>
      )}

      {/* Barra fija bottom: aparece al elegir hora, solo en móvil */}
      {paso === 3 && hora && (
        <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden sticky-hora-bar">
          <div className="bg-white border-t border-black/10 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-barber-gray leading-none mb-1">Hora elegida</p>
              <p className="font-display text-2xl leading-none">{hora12(hora)}</p>
            </div>
            <button className="btn-primary shrink-0 px-6" onClick={() => setPaso(4)}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: pago */}
      {paso === 4 && (
        <form className="card p-6 mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); crearCita(); }}>
          <h2 className="font-display text-xl">Pago</h2>
          <Resumen barbero={barbero} plan={plan} fecha={fecha} hora={hora} />

          <div>
            <label className="label">Método de pago</label>
            <div className="flex flex-wrap gap-2">
              {plan.metodosPago.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${metodoPago === m ? "bg-barber-red text-white border-barber-red" : "border-gray-300 hover:border-barber-red"}`}
                >
                  {METODOS_PAGO_LABEL[m]}
                </button>
              ))}
            </div>
          </div>

          {requiereAnticipo && (
            <div className="rounded-lg bg-barber-cream p-4 border border-black/10 space-y-2">
              <p className="font-semibold">
                Anticipo requerido: {formatoCOP(montoAnticipo)} ({plan.anticipo}%)
              </p>
              <DatosPago datosPago={barbero.datosPago} metodo={metodoPago} />
              <div>
                <label className="label mt-2">Sube tu comprobante</label>
                <input type="file" accept="image/*" onChange={onArchivo} className="text-sm" />
                {comprobante && <p className="text-green-700 text-xs mt-1">✔ Comprobante cargado</p>}
              </div>
              <p className="text-xs text-barber-gray">
                Al confirmar, se abrirá WhatsApp para que envíes el comprobante al barbero.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" className="btn-outline" onClick={() => setPaso(3)}>Atrás</button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={enviando || !metodoPago || (requiereAnticipo && !comprobante)}
            >
              {enviando ? "Enviando…" : "¡Enviar solicitud!"}
            </button>
          </div>
        </form>
      )}

      {/* PASO 5: resultado */}
      {paso === 5 && resultado && (
        <div className="card p-6 mt-4 space-y-4 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="font-display text-2xl">¡Listo!</h2>
          <p className="text-barber-gray">
            Tu cita quedó <b>pendiente de que el barbero la acepte</b>. Apenas confirme, te avisamos por WhatsApp.
          </p>
          <Resumen barbero={barbero} plan={plan} fecha={fecha} hora={hora} />

          {resultado.linkWhatsappBarbero && (
            <a href={resultado.linkWhatsappBarbero} target="_blank" rel="noreferrer" className="btn-wa w-full">
              <WhatsAppIcon /> {requiereAnticipo ? "Enviar comprobante al barbero" : "Notificar al barbero"}
            </a>
          )}
          <div className="flex gap-3">
            <Link href="/mis-citas" className="btn-outline flex-1">Ver mis citas</Link>
            <Link href="/" className="btn-dark flex-1">Inicio</Link>
          </div>
        </div>
      )}
    </Wrap>
  );
}

function Wrap({ children }) {
  return (
    <div className="min-h-screen">
      <Header>
        <Link href="/" className="hover:text-barber-red">Inicio</Link>
        <Link href="/mis-citas" className="hover:text-barber-red">Mis citas</Link>
      </Header>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}

function Pasos({ paso }) {
  const items = ["Datos", "Plan", "Horario", "Pago", "Listo"];
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {items.map((it, i) => (
        <div key={it} className="flex-1">
          <div className={`h-2 rounded-full transition-colors ${i + 1 <= paso ? "bg-barber-red" : "bg-gray-200"}`} />
          <span className={`hidden sm:block text-xs mt-0.5 ${i + 1 <= paso ? "text-barber-ink font-semibold" : "text-barber-gray"}`}>{it}</span>
        </div>
      ))}
    </div>
  );
}

function Resumen({ barbero, plan, fecha, hora }) {
  return (
    <div className="rounded-lg border border-black/10 p-4 text-left text-sm space-y-1">
      <p><b>Barbero:</b> {barbero.nombre} — {barbero.local}</p>
      <p><b>Plan:</b> {plan.nombre} ({plan.servicios.join(", ")})</p>
      <p className="capitalize"><b>Fecha:</b> {etiquetaFecha(fecha)}</p>
      <p><b>Hora:</b> {hora12(hora)} ({plan.duracion} min)</p>
      <p><b>Valor:</b> {formatoCOP(plan.precio)}</p>
    </div>
  );
}

// Botones de horario agrupados por jornada
function GrupoSlots({ titulo, lista, hora, setHora }) {
  if (lista.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-semibold text-barber-ink mb-2">{titulo}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {lista.map((s) => (
          <button
            key={s}
            onClick={() => setHora(s)}
            className={`rounded-lg border min-h-[48px] py-2.5 text-sm font-semibold transition active:scale-95 ${
              hora === s
                ? "bg-barber-blue text-white border-barber-blue"
                : "border-gray-300 hover:border-barber-blue active:bg-gray-50"
            }`}
          >
            {hora12(s)}
          </button>
        ))}
      </div>
    </div>
  );
}

// 'HH:mm' (24h) -> '2:00 pm'
function hora12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Fecha 'YYYY-MM-DD' -> 'Lunes, 1 de septiembre'. Con relativo=true antepone Hoy/Mañana.
function etiquetaFecha(fechaStr, relativo = true) {
  if (!fechaStr) return "";
  const [y, mo, d] = fechaStr.split("-").map(Number);
  const fecha = new Date(y, mo - 1, d);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
  const legible = fecha.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  const cap = legible.charAt(0).toUpperCase() + legible.slice(1);
  if (relativo && fecha.getTime() === hoy.getTime()) return `Hoy · ${cap}`;
  if (relativo && fecha.getTime() === manana.getTime()) return `Mañana · ${cap}`;
  return cap;
}

// Accesos rápidos: Hoy, Mañana y pasado mañana
function chipsFecha() {
  const out = [];
  const base = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let label;
    if (i === 0) label = "Hoy";
    else if (i === 1) label = "Mañana";
    else {
      const dia = d.toLocaleDateString("es-CO", { weekday: "long" });
      label = dia.charAt(0).toUpperCase() + dia.slice(1);
    }
    out.push({ valor, label });
  }
  return out;
}

function DatosPago({ datosPago = {}, metodo }) {
  const map = {
    nequi: datosPago.nequi && `Nequi: ${datosPago.nequi}`,
    daviplata: datosPago.daviplata && `Daviplata: ${datosPago.daviplata}`,
    cuenta: datosPago.cuenta && `Cuenta: ${datosPago.cuenta}`,
    qr: datosPago.qrImagen && "Escanea el QR:",
  };
  const texto = map[metodo];
  return (
    <div className="text-sm">
      {texto ? <p className="font-medium">{texto}</p> : <p className="text-barber-gray">Solicita los datos de pago al barbero.</p>}
      {metodo === "qr" && datosPago.qrImagen && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={datosPago.qrImagen} alt="QR de pago" className="mt-2 w-40 h-40 object-contain border rounded" />
      )}
    </div>
  );
}
