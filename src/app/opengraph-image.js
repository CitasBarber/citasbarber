import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CitasApp.co — Agenda con WhatsApp para barberías, mascotas y spas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0c10",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Halo de fondo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(194,123,46,0.22) 0%, transparent 55%)",
          }}
        />

        {/* Logo CA + nombre */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 28 }}>
          <div
            style={{
              width: 92,
              height: 92,
              backgroundColor: "#f5f0e8",
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 40px rgba(194,123,46,0.35)",
            }}
          >
            <span style={{ fontSize: 46, fontWeight: 900, color: "#0b0c10", lineHeight: 1 }}>C</span>
            <span style={{ fontSize: 46, fontWeight: 900, color: "#c27b2e", lineHeight: 1 }}>A</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 76, fontWeight: 900, color: "#c27b2e", lineHeight: 1 }}>Citas</span>
            <span style={{ fontSize: 76, fontWeight: 900, color: "#f5f0e8", lineHeight: 1 }}>App</span>
            <span style={{ fontSize: 50, fontWeight: 900, color: "#c27b2e", lineHeight: 1.3 }}>.co</span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "#9ca3af",
            margin: "0 0 44px 0",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Agenda con WhatsApp para barberías, peluquerías de mascotas y spas
        </p>

        {/* Brand pills */}
        <div style={{ display: "flex", gap: 18 }}>
          {[
            { label: "CitasBarber", color: "#e3262f" },
            { label: "CitasPet",    color: "#0f8a7e" },
            { label: "CitasSpa",    color: "#e4604f" },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `2px solid ${b.color}`,
                borderRadius: 100,
                padding: "10px 26px",
                fontSize: 22,
                color: "#f5f0e8",
                fontWeight: 700,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: b.color }} />
              {b.label}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ position: "absolute", bottom: 30, fontSize: 16, color: "#4b5563" }}>
          citasapp.co · Hecho en Colombia
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
