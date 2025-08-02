import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VolverPrincipal from '../comunes/VolverPrincipal';
import { urlApi } from '../api/api';

const InventarioList = () => {
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const fetchProductos = async () => {
    try {
      const response = await fetch(urlApi + '/api/inventario');
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      alert('Error al obtener los productos del inventario');
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      const response = await fetch(urlApi + `/inventario/${id}`, {
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

  const abrirModal = (producto) => {
    setProductoEditando({ ...producto });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setProductoEditando(null);
  };

  const guardarCambios = async () => {
    try {
      const response = await fetch(urlApi + `/api/inventario/${productoEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoEditando),
      });

      if (response.ok) {
        alert('Cambios guardados');
        fetchProductos();
        cerrarModal();
      } else {
        const data = await response.json();
        alert('Error al guardar: ' + data.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <VolverPrincipal />
      <h2 style={{ textAlign: 'center' }}>Productos en Inventario</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/inventario/agregar">
          <button style={buttonStyle}>Agregar Producto</button>
        </Link>
      </div>

      {productos.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No hay productos disponibles.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Docenas</th>
              <th>Descripción</th>
              <th>Fecha de Ingreso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto._id}>
                <td>{producto.codigo}</td>
                <td>{producto.nombre}</td>
                <td>{producto.cantidad}</td>
                <td>{producto.esPorDocena ? producto.numDocenas : '-'}</td>
                <td>{producto.descripcion}</td>
                <td>{new Date(producto.fechaIngreso).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => eliminarProducto(producto._id)}
                    style={{ ...buttonStyle, backgroundColor: '#dc3545', marginRight: '5px' }}
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => abrirModal(producto)}
                    style={{ ...buttonStyle, backgroundColor: '#ffc107' }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarModal && productoEditando && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Editar Producto</h3>

            <label>Código (no editable):</label>
            <input
              type="text"
              value={productoEditando.codigo || ''}
              disabled
              style={{ ...inputStyle, backgroundColor: '#eee' }}
            />

            <label>Nombre:</label>
            <input
              type="text"
              value={productoEditando.nombre}
              onChange={(e) => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
              style={inputStyle}
            />

            <label>Cantidad:</label>
            <input
              type="number"
              value={productoEditando.cantidad}
              onChange={(e) => setProductoEditando({ ...productoEditando, cantidad: e.target.value })}
              style={inputStyle}
            />

            <label>
              <input
                type="checkbox"
                checked={productoEditando.esPorDocena || false}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    esPorDocena: e.target.checked,
                    numDocenas: e.target.checked ? productoEditando.numDocenas : 0,
                  })
                }
              /> ¿Es por docena?
            </label>

            {productoEditando.esPorDocena && (
              <>
                <label>Docenas:</label>
                <input
                  type="number"
                  value={productoEditando.numDocenas}
                  onChange={(e) =>
                    setProductoEditando({ ...productoEditando, numDocenas: e.target.value })}
                  style={inputStyle}
                />
              </>
            )}

            <label>Descripción:</label>
            <textarea
              value={productoEditando.descripcion}
              onChange={(e) => setProductoEditando({ ...productoEditando, descripcion: e.target.value })}
              style={{ ...inputStyle, height: '60px' }}
            />

            <label>Fecha de Ingreso:</label>
            <input
              type="date"
              value={productoEditando.fechaIngreso?.split('T')[0] || ''}
              onChange={(e) => setProductoEditando({ ...productoEditando, fechaIngreso: e.target.value })}
              style={inputStyle}
            />

            <div style={modalButtonContainerStyle}>
              <button onClick={cerrarModal} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
                Cancelar
              </button>
              <button onClick={guardarCambios} style={{ ...buttonStyle, backgroundColor: '#28a745', marginLeft: '10px' }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos
const buttonStyle = {
  padding: '6px 10px',
  borderRadius: '4px',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  margin: '5px 0 10px 0',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '400px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 0 10px rgba(0,0,0,0.3)'
};

const modalButtonContainerStyle = {
  marginTop: '20px',
  textAlign: 'right'
};

export default InventarioList;
