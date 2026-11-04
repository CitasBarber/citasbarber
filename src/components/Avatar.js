// Avatar del profesional: muestra la foto si existe, o la inicial del nombre.
export default function Avatar({ foto, nombre, className = "w-12 h-12", text = "text-xl" }) {
  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={foto}
        alt={nombre || "Foto de perfil"}
        className={`${className} rounded-full object-cover border border-black/10 bg-crema`}
      />
    );
  }
  return (
    <div className={`${className} rounded-full bg-tinta text-white grid place-items-center font-display ${text}`}>
      {nombre?.[0]?.toUpperCase() || "B"}
    </div>
  );
}
