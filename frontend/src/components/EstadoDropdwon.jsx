import React from "react";
import { Dropdown } from "primereact/dropdown";
import { ESTADOS_CANON, toCanonEstado } from "../utils/estados";

export default function EstadoDropdown({ value, onChange, placeholder="Selecciona estado", disabled }) {
  const canon = toCanonEstado(value);
  const options = ESTADOS_CANON.map(e => ({ label: e, value: e }));

  return (
    <Dropdown
      value={canon || null}
      options={options}
      onChange={(e) => onChange?.(e.value)}
      placeholder={placeholder}
      className="w-full"
      panelClassName="rounded-md"
      disabled={disabled}
      showClear
    />
  );
}
