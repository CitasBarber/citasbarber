// Configuración de las submarcas de CitasApp. Es la única fuente de verdad de
// nombre, colores, logos, favicon y textos de cada nicho. Se usa tanto en el
// navegador (selector, header, componentes) como en el servidor (mensajes de
// WhatsApp, push, calendario), así que no debe importar nada de React.
//
// Para agregar una marca nueva basta con agregar una entrada en BRANDS: los
// colores se inyectan como variables CSS desde aquí (ver cssDeMarcas) y el
// selector del header la muestra automáticamente.

export const MARCA_DEFAULT = "barber";
export const STORAGE_KEY = "citas-brand";
export const PARAM_URL = "marca";

// Emojis por codepoint (misma regla que src/lib/emojis.js: nada literal).
const EMOJI = {
  POSTE: String.fromCodePoint(0x1F488),
  HUELLA: String.fromCodePoint(0x1F43E),
  ESMALTE: String.fromCodePoint(0x1F485),
};

export const BRANDS = {
  barber: {
    id: "barber",
    slug: "citasbarber", // segmento de URL en /[slug]
    nombre: "CitasBarber",
    nicho: "Barber", // palabra que acompaña a "Citas" en el logo
    icono: "poste", // ícono del header: poste | huella | esmalte
    colores: {
      brand: "#e3262f",
      brandOnDark: "#e3262f",
      brandDeep: "#b81d24",
      brandSoft: "#fdeaea",
      brandAccent: "#1d3fa8",
      onBrand: "#ffffff",
    },
    stripe: "repeating-linear-gradient(-45deg,#e3262f 0 8px,#fff 8px 16px,#1d3fa8 16px 24px,#fff 24px 32px)",
    logos: {
      oscuro: "/brand/citasbarber-logo-oscuro.svg",
      claro: "/brand/citasbarber-logo-claro.svg",
    },
    favicon: "/brand/citasbarber-icono.svg",
    iconoApp: "/brand/citasbarber-icono-perfil.png", // 1080x1080, app instalada
    textos: {
      hero: "Tu motilada sin filas ni vueltas.",
      profesional: "barbero",
      profesionales: "barberos",
      negocio: "barbería",
      escogeProfesional: "Escogé tu barbero",
      servicioEjemplo: "Corte básico",
      cta: "¡Pedí tu cita!",
      emoji: EMOJI.POSTE,
      sujetoCliente: null,
      cierreEspera: "¡Ahí lo esperamos!",
      firmaCitas: "Agenda tus citas fácil con",
      descHero: "Agendá con tu barbero de confianza en un momentico. Solo das tu nombre y el celu, y te llega la confirmación por WhatsApp. ¡Así de fácil!",
      ctaEscoger: "Escogé con quién querés agendar",
      verboAgendar: "Agendá",
    },
  },
  pet: {
    id: "pet",
    slug: "citaspet",
    nombre: "CitasPet",
    nicho: "Pet",
    icono: "huella",
    colores: {
      brand: "#0f8a7e",
      brandOnDark: "#2bbfae",
      brandDeep: "#075a52",
      brandSoft: "#e6f4f1",
      brandAccent: "#ffb627",
      onBrand: "#ffffff",
    },
    stripe: "repeating-linear-gradient(-45deg,#0f8a7e 0 8px,#fff 8px 16px,#ffb627 16px 24px,#fff 24px 32px)",
    logos: {
      oscuro: "/brand/citaspet-logo-oscuro.svg",
      claro: "/brand/citaspet-logo-claro.svg",
    },
    favicon: "/brand/citaspet-icono.svg",
    iconoApp: "/brand/citaspet-icono-perfil.png", // 1080x1080, app instalada
    textos: {
      hero: "El baño de tu peludito sin filas ni vueltas.",
      profesional: "groomer",
      profesionales: "groomers",
      negocio: "peluquería canina",
      escogeProfesional: "Elige el groomer de tu peludito",
      servicioEjemplo: "Baño y corte",
      cta: "¡Agenda la cita de tu peludito!",
      emoji: EMOJI.HUELLA,
      sujetoCliente: "tu peludito",
      cierreEspera: "¡Ahí esperamos a tu peludito!",
      firmaCitas: "Agenda la cita de tu peludito con",
      descHero: "Agenda para tu peludito en un momentico. Solo das tu nombre y el celu, y te llega la confirmación por WhatsApp. ¡Así de fácil!",
      ctaEscoger: "Elige con quién quieres agendar para tu peludito",
      verboAgendar: "Agenda",
    },
  },
  spa: {
    id: "spa",
    slug: "citasspa",
    nombre: "CitasSpa",
    nicho: "Spa",
    icono: "esmalte",
    colores: {
      brand: "#e4604f",
      brandOnDark: "#f08a7c",
      brandDeep: "#a8382c",
      brandSoft: "#fde8e3",
      brandAccent: "#f6b8a8",
      onBrand: "#ffffff",
    },
    stripe: "repeating-linear-gradient(-45deg,#e4604f 0 8px,#fff 8px 16px,#f6b8a8 16px 24px,#fff 24px 32px)",
    logos: {
      oscuro: "/brand/citasspa-logo-oscuro.svg",
      claro: "/brand/citasspa-logo-claro.svg",
    },
    favicon: "/brand/citasspa-icono.svg",
    iconoApp: "/brand/citasspa-icono-perfil.png", // 1080x1080, app instalada
    textos: {
      hero: "Tus manos perfectas, sin filas ni vueltas.",
      profesional: "especialista",
      profesionales: "especialistas",
      negocio: "spa",
      escogeProfesional: "Elige tu especialista",
      servicioEjemplo: "Manicure semipermanente",
      cta: "¡Agenda tu cita!",
      emoji: EMOJI.ESMALTE,
      sujetoCliente: null,
      cierreEspera: "¡Te esperamos!",
      firmaCitas: "Agenda tus citas con",
      descHero: "Agenda con tu especialista de confianza en un momentico. Solo das tu nombre y el celu, y te llega la confirmación por WhatsApp. ¡Así de fácil!",
      ctaEscoger: "Elige con quién quieres agendar",
      verboAgendar: "Agenda",
    },
  },
};

export const LISTA_MARCAS = Object.values(BRANDS);

export function esMarcaValida(id) {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(BRANDS, id);
}

// Devuelve la marca por su slug de URL (/citasbarber → barber config).
export function marcaPorSlug(slug) {
  return LISTA_MARCAS.find((m) => m.slug === slug) || null;
}

// Devuelve la configuración de una marca, cayendo a la de por defecto si el id
// no existe (p. ej. negocios antiguos sin campo `marca`).
export function obtenerMarca(id) {
  return BRANDS[esMarcaValida(id) ? id : MARCA_DEFAULT];
}

export function capitalizar(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// "#e3262f" -> "227 38 47" (formato que Tailwind necesita para soportar
// modificadores de opacidad como bg-brand/10).
function canales(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const VARIABLES = {
  brand: "--brand",
  brandOnDark: "--brand-on-dark",
  brandDeep: "--brand-deep",
  brandSoft: "--brand-soft",
  brandAccent: "--brand-accent",
  onBrand: "--on-brand",
};

// Genera el CSS con las variables de cada marca bajo [data-brand="..."]. La
// marca por defecto también se aplica a :root para que la página nunca quede
// sin colores aunque el atributo todavía no exista.
export function cssDeMarcas() {
  return LISTA_MARCAS.map((m) => {
    const decl = Object.entries(VARIABLES)
      .map(([k, v]) => `${v}:${m.colores[k]};${v}-rgb:${canales(m.colores[k])};`)
      .join("");
    const selector = m.id === MARCA_DEFAULT ? `:root,[data-brand="${m.id}"]` : `[data-brand="${m.id}"]`;
    return `${selector}{${decl}--stripe:${m.stripe};}`;
  }).join("\n");
}

// Manifest de la PWA para una marca. Lo sirven app/manifest.js (marca por
// defecto) y /api/manifest?marca=... (el que BrandProvider enlaza al cambiar).
export function manifestDeMarca(id) {
  const m = obtenerMarca(id);
  return {
    name: m.nombre,
    short_name: m.nombre,
    description: `${m.textos.hero} Agendá en ${m.nombre} sin llamadas ni filas.`,
    start_url: `/?${PARAM_URL}=${m.id}`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0c10", // --tinta
    theme_color: m.colores.brand,
    lang: "es-CO",
    icons: [
      { src: m.favicon, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: m.iconoApp, sizes: "1080x1080", type: "image/png", purpose: "any" },
      { src: m.iconoApp, sizes: "1080x1080", type: "image/png", purpose: "maskable" },
    ],
  };
}

// Script mínimo que corre en <head> antes de pintar: aplica la marca guardada.
// Orden de prioridad: ruta /[slug] → ?marca= → localStorage → defecto.
export function scriptMarcaInicial() {
  const ids = JSON.stringify(LISTA_MARCAS.map((m) => m.id));
  const slugMap = JSON.stringify(Object.fromEntries(LISTA_MARCAS.map((m) => [m.slug, m.id])));
  return `(function(){try{` +
    `var v=${ids},slugs=${slugMap};` +
    `var sm=location.pathname.match(/^\\/(citasbarber|citaspet|citasspa)(?:\\/|$)/);` +
    `var m=sm?slugs[sm[1]]:null;` +
    `if(!m){m=new URLSearchParams(location.search).get(${JSON.stringify(PARAM_URL)});}` +
    `if(v.indexOf(m)<0){m=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})}` +
    `if(v.indexOf(m)<0){m=${JSON.stringify(MARCA_DEFAULT)}}` +
    `document.documentElement.setAttribute("data-brand",m)` +
    `}catch(e){}})();`;
}
