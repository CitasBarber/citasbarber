"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBrand } from "./BrandProvider";

export function IconoMarca({ className = "w-9 h-9" }) {
  const { marca } = useBrand();
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={marca.favicon} alt="" aria-hidden="true" className={`${className} shrink-0`} />;
}

export function LogoMarca({ className = "text-xl sm:text-2xl" }) {
  const { marca } = useBrand();
  return (
    <span className={`font-display font-semibold tracking-wide ${className}`}>
      <span className="text-brand-on-dark">Citas</span>
      <span className="text-hueso">{marca.nicho}</span>
    </span>
  );
}

export default function Header({ children }) {
  const { marca } = useBrand();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 text-hueso transition-all duration-300 ${
        scrolled
          ? "bg-tinta/80 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-tinta"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 shrink-0 min-h-[44px]">
          <IconoMarca className="w-8 h-8 sm:w-10 sm:h-10" />
          <LogoMarca />
        </Link>
        <nav className="flex items-center text-sm">{children}</nav>
      </div>
      <div className="h-1 sm:h-1.5 brand-stripe" />
    </header>
  );
}
