import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VolverPrincipal from '../comunes/VolverPrincipal';

const ProductoList = () => {
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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
      const response = await fetch(`http://localhost:3000/api/producto/${productoEditando._id}`, {
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {productos.map((producto) => (
            <div key={producto._id} style={cardStyle}>
              {producto.imagenUrl ? (
                <img
                  src={producto.imagenUrl}
                  alt={producto.nombre}
                  style={imagenEstilo}
                />
              ) : (
                <div style={{ ...imagenEstilo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  Sin imagen
                </div>
              )}
              <h3>{producto.nombre}</h3>
              <p><strong>Unidad:</strong> {producto.cantidad}</p>
              {producto.esPorDocena && (
              <p><strong>Docenas:</strong> {producto.numDocenas}</p>
              )}
              <p><strong>Descripción:</strong> {producto.descripcion}</p>


              <button
                onClick={() => eliminarProducto(producto._id)}
                style={{ ...buttonStyle, backgroundColor: '#dc3545' }}
              >
                Eliminar
              </button>

              <button
                onClick={() => abrirModal(producto)}
                style={{ ...buttonStyle, backgroundColor: '#ffc107', marginTop: '10px' }}
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {mostrarModal && productoEditando && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Editar Producto</h3>

            <label>Nombre:</label>
            <input
              type="text"
              value={productoEditando.nombre}
              onChange={(e) => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
              style={inputStyle}
            />

            <label>Unidad:</label>
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
              />
              {' '}¿Es por docena?
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
            ></textarea>



            <label>URL Imagen:</label>
            <input
              type="text"
              value={productoEditando.imagenUrl}
              onChange={(e) => setProductoEditando({ ...productoEditando, imagenUrl: e.target.value })}
              style={inputStyle}
            />

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
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

// 🎨 Estilos
const buttonStyle = {
  padding: '10px 15px',
  borderRadius: '5px',
  border: 'none',
  color: '#fff',
  backgroundColor: '#007bff',
  cursor: 'pointer'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  margin: '5px 0 10px 0',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

const cardStyle = {
  width: '250px',
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  textAlign: 'left'
};

const imagenEstilo = {
  width: '100%',
  height: '150px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '10px',
  backgroundColor: '#e0e0e0'
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

export default ProductoList;
