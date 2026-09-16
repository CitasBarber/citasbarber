import "./globals.css";
import { Inter, Oswald } from "next/font/google";
import InstallPrompt from "@/components/InstallPrompt";
import DialogProvider from "@/components/DialogProvider";

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

export const metadata = {
  title: "770 Barbería — Agendá tu motilada",
  description:
    "770 Barbería (Caldas, Antioquia). Agendá tu motilada en un momentico, sin llamadas ni filas.",
  // Permite que iOS trate la web como app (pantalla completa) al agregarla a
  // la pantalla de inicio.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "770 Barbería",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`}>
      <body>
        <DialogProvider>
          {children}
          <InstallPrompt />
        </DialogProvider>
      </body>
    </html>
  );
}
