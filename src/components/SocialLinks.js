// Enlaces a redes sociales del barbero. Acepta "@usuario", "usuario" o URL completa.

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

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1018.6 12 6.6 6.6 0 0012 5.4zm0 10.9A4.3 4.3 0 1116.3 12 4.3 4.3 0 0112 16.3zm6.9-11.1a1.54 1.54 0 11-1.54-1.54 1.54 1.54 0 011.54 1.54z" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 10-11.56 9.88v-7H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.9h-2.34v7A10 10 0 0022 12z" />
    </svg>
  );
}
function TkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 01-1.02-2.82h-3.1v11.9a2.53 2.53 0 11-1.8-2.42V9.3a5.62 5.62 0 103.6 5.24V9.01a7.35 7.35 0 004.3 1.38V7.28a4.28 4.28 0 01-1.98-1.46z" />
    </svg>
  );
}

export default function SocialLinks({ redes = {}, className = "" }) {
  const items = [
    { red: "instagram", icon: <IgIcon />, valor: redes.instagram },
    { red: "facebook", icon: <FbIcon />, valor: redes.facebook },
    { red: "tiktok", icon: <TkIcon />, valor: redes.tiktok },
  ]
    .map((x) => ({ ...x, url: urlDe(x.red, x.valor) }))
    .filter((x) => x.url);

  if (items.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map((x) => (
        <a
          key={x.red}
          href={x.url}
          target="_blank"
          rel="noreferrer"
          aria-label={x.red}
          className="text-barber-ink hover:text-barber-red transition"
        >
          {x.icon}
        </a>
      ))}
    </div>
  );
}
