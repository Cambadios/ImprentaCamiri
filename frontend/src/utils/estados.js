// utils/estados.js
export const ORDER_STATES = ["Pendiente", "En Produccion", "Hecho", "Entregado"];

// alias y normalización (acepta 'En proceso' y variantes con tilde)
const ALIAS = new Map([
  ["pendiente", "Pendiente"],
  ["en proceso", "En Produccion"],
  ["en produccion", "En Produccion"],
  ["en producción", "En Produccion"],
  ["produccion", "En Produccion"],
  ["producción", "En Produccion"],
  ["hecho", "Hecho"],
  ["terminado", "Hecho"],
  ["listo", "Hecho"],
  ["entregado", "Entregado"],
]);

export function toCanonEstado(raw) {
  if (!raw) return "";
  const k = String(raw).trim().toLowerCase();
  return (
    ALIAS.get(k) ||
    (ORDER_STATES.includes(capFirst(String(raw))) ? capFirst(String(raw)) : "")
  );
}

export function toCanonStrict(raw) {
  const c = toCanonEstado(raw);
  return ORDER_STATES.includes(c) ? c : "";
}

export const TRANSITIONS = {
  Pendiente: ["En Produccion"],
  "En Produccion": ["Hecho"],
  Hecho: ["Entregado"],
  Entregado: [],
};

export function nextStatesOf(from) {
  const cur = toCanonStrict(from) || "Pendiente";
  return TRANSITIONS[cur] || [];
}

// Reglas para MAQUINARIA: no pueden pasar a "Entregado"
export function nextStatesOfForMaquinaria(from) {
  return nextStatesOf(from).filter((s) => s !== "Entregado");
}

function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}