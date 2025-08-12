import React, { useState, useEffect } from 'react';
import { getPedidos, deletePedido } from './PedidoService';
import VolverPrincipal from '../comunes/VolverPrincipal';
import { Link } from 'react-router-dom';
import { urlApi } from '../api/api';
import Modal from '../components/Modal'; // Importamos el modal

function PedidoList() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [pedidosOriginales, setPedidosOriginales] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const data = await getPedidos();
      setPedidos(data);
      setPedidosOriginales(data); // Para filtrar y restaurar
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
      try {
        const response = await fetch(`${urlApi}/api/pedidos/${id}`, {
          method: 'DELETE',  // Usar DELETE para eliminar
        });

        if (response.ok) {
          const data = await response.json(); // Respuesta en formato JSON
          alert(data.message); // Mensaje de éxito
          const updatedPedidos = await getPedidos();
          setPedidos(updatedPedidos);
          setPedidosOriginales(updatedPedidos);
        } else {
          alert('❌ Error al eliminar el pedido');
        }
      } catch (error) {
        alert('❌ Error de conexión');
      }
    }
  };

  const abrirModal = (pedido) => {
    setPedidoEditando(pedido);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setPedidoEditando(null);
  };

  const guardarCambios = async () => {
    try {
      const response = await fetch(urlApi + `/api/pedidos/${pedidoEditando._id}`, {
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
        <button onClick={limpiarFiltro} style={{ marginLeft: '10px', ...buttonStyle, backgroundColor: '#6c757d' }}>
          Ver todos
        </button>
      </div>

      {pedidos.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No hay pedidos disponibles.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {pedidos.map(p => (
            <div key={p._id} style={cardStyle}>
              <h3>{p.producto ? p.producto.nombre : 'Producto no disponible'}</h3>
              <p><strong>Cliente:</strong> {p.cliente ? p.cliente.nombre : 'Cliente no disponible'}</p>  {/* Muestra el nombre del cliente */}
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
      <Modal showModal={mostrarModal} handleClose={cerrarModal}>
        <h3>Editar Pedido</h3>

        <label>Cliente:</label>
        <input
          type="text"
          value={pedidoEditando?.cliente?.nombre || ''}
          onChange={(e) => setPedidoEditando({ ...pedidoEditando, cliente: { ...pedidoEditando.cliente, nombre: e.target.value } })}
          style={inputStyle}
        />

        {/* Otros campos del pedido */}
        
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={cerrarModal} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
            Cancelar
          </button>
          <button onClick={guardarCambios} style={{ ...buttonStyle, backgroundColor: '#28a745', marginLeft: '10px' }}>
            Guardar
          </button>
        </div>
      </Modal>
    </div>
  );
}

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

export default PedidoList;
