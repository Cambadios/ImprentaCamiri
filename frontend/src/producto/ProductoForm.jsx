import React, { useState, useEffect } from 'react';

const ProductoForm = ({ productoActual, onGuardado, onCancelar }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [categoria, setCategoria] = useState('');
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    if (productoActual) {
      setNombre(productoActual.nombre || '');
      setDescripcion(productoActual.descripcion || '');
      setPrecioUnitario(productoActual.precioUnitario || '');
      setCategoria(productoActual.categoria || '');
      setMaterialesSeleccionados(productoActual.materiales || []);
    }
    const cargarInventario = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/inventario');
        if (!res.ok) throw new Error('Error al cargar inventario');
        const data = await res.json();
        setInventario(data);
      } catch (error) {
        alert('Error al cargar inventario: ' + error.message);
      }
    };

    cargarInventario();
  }, [productoActual]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const producto = {
      nombre,
      descripcion,
      precioUnitario: parseFloat(precioUnitario),
      categoria,
      materiales: materialesSeleccionados,
    };

    try {
      const url = productoActual
        ? `http://localhost:3000/api/productos/${productoActual._id}`
        : 'http://localhost:3000/api/productos';

      const method = productoActual ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
      });

      if (!response.ok) {
        const data = await response.json();
        alert('Error: ' + (data.message || 'Error al guardar producto'));
        return;
      }

      const data = await response.json();
      onGuardado(data);
      if (!productoActual) {
        setNombre('');
        setDescripcion('');
        setPrecioUnitario('');
        setCategoria('');
        setMaterialesSeleccionados([]);
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  const handleMaterialSeleccionado = (materialId) => {
    setMaterialesSeleccionados((prev) => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId);
      }
      return [...prev, materialId];
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          style={{ ...inputStyle, height: '60px' }}
        />
      </div>

      <div>
        <label>Precio Unitario:</label>
        <input
          type="number"
          step="0.01"
          value={precioUnitario}
          onChange={(e) => setPrecioUnitario(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label>Categoría:</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Selecciona una categoría</option>
          <option value="banner">Banner</option>
          <option value="poster">Poster</option>
          <option value="agenda">Agenda</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </div>

      <div>
        <label>Materiales:</label>
        <div style={{ ...inputStyle, padding: '10px 0' }}>
          {inventario.map(material => (
            <label key={material._id} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={materialesSeleccionados.includes(material._id)}
                onChange={() => handleMaterialSeleccionado(material._id)}
              />
              {material.nombre} - Disponible: {material.cantidad} {material.esPorDocena ? `(${material.numDocenas} docenas)` : ''}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button type="submit" style={buttonStyle}>
          {productoActual ? 'Guardar Cambios' : 'Agregar Producto'}
        </button>
        {productoActual && (
          <button
            type="button"
            onClick={onCancelar}
            style={{ ...buttonStyle, marginLeft: '10px', backgroundColor: '#6c757d' }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  marginTop: '5px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  boxSizing: 'border-box',
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#007bff',
  color: 'white',
  cursor: 'pointer',
};

export default ProductoForm;
