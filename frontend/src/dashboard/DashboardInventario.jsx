import React, { useEffect, useState } from "react";
import DashboardChartTable from "./DashboardChartTable";
import { urlApi } from "../api/api";

function DashboardInventario() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(urlApi + "/api/inventario")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar inventario");
        return res.json();
      })
      .then((data) => {
        setInventario(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando inventario...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <DashboardChartTable
      title="Cantidad de Productos en Inventario (Dashboard Inventario)"
      data={inventario}
    />
  );
}

export default DashboardInventario;
