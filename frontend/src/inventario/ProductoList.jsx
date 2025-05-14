import React, { useState, useEffect } from 'react';

const ProductoList = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProductos();
  }, []);

  return (
    <div>
      <h2>Productos en Inventario</h2>
      {productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <ul>
          {productos.map((producto) => (
            <li key={producto._id}>
              <strong>{producto.nombre}</strong><br />
              Cantidad: {producto.cantidad}<br />
              Descripción: {producto.descripcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductoList;
