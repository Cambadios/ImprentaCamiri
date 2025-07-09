import React, { useEffect, useState } from "react";
import DashboardChartTable from "./DashboardChartTable";
import { urlApi } from "../api/api";

function DashboardProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(urlApi + "/api/inventario") // Aquí pones la API correcta que quieras usar
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <DashboardChartTable
      title="Cantidad de Productos en Inventario (Dashboard Productos)"
      data={productos}
    />
  );
}

export default DashboardProductos;
