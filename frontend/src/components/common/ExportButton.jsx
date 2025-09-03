import React from "react";
import { ROOT } from "../../api/http";

/**
 * Exporta CSV abriendo una URL de tu backend con los filtros actuales.
 *
 * props:
 *  - endpoint: string (ej. "/api/clientes/export")
 *  - params:   objeto { q, estado, from, to, ids, page, limit, ... }
 *  - label:    texto del botón (por defecto "Exportar CSV")
 */
export default function ExportButton({ endpoint, params = {}, label = "Exportar CSV" }) {
  const onClick = () => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) sp.set(k, v.join(","));
      else sp.set(k, String(v));
    });
    sp.set("format", "csv");
    const url = `${ROOT}${endpoint}?${sp.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
      type="button"
    >
      {label}
    </button>
  );
}
