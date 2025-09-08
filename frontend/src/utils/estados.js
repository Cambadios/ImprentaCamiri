// Canon + mapeo de sinónimos → canon
export const ESTADOS_CANON = ["Pendiente", "En proceso", "Entregado", "Cancelado"];

const MAP_IN = new Map([
  // Pendiente
  ["pendiente", "Pendiente"], ["pending", "Pendiente"], ["nuevo", "Pendiente"],
  ["new", "Pendiente"], ["open", "Pendiente"], ["abierto", "Pendiente"],

  // En proceso
  ["en proceso", "En proceso"], ["en_proceso", "En proceso"], ["proceso", "En proceso"],
  ["en producción", "En proceso"], ["produccion", "En proceso"], ["producción", "En proceso"],
  ["en produccion", "En proceso"], ["processing", "En proceso"], ["process", "En proceso"],
  ["en curso", "En proceso"],

  // Entregado
  ["entregado", "Entregado"], ["entrega", "Entregado"], ["cerrado", "Entregado"],
  ["closed", "Entregado"], ["finalizado", "Entregado"], ["hecho", "Entregado"],
  ["done", "Entregado"], ["listo", "Entregado"],

  // Cancelado
  ["cancelado", "Cancelado"], ["anulado", "Cancelado"], ["cancel", "Cancelado"],
  ["canceled", "Cancelado"], ["void", "Cancelado"],
]);

export function toCanonEstado(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  return MAP_IN.get(s) ?? (s ? (s[0].toUpperCase() + s.slice(1)) : "");
}

// si quieres asegurar que SIEMPRE salga uno de los 4, usa esta (fallback a Pendiente)
export function toCanonStrict(raw) {
  const c = toCanonEstado(raw);
  return ESTADOS_CANON.includes(c) ? c : "Pendiente";
}
