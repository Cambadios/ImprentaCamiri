import React, { useState } from 'react';
import { createCliente, getClientes, deleteCliente } from '../clientes/ClienteService';  // Importación correcta

const ProductoForm = () => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const producto = { nombre, cantidad, descripcion };

    try {
      const response = await fetch('http://localhost:3000/api/producto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Producto agregado correctamente');
        setNombre('');
        setCantidad('');
        setDescripcion('');
      } else {
        alert('Error al agregar producto: ' + data.message);
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div>
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <label>Cantidad:</label>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        ></textarea>
        <button type="submit">Agregar</button>
      </form>
    </div>
  );
};

export default ProductoForm;
