import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductoForm = () => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const producto = { nombre, cantidad, descripcion };

    try {
      const response = await fetch('http://localhost:3000/api/producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
      });

      if (response.ok) {
        alert('Producto agregado correctamente');
        navigate('/inventario');
      } else {
        const data = await response.json();
        alert('Error al agregar producto: ' + data.message);
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  const handleVolver = () => {
    navigate('/inventario');
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <button onClick={handleVolver} style={{ marginBottom: '20px' }}>
        ← Volver al Inventario
      </button>
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <label>Cantidad:</label>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        ></textarea>
        <button type="submit" style={{ padding: '10px 20px' }}>Agregar</button>
      </form>
    </div>
  );
};

export default ProductoForm;
