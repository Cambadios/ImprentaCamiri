import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { urlApi } from '../api/api';

const InventarioForm = () => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esPorDocena, setEsPorDocena] = useState(false);
  const [numDocenas, setNumDocenas] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const producto = {
      nombre,
      cantidad,
      descripcion,
      esPorDocena,
      numDocenas: esPorDocena ? numDocenas : 0
    };

    try {
      const response = await fetch(urlApi + '/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
      });

      if (response.ok) {
        alert('✅ Producto agregado correctamente al inventario');
        navigate('/inventario');
      } else {
        const data = await response.json();
        alert('❌ Error al agregar producto: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error al conectar con el servidor');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Agregar Producto al Inventario</h2>

      <form onSubmit={handleSubmit}>
        <label>Nombre del producto:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Cantidad:</label>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
          style={inputStyle}
        />

        <label>
          <input
            type="checkbox"
            checked={esPorDocena}
            onChange={(e) => setEsPorDocena(e.target.checked)}
            style={{ marginRight: '10px' }}
          />
          ¿El producto es por docena?
        </label>

        {esPorDocena && (
          <>
            <label>Cantidad de docenas:</label>
            <input
              type="number"
              value={numDocenas}
              onChange={(e) => setNumDocenas(e.target.value)}
              required
              style={inputStyle}
            />
          </>
        )}

        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          style={{ ...inputStyle, height: '80px' }}
        />

        <div style={buttonContainerStyle}>
          <Link to="/inventario">
            <button type="button" style={buttonCancelStyle}>
              Volver al Inventario
            </button>
          </Link>

          <button type="submit" style={buttonSubmitStyle}>
            Agregar
          </button>
        </div>
      </form>
    </div>
  );
};

// Estilos
const containerStyle = {
  maxWidth: '500px',
  margin: '30px auto',
  padding: '20px',
  backgroundColor: '#f4f4f4',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px'
};

const buttonCancelStyle = {
  padding: '10px 20px',
  backgroundColor: '#888',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const buttonSubmitStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default InventarioForm;
