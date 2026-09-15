// Enlaces a redes sociales del barbero en formato píldora / chips con identidad de marca.
// Acepta "@usuario", "usuario" o URL completa.

function urlDe(red, valor) {
  if (!valor) return null;
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const user = v.replace(/^@/, "");
  if (red === "instagram") return `https://instagram.com/${user}`;
  if (red === "facebook") return `https://facebook.com/${user}`;
  if (red === "tiktok") return `https://tiktok.com/@${user}`;
  return null;
}

function handleDe(red, valor) {
  if (!valor) return "";
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[0] ? `@${parts[0].replace(/^@/, "")}` : red;
    } catch {
      return red;
    }
  }
  const clean = v.replace(/^@/, "");
  return `@${clean}`;
}

function IgIcon({ className = "w-4 h-4 sm:w-5 sm:h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TkIcon({ className = "w-4 h-4 sm:w-5 sm:h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.45 6.26 6.26 0 001.89-4.47V8.65a8.21 8.21 0 004.84 1.56V6.75a4.85 4.85 0 01-1-.06z" />
    </svg>
  );
}

function FbIcon({ className = "w-4 h-4 sm:w-5 sm:h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const CONFIG_REDES = {
  instagram: {
    nombre: "Instagram",
    icon: IgIcon,
    estilos:
      "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:brightness-110 shadow-sm shadow-pink-500/20",
  },
  tiktok: {
    nombre: "TikTok",
    icon: TkIcon,
    estilos:
      "bg-neutral-900 text-white hover:bg-black border border-neutral-700/80 shadow-sm",
  },
  facebook: {
    nombre: "Facebook",
    icon: FbIcon,
    estilos:
      "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-sm shadow-blue-500/20",
  },
};

export default function SocialLinks({ redes = {}, className = "", conTitulo = true }) {
  const items = Object.entries(CONFIG_REDES)
    .map(([key, config]) => {
      const valor = redes[key];
      const url = urlDe(key, valor);
      const handle = handleDe(key, valor);
      return {
        key,
        nombre: config.nombre,
        IconComponent: config.icon,
        estilos: config.estilos,
        url,
        handle,
      };
    })
    .filter((x) => x.url);

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {conTitulo && (
        <span className="text-[11px] uppercase tracking-wider font-bold text-barber-gray/90 flex items-center gap-1.5">
          <span>📸</span> Mira mis cortes y trabajos
        </span>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        {items.map((x) => {
          const Icon = x.IconComponent;
          return (
            <a
              key={x.key}
              href={x.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${x.nombre}: ${x.handle}`}
              className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 min-h-[42px] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${x.estilos}`}
            >
              <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span className="font-bold truncate max-w-[140px] sm:max-w-[180px]">
                {x.handle}
              </span>
              <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[11px] leading-none">
                ↗
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
