"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { Bigote, PosteBarbero } from "@/components/Icons";
import { Scissors, Knife, Armchair } from "@phosphor-icons/react";
import { formatoCOP } from "@/lib/constants";
import ContactoAdmin from "@/components/ContactoAdmin";

export default function HomePage() {
  const [barberos, setBarberos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/barberos")
      .then((r) => r.json())
      .then((d) => setBarberos(d.barberos || []))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header>
        <Link href="/mis-citas" className="hover:text-barber-red">Mis citas</Link>
        <Link href="/barbero/login" className="hover:text-barber-red">Soy barbero</Link>
        <Link href="/admin/login" className="text-white/40 hover:text-white/70 hidden sm:inline-flex text-xs">Admin</Link>
      </Header>

      {/* Hero — #5 gradiente sutil */}
      <section className="text-white" style={{ background: "radial-gradient(ellipse at 35% 60%, #1c1c1c 0%, #0d0d0d 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-display text-lg sm:text-xl tracking-wide text-barber-red">
              💈 770 Barbería · Caldas, Antioquia
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mt-1">
              Tu motilada <span className="text-barber-red">sin filas</span> ni vueltas.
            </h1>
            <p className="mt-4 text-white/80 text-base sm:text-lg">
              Agendá con tu barbero de confianza en un momentico. Solo das tu
              nombre y el celu, y te llega la confirmación por WhatsApp. ¡Así de
              fácil!
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="#barberos" className="btn-primary w-full sm:w-auto justify-center">¡Pedí tu cita!</a>
              <Link href="/mis-citas" className="btn-outline border-white text-white hover:bg-white hover:text-barber-black w-full sm:w-auto justify-center">
                Ver mi cita
              </Link>
            </div>
          </div>
          {/* Íconos decorativos — solo desktop */}
          <div className="hidden md:flex justify-center gap-8 text-white/80">
            <PosteBarbero className="w-16 h-40" />
            <div className="flex flex-col justify-center gap-8">
              <Scissors size={52} weight="thin" />
              <Knife size={52} weight="thin" />
              <Armchair size={52} weight="thin" />
            </div>
          </div>
        </div>
        <div className="h-1 sm:h-1.5 barber-pole" />
      </section>

      {/* Barberos */}
      <section id="barberos" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-3xl flex items-center gap-2">
          <Bigote className="w-8 h-8 text-barber-ink" /> Escogé tu barbero
        </h2>
        <p className="text-barber-gray mt-1">Estos son los barberos de 770. Escogé con quién te querés motilar.</p>

        {cargando ? (
          <p className="mt-8 text-barber-gray">Cargando barberos…</p>
        ) : barberos.length === 0 ? (
          <div className="mt-8 card p-8 text-center text-barber-gray">
            Todavía no hay barberos por acá. ¡Vuelve pronto!
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {barberos.map((b, idx) => (
              <Link
                key={b.id}
                href={`/agendar/${b.id}`}
                className="relative rounded-2xl overflow-hidden aspect-[3/4] group animate-fade-up"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                {/* Foto de fondo */}
                {b.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.foto}
                    alt={b.nombre}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 barber-pole" />
                )}

                {/* Fallback inicial si no hay foto */}
                {!b.foto && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white grid place-items-center font-display text-3xl sm:text-4xl">
                      {b.nombre?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Gradiente overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                {/* #2 sombra roja al hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_0_2px_rgba(225,29,42,0.6)]" />

                {/* Contenido */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="font-display text-white text-lg sm:text-xl leading-tight">{b.nombre}</h3>
                  <p className="text-white/50 text-xs mb-2">Barbero en 770</p>
                  <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                    {b.planes.map((p) => (
                      <span key={p.key} className="text-[10px] sm:text-xs font-semibold bg-white/15 text-white rounded-full px-2 py-0.5 backdrop-blur-sm">
                        {p.nombre} · {formatoCOP(p.precio)}
                      </span>
                    ))}
                  </div>
                  <span className="text-barber-red font-bold text-sm group-hover:text-white transition-colors duration-200">
                    Agendar →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Contacto: barbero interesado en la app escribe al admin */}
      <ContactoAdmin />

      <footer className="bg-barber-black text-white/70 text-sm">
        <div className="h-1 sm:h-1.5 barber-pole" />
        <div className="mx-auto max-w-6xl px-4 py-5 sm:py-6 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3 text-center sm:text-left">
          <span>© {new Date().getFullYear()} 770 Barbería · Caldas, Antioquia</span>
          <div className="flex justify-center sm:justify-end gap-4">
            <Link href="/barbero/registro" className="hover:text-white">Soy barbero</Link>
            <Link href="/admin/login" className="hover:text-white">Administrador</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
