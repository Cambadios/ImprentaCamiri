import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ProductoForm = () => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esPorDocena, setEsPorDocena] = useState(false);
  const [numDocenas, setNumDocenas] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const producto = {
      nombre,
      cantidad,
      descripcion,
      esPorDocena,
      numDocenas: esPorDocena ? numDocenas : 0,
      imagenUrl
    };

    try {
      const response = await fetch('http://localhost:3000/api/producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
      });

      if (response.ok) {
        alert('✅ Producto agregado correctamente');
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
    <div style={{
      maxWidth: '500px',
      margin: '30px auto',
      padding: '20px',
      backgroundColor: '#f4f4f4',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Agregar Producto</h2>

      <form onSubmit={handleSubmit}>
        <label>Nombre del producto:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Unidad:</label>
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
        ></textarea>

        <label>URL de la imagen:</label>
        <input
          type="text"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          placeholder="https://..."
          style={inputStyle}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Link to="/inventario">
            <button type="button" style={{ ...buttonStyle, backgroundColor: '#888' }}>
              Volver al Inventario
            </button>
          </Link>

          <button type="submit" style={{ ...buttonStyle, backgroundColor: '#007bff' }}>
            Agregar
          </button>
        </div>
      </form>
    </div>
  );
};

// Estilos reutilizables
const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '10px 20px',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default ProductoForm;
