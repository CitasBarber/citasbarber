const MAPA = {
  solicitada: { label: "Solicitada", clase: "bg-amber-100 text-amber-800" },
  confirmada: { label: "Confirmada", clase: "bg-green-100 text-green-800" },
  rechazada: { label: "Rechazada", clase: "bg-red-100 text-red-800" },
  completada: { label: "Completada", clase: "bg-blue-100 text-blue-800" },
  cancelada: { label: "Cancelada", clase: "bg-gray-200 text-gray-700" },
  no_asistio: { label: "No asistió", clase: "bg-rose-100 text-rose-800" },
  // estados de barbero
  pendiente: { label: "Pendiente", clase: "bg-amber-100 text-amber-800" },
  activo: { label: "Activo", clase: "bg-green-100 text-green-800" },
  inactivo: { label: "Inactivo", clase: "bg-gray-200 text-gray-700" },
};

export default function EstadoBadge({ estado }) {
  const info = MAPA[estado] || { label: estado, clase: "bg-gray-100 text-gray-700" };
  return <span className={`badge ${info.clase}`}>{info.label}</span>;
}
