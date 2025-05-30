// src/pedidos/PedidoList.jsx
import React, { useState, useEffect } from 'react';
import { getPedidos, deletePedido } from './PedidoService';
import VolverPrincipal from '../comunes/VolverPrincipal';
import { Link } from 'react-router-dom';

function PedidoList() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosOriginales, setPedidosOriginales] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const fetchPedidos = async () => {
      const data = await getPedidos();
      setPedidos(data);
      setPedidosOriginales(data); // para filtrar y restaurar
    };
    fetchPedidos();
  }, []);

  const aplicarFiltro = () => {
    if (estadoFiltro) {
      const filtrados = pedidosOriginales.filter(p => p.estado === estadoFiltro);
      setPedidos(filtrados);
    }
  };

  const limpiarFiltro = () => {
    setEstadoFiltro('');
    setPedidos(pedidosOriginales);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      await deletePedido(id);
      const data = await getPedidos();
      setPedidos(data);
      setPedidosOriginales(data);
    }
  };

  const abrirModal = (pedido) => {
    setPedidoEditando({ ...pedido });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setPedidoEditando(null);
  };

  const guardarCambios = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoEditando)
      });
      if (response.ok) {
        alert('✅ Cambios guardados');
        const updatedPedidos = await getPedidos();
        setPedidos(updatedPedidos);
        setPedidosOriginales(updatedPedidos);
        cerrarModal();
      } else {
        alert('❌ Error al guardar cambios');
      }
    } catch (error) {
      alert('❌ Error de conexión');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <VolverPrincipal />
      <h2 style={{ textAlign: 'center' }}>Lista de Pedidos</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/pedidos/agregar">
          <button style={buttonStyle}>Agregar Pedido</button>
        </Link>
      </div>

      {/* Filtro por estado */}
      <div style={{ margin: '20px auto', maxWidth: '400px', textAlign: 'center' }}>
        <label style={{ marginRight: '10px' }}>Filtrar por estado:</label>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value="">Seleccione</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        <button onClick={aplicarFiltro} style={{ marginLeft: '10px', ...buttonStyle }}>
          Buscar
        </button>
        <button onClick={limpiarFiltro} style={{ marginLeft: '10px', ...buttonStyle, backgroundColor: '#6c  757d' }}>
          Ver todos
        </button>
      </div>

      {pedidos.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No hay pedidos disponibles.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {pedidos.map(p => (
            <div key={p._id} style={cardStyle}>
              <h3>{p.producto ? p.producto.nombre : 'Producto no disponible'}</h3> {/* Mostrar nombre del producto */}
              <p><strong>Cliente:</strong> {p.cliente}</p>
              <p><strong>Cantidad:</strong> {p.cantidad}</p>
              <p><strong>Precio Total:</strong> Bs {p.precioTotal}</p>
              <p><strong>Pago Cliente:</strong> Bs {p.pagoCliente}</p>
              <p><strong>Saldo Pendiente:</strong> Bs {p.precioTotal - p.pagoCliente}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '5px',
                  backgroundColor: getEstadoColor(p.estado),
                  color: '#fff'
                }}>
                  {p.estado}
                </span>
              </p>
              {p.fechaEntrega && (
                <p><strong>Entrega Estimada:</strong> {new Date(p.fechaEntrega).toLocaleDateString()}</p>
              )}
              <button onClick={() => handleDelete(p._id)} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>Eliminar</button>
              <button onClick={() => abrirModal(p)} style={{ ...buttonStyle, backgroundColor: '#ffc107', marginTop: '10px' }}>Editar</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {mostrarModal && pedidoEditando && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Editar Pedido</h3>

            <label>Cliente:</label>
            <input
              type="text"
              value={pedidoEditando.cliente}
              onChange={(e) => setPedidoEditando({ ...pedidoEditando, cliente: e.target.value })}
              style={inputStyle}
            />

            <label>Producto:</label>
            <input
              type="text"
              value={pedidoEditando.producto}
              onChange={(e) => setPedidoEditando({ ...pedidoEditando, producto: e.target.value })}
              style={inputStyle}
            />

            <label>Cantidad:</label>
            <input
              type="number"
              value={pedidoEditando.cantidad}
              onChange={(e) => setPedidoEditando({ ...pedidoEditando, cantidad: e.target.value })}
              style={inputStyle}
            />

            <label>Precio Total (Bs):</label>
            <input
              type="number"
              value={pedidoEditando.precioTotal}
              onChange={(e) => setPedidoEditando({ ...pedidoEditando, precioTotal: e.target.value })}
              style={inputStyle}
            />

            <label>Pago del Cliente (Bs):</label>
            <input
              type="number"
              value={pedidoEditando.pagoCliente}
              onChange={(e) => setPedidoEditando({ ...pedidoEditando, pagoCliente: e.target.value })}
              style={inputStyle}
            />

            <label>Estado:</label>
            <select
              value={pedidoEditando.estado}
              onChange={(e) => setPedidoEditando({ ...pedidoEditando, estado: e.target.value })}
              style={inputStyle}
            >
              <option>Pendiente</option>
              <option>En proceso</option>
              <option>Entregado</option>
              <option>Cancelado</option>
            </select>

            <label>Fecha de Entrega:</label>
            <input
              type="date"
              value={pedidoEditando.fechaEntrega ? pedidoEditando.fechaEntrega.split('T')[0] : ''}
              onChange={(e) => setPedidoEditando({ ...pedidoEditando, fechaEntrega: e.target.value })}
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
}

// 🎨 Colores por estado
const getEstadoColor = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return '#dc3545'; // rojo
    case 'En proceso':
      return '#ffc107'; // amarillo
    case 'Entregado':
      return '#28a745'; // verde
    case 'Cancelado':
      return '#6c757d'; // gris
    default:
      return '#999';
  }
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
  marginBottom: '10px',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const cardStyle = {
  width: '280px',
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  textAlign: 'left'
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

export default PedidoList;
