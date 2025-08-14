import React from "react";
import { urlApi } from "../../../api/api";

export default function Reportes() {
  const abrirPDF = () => {
    window.open(`${urlApi}/api/reporte-pdf`, "_blank");
  };

  return (
    <div className="at-panel">
      <h3>Reportes</h3>
      <p className="at-muted">Genera y descarga reportes del sistema.</p>
      <button className="at-btn" onClick={abrirPDF}>Generar reporte PDF</button>
    </div>
  );
}
