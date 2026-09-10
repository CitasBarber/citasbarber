import "./globals.css";

export const metadata = {
  title: "770 Barbería — Agendá tu motilada",
  description:
    "770 Barbería (Caldas, Antioquia). Agendá tu motilada en un momentico, sin llamadas ni filas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
