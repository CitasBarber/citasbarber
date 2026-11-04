"use client";

import Link from "next/link";
import { WhatsAppIcon } from "@/components/Icons";

function IgIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MARCAS = [
  { slug: "citasbarber", nicho: "Barber", desc: "Barberos y barberías",   emoji: "💈" },
  { slug: "citaspet",    nicho: "Pet",    desc: "Peluquerías de mascotas", emoji: "🐾" },
  { slug: "citasspa",    nicho: "Spa",    desc: "Spas de uñas y salones",  emoji: "💅" },
];

const PASOS = [
  {
    n: "01",
    titulo: "Elegís tu profesional",
    desc: "Mirá los perfiles, servicios y precios disponibles. Escogés a quién querés atenderte.",
    varColor: "--cobre-profundo",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    n: "02",
    titulo: "Escogés el día y la hora",
    desc: "Ves la disponibilidad en tiempo real y reservás el turno que más te quede.",
    varColor: "--azul-acero",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    n: "03",
    titulo: "Confirmación al instante",
    desc: "Te llega por WhatsApp y en la app. Tu profesional también recibe la notificación.",
    varColor: "--whatsapp-deep",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const BENEFICIOS = [
  {
    titulo: "Sin llamadas ni filas",
    desc: "Olvidate de llamar para preguntar si hay turno. Agendá online en segundos, a cualquier hora del día.",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    titulo: "Confirmación por WhatsApp",
    desc: "Al reservar, te llega la confirmación al celu al instante. Sin apps que descargar, sin registros complicados.",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    titulo: "Recordatorio antes de tu cita",
    desc: "Te avisamos por WhatsApp para que no se te pase. Tu profesional también recibe la notificación.",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

const NEGOCIO_BULLETS = [
  "Tu propia página con tu nombre y tus servicios",
  "Panel de citas con calendario en tiempo real",
  "Pagos por Nequi, Daviplata, QR o efectivo",
  "Notificaciones push para vos y tu equipo",
];

export default function CitasAppLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-crema text-tinta scroll-smooth">

      {/* ── Header ── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-linea">
        <span className="font-display text-2xl tracking-wide select-none">
          <span className="text-cobre">Citas</span>
          <span className="text-tinta">App</span>
          <span className="text-cobre text-lg">.co</span>
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/citasapp.co"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de CitasApp.co"
            className="text-pizarra hover:text-cobre-profundo transition-colors duration-200"
          >
            <IgIcon />
          </a>
          <a
            href="#para-negocios"
            className="text-[11px] font-semibold tracking-[0.18em] uppercase px-4 py-2 rounded-lg bg-cobre-profundo text-hueso hover:bg-tinta transition-colors duration-200"
          >
            Para tu negocio
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4">

        {/* ── Hero ── */}
        <section className="w-full flex flex-col items-center pt-16 pb-14 text-center max-w-xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8" style={{ background: "var(--cobre)" }} />
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-cobre">
              Colombia · Citas online
            </p>
            <span className="h-px w-8" style={{ background: "var(--cobre)" }} />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-tinta">
            Tu turno,<br />
            <span className="text-cobre">cuando querás.</span>
          </h1>

          <p className="mt-5 text-pizarra text-base sm:text-lg leading-relaxed max-w-md">
            Agendá con tu profesional favorito en un momentico.
            Sin llamadas, sin filas — la confirmación llega por WhatsApp y en la app.
          </p>

          <a
            href="#plataformas"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cobre-profundo text-hueso font-semibold text-sm hover:bg-tinta transition-colors duration-200"
          >
            Ver plataformas ↓
          </a>
        </section>

        {/* ── Tarjetas de marca ── */}
        <section id="plataformas" className="w-full max-w-3xl pb-14 scroll-mt-20">
          <div className="mb-7 text-center">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-cobre mb-1">
              Tres plataformas, un solo sistema
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-tinta">
              Escogé tu plataforma
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {MARCAS.map((m) => (
              <Link
                key={m.slug}
                href={`/page/${m.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-linea bg-hueso hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-cobre-profundo"
                style={{ "--acento": `var(--${m.slug}-acento)` }}
              >
                <div className="h-[3px] shrink-0" style={{ background: "var(--acento)" }} />
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <span className="text-3xl">{m.emoji}</span>
                  <div className="flex-1">
                    <div className="font-display text-[1.65rem] leading-tight">
                      <span style={{ color: "var(--acento)" }}>Citas</span>
                      <span className="text-tinta">{m.nicho}</span>
                    </div>
                    <p className="text-pizarra text-sm mt-1">{m.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pizarra group-hover:text-cobre-profundo transition-colors duration-200">
                    Entrar
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section className="w-full max-w-3xl pb-20">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-cobre mb-2">
              Así funciona
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-tinta">
              Tres pasos, <span className="text-cobre">listo.</span>
            </h2>
          </div>

          {/* grid: paso · flecha · paso · flecha · paso */}
          <div className="grid sm:grid-cols-[1fr_32px_1fr_32px_1fr] gap-y-8 items-start">
            {PASOS.flatMap((p, i) => [
              <div key={`paso-${i}`} className="flex flex-row sm:flex-col items-start gap-4">
                {/* icono en caja de color */}
                <div
                  className="w-14 h-14 shrink-0 rounded-2xl grid place-items-center text-hueso shadow-card"
                  style={{ background: `var(${p.varColor})` }}
                >
                  {p.icono}
                </div>
                {/* texto */}
                <div>
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-pizarra/60">
                    {p.n}
                  </span>
                  <h3 className="font-display text-xl text-tinta leading-tight mt-0.5">
                    {p.titulo}
                  </h3>
                  <p className="text-pizarra text-sm mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>,

              i < PASOS.length - 1 && (
                <div key={`flecha-${i}`} className="hidden sm:flex items-start justify-center pt-5 text-linea text-2xl select-none">
                  →
                </div>
              ),
            ])}
          </div>
        </section>

      </main>

      {/* ── Beneficios ── (fondo hueso, ancho completo) */}
      <section className="bg-hueso border-y border-linea px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl sm:text-4xl text-tinta mb-2">
            ¿Por qué <span className="text-cobre">CitasApp.co</span>?
          </h2>
          <p className="text-pizarra mb-10 text-sm sm:text-base">
            Diseñada para la manera en que Colombia agenda: rápido, por WhatsApp, desde el celular.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {BENEFICIOS.map((b, i) => (
              <div key={i} className="flex flex-col gap-3">
                <span className="w-10 h-10 rounded-xl bg-linea text-cobre-profundo grid place-items-center shrink-0">
                  {b.icono}
                </span>
                <h3 className="font-display text-xl text-tinta leading-tight">{b.titulo}</h3>
                <p className="text-pizarra text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para negocios ── (fondo crema con borde) */}
      <section id="para-negocios" className="px-4 py-16 bg-crema scroll-mt-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-linea bg-hueso p-8 sm:p-10 flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">

            {/* Texto izquierdo */}
            <div className="flex-1">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-cobre mb-3">
                Para profesionales
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-tinta leading-tight mb-3">
                Poné tu negocio<br />
                <span className="text-cobre-profundo">en línea hoy.</span>
              </h2>
              <p className="text-pizarra text-sm sm:text-base leading-relaxed">
                CitasApp.co le da a tu barbería, peluquería o spa su propia plataforma de citas —
                con tu nombre, tus servicios y tus precios. Sin mensualidades fijas para empezar.
              </p>
            </div>

            {/* Lista + CTA derecha */}
            <div className="flex-1 flex flex-col gap-5">
              <ul className="flex flex-col gap-2.5">
                {NEGOCIO_BULLETS.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-tinta">
                    <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-cobre-profundo text-hueso grid place-items-center text-[10px] font-bold">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/573173780801"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-lg bg-cobre-profundo text-hueso hover:bg-tinta transition-colors duration-200 w-full sm:w-auto sm:self-start"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  317 378 0801
                </a>
                <a
                  href="https://www.instagram.com/citasapp.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-pizarra hover:text-cobre-profundo transition-colors duration-200 w-full sm:w-auto sm:self-start"
                >
                  <IgIcon className="w-4 h-4" />
                  @citasapp.co
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-5 border-t border-linea flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-pizarra bg-crema">
        <span className="font-display text-base tracking-wide select-none">
          <span className="text-cobre">Citas</span>
          <span className="text-tinta">App</span>
          <span className="text-cobre">.co</span>
        </span>
        <span>© {new Date().getFullYear()} CitasApp.co · Hecho en Colombia 🇨🇴</span>
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/citasapp.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-cobre-profundo transition-colors duration-200"
          >
            <IgIcon className="w-3.5 h-3.5" />
            @citasapp.co
          </a>
        </div>
      </footer>

    </div>
  );
}
