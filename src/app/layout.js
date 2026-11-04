import "./globals.css";
import { Inter, Oswald, Anton } from "next/font/google";
import InstallPrompt from "@/components/InstallPrompt";
import DialogProvider from "@/components/DialogProvider";
import BrandProvider from "@/components/BrandProvider";
import { BRANDS, MARCA_DEFAULT, cssDeMarcas, scriptMarcaInicial } from "@/lib/brands";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});

// Metadata del servidor con la marca por defecto (lo que ven buscadores y la
// primera carga). En el navegador, BrandProvider cambia título, favicon,
// theme-color y manifest según la marca activa.
const MARCA_INICIAL = BRANDS[MARCA_DEFAULT];

export const metadata = {
  title: `${MARCA_INICIAL.nombre} — ${MARCA_INICIAL.textos.hero}`,
  description: `${MARCA_INICIAL.nombre}. ${MARCA_INICIAL.textos.hero} Agendá en un momentico, sin llamadas.`,
  // Permite que iOS trate la web como app (pantalla completa) al agregarla a
  // la pantalla de inicio.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: MARCA_INICIAL.nombre,
  },
  icons: {
    icon: [{ url: MARCA_INICIAL.favicon, type: "image/svg+xml" }],
    apple: MARCA_INICIAL.iconoApp,
  },
};

export const viewport = {
  themeColor: BRANDS[MARCA_DEFAULT].colores.brand,
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: el script de <head> pone data-brand antes de
    // que React hidrate, así que el atributo difiere del HTML del servidor.
    <html lang="es" data-brand={MARCA_DEFAULT} className={`${inter.variable} ${oswald.variable} ${anton.variable}`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssDeMarcas() }} />
        <script dangerouslySetInnerHTML={{ __html: scriptMarcaInicial() }} />
      </head>
      <body>
        <BrandProvider>
          <DialogProvider>
            {children}
            <InstallPrompt />
          </DialogProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
