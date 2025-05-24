import React, { useState, useEffect } from 'react';
import ProductoForm from './ProductoForm';
import { useNavigate } from 'react-router-dom';

const ProductoList = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editandoProducto, setEditandoProducto] = useState(null);
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/productos');
      if (!res.ok) throw new Error('Error al obtener productos');
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      alert('Error al cargar productos: ' + error.message);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/productos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      setProductos(productos.filter(p => p._id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGuardado = (productoGuardado) => {
    setProductos([...productos, productoGuardado]);
    setShowModal(false);
  };

  const handleCancelarEdicion = () => {
    setEditandoProducto(null);
  };

  const handleVolverAdmin = () => {
    navigate('/admin');
  };

  const handleAbrirModal = () => {
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setEditandoProducto(null);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Botón Volver a Admin */}
      <button onClick={handleVolverAdmin} style={volverButtonStyle}>
        Volver a Admin
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Lista de Productos</h2>

      {/* Botón para abrir el modal de agregar producto */}
      <div style={centerButtonStyle}>
        <button onClick={handleAbrirModal} style={agregarButtonStyle}>
          Agregar Nuevo Producto
        </button>
      </div>

      {/* Modal de agregar producto */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>Agregar Nuevo Producto</h2>
            <ProductoForm
              productoActual={editandoProducto}
              onGuardado={handleGuardado}
              onCancelar={handleCerrarModal}
            />
            <button onClick={handleCerrarModal} style={buttonCloseStyle}>
              Cerrar sin guardar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Materiales</th> {/* Nueva columna para materiales */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr><td colSpan="5" style={noProductsStyle}>No hay productos</td></tr>
          ) : (
            productos.map(producto => (
              <tr key={producto._id}>
                <td>{producto.nombre}</td>
                <td>{producto.categoria}</td>
                <td>{`Bs ${producto.precioUnitario.toFixed(2)}`}</td>

                {/* Mostrar los materiales y sus descripciones */}
                <td>
                  {producto.materiales && producto.materiales.length > 0 ? (
                    <ul style={{ padding: 0, margin: 0 }}>
                      {producto.materiales.map(material => (
                        <li key={material._id}>
                          {material.nombre}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>No materiales asociados</span>
                  )}
                </td>

                <td style={actionsStyle}>
                  <button onClick={() => setEditandoProducto(producto)} style={editButtonStyle}>
                    Editar
                  </button>
                  <button onClick={() => handleEliminar(producto._id)} style={deleteButtonStyle}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Estilos
const volverButtonStyle = {
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#f5f5dc', // Beige
  color: '#333',
  cursor: 'pointer',
  position: 'absolute',
  top: '10px',
  left: '10px',
};

const agregarButtonStyle = {
  padding: '12px 24px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#007bff', // Azul
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px',
};

const centerButtonStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
  textAlign: 'center',
};

const noProductsStyle = {
  textAlign: 'center',
  padding: '20px',
  color: '#888',
};

const actionsStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const editButtonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '10px',
};

const deleteButtonStyle = {
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '5px',
  cursor: 'pointer',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
};

const buttonCloseStyle = {
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#6c757d',
  color: 'white',
  cursor: 'pointer',
  marginTop: '10px',
  width: '100%',
};

export default ProductoList;
