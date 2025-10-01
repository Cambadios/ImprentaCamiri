// components/EstadoDropdwon.jsx
import React from "react";
import { Dropdown } from "primereact/dropdown";
import {
  ORDER_STATES,
  toCanonEstado,
  nextStatesOf,
  nextStatesOfForMaquinaria,
} from "../utils/estados";

export default function EstadoDropdown({
  value,
  onChange,
  placeholder = "Selecciona estado",
  current,          // estado actual del pedido
  scope = "general" // "general" | "maquinaria"
}) {
  const cur = toCanonEstado(current) || "Pendiente";
  const allowedNext =
    scope === "maquinaria" ? nextStatesOfForMaquinaria(cur) : nextStatesOf(cur);

  // Regla: se muestran TODOS, pero solo se habilita:
  // - el estado actual (para mostrarlo) y
  // - el/los estados siguientes permitidos.
  const options = ORDER_STATES.map((e) => ({
    label: e,
    value: e,
    disabled: e !== cur && !allowedNext.includes(e),
  }));

  return (
    <Dropdown
      value={toCanonEstado(value)}
      options={options}
      optionDisabled="disabled"
      onChange={(e) => onChange?.(e.value)}
      placeholder={allowedNext.length ? placeholder : "No hay siguiente estado"}
      className="w-full"
      panelClassName="rounded-md"
      showClear
    />
  );
}