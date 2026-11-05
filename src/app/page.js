import CitasAppLanding from "@/components/CitasAppLanding";

export const metadata = {
  title: "CitasApp · Agenda con WhatsApp para barberías, peluquerías de mascotas y spas",
  description:
    "CitasApp: la app de citas con WhatsApp para tu negocio. Sin descargar nada, sin permanencia, con tu nombre y tus colores. CitasBarber, CitasPet y CitasSpa.",
  icons: {
    icon: [{ url: "/citasapp-icon.png", type: "image/png" }],
    apple: "/citasapp-icon.png",
  },
  openGraph: {
    title: "CitasApp · Agenda con WhatsApp",
    description:
      "La app de citas con WhatsApp para barberías, peluquerías de mascotas y spas. Sin descargar nada.",
    locale: "es_CO",
    type: "website",
  },
};

export default function Page() {
  return <CitasAppLanding />;
}
