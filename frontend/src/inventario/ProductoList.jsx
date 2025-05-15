import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VolverPrincipal from '../comunes/VolverPrincipal'; // Ajusta ruta si es necesario

const ProductoList = () => {
  const [productos, setProductos] = useState([]);

  const fetchProductos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/productos');
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      alert('Error al obtener los productos');
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/producto/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Producto eliminado correctamente');
        fetchProductos();
      } else {
        alert('Error al eliminar producto');
      }
    } catch (error) {
      alert('Error al eliminar producto');
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <div>
      <VolverPrincipal />
      <h2>Productos en Inventario</h2>

      <Link to="/inventario/agregar">
        <button>Agregar Producto</button>
      </Link>

      {productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <ul>
          {productos.map((producto) => (
            <li key={producto._id}>
              <strong>{producto.nombre}</strong><br />
              Cantidad: {producto.cantidad}<br />
              Descripción: {producto.descripcion}<br />
              <button onClick={() => eliminarProducto(producto._id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductoList;
