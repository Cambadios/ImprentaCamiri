import React, { useEffect, useState } from "react";

function DashboardProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/pedidos/productos")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Dashboard - Productos en Pedidos</h2>
      <table>
        <thead>
          <tr><th>Producto</th></tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => (
            <tr key={i}><td>{producto}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardProductos;
