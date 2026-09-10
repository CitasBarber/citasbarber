// Íconos SVG inspirados en la ilustración de barbería (negro/rojo/azul).

export function PosteBarbero({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 32 96" className={className} aria-hidden="true">
      <rect x="8" y="6" width="16" height="84" rx="8" fill="#fff" stroke="#111" strokeWidth="2" />
      <clipPath id="pole">
        <rect x="9" y="14" width="14" height="68" rx="6" />
      </clipPath>
      <g clipPath="url(#pole)">
        <g>
          <rect x="0" y="0" width="60" height="120" fill="#fff" />
          <g transform="rotate(35 16 48)">
            <rect x="-30" y="-40" width="10" height="200" fill="#e11d2a" />
            <rect x="-10" y="-40" width="10" height="200" fill="#1e50a0" />
            <rect x="10" y="-40" width="10" height="200" fill="#e11d2a" />
            <rect x="30" y="-40" width="10" height="200" fill="#1e50a0" />
          </g>
        </g>
      </g>
      <rect x="6" y="2" width="20" height="8" rx="4" fill="#111" />
      <rect x="6" y="86" width="20" height="8" rx="4" fill="#111" />
    </svg>
  );
}

export function Tijeras({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export function Navaja({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21c4-2 8-6 12-12l3-3-1-1-3 1C8 10 5 15 3 21z" />
      <path d="M17 4l3-1" />
    </svg>
  );
}

export function Bigote({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 64 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M32 10c-4-6-10-8-16-6-4 1.4-7 4-9 8 3-3 7-4 11-3 4 1 6 3 8 6 2-3 4-5 8-6 4-1 8 0 11 3-2-4-5-6.6-9-8-6-2-12 0-16 6z" transform="translate(0 2)" />
    </svg>
  );
}

export function Peine({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M3 9h18v3H3z" />
      <path d="M6 12v4M9 12v4M12 12v4M15 12v4M18 12v4" />
    </svg>
  );
}

export function Silla({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4v8h12V4" />
      <path d="M5 12h14l1 4H4z" />
      <path d="M7 16v3M17 16v3M12 19v2" />
      <path d="M9 21h6" />
    </svg>
  );
}

export function OjoAbierto({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function OjoCerrado({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.7.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.5A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.9.9-2.8-.2-.3A8 8 0 1112 20z" />
    </svg>
  );
}
