"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PosteBarbero } from "./Icons";

export default function Header({ children }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 text-white transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-barber-black"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 shrink-0 min-h-[44px]">
          <PosteBarbero className="w-5 h-9 sm:w-6 sm:h-12" />
          <span className="font-display text-xl sm:text-2xl tracking-wide">
            <span className="text-barber-red">Citas</span>Barber
          </span>
        </Link>
        <nav className="flex items-center text-sm">{children}</nav>
      </div>
      <div className="h-1 sm:h-1.5 barber-pole" />
    </header>
  );
}
