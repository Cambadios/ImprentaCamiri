import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { urlApi } from '../api/api';

const ClienteList = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(urlApi + '/api/clientes');
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        alert('Error al obtener los clientes');
      }
    };

    fetchClientes();
  }, []);

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Deseas eliminar este cliente?')) return;

    try {
      const response = await fetch(urlApi + `/api/clientes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClientes(clientes.filter((c) => c._id !== id));
        alert('Cliente eliminado correctamente');
      } else {
        alert('Error al eliminar el cliente');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const abrirModal = (cliente) => {
    setClienteEditando({ ...cliente });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setClienteEditando(null);
  };

  const guardarCambios = async () => {
    try {
      const response = await fetch(urlApi + `:3000/api/clientes/${clienteEditando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteEditando),
      });

      if (response.ok) {
        const actualizados = await fetch(urlApi + '/api/clientes');
        const data = await actualizados.json();
        setClientes(data);
        cerrarModal();
      } else {
        alert('Error al actualizar cliente');
      }
    } catch (error) {
      alert('Error al guardar cambios');
    }
  };

  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    if (/^\d{0,8}$/.test(valor)) {
      setClienteEditando({ ...clienteEditando, telefono: valor });
    }
  };

  const handleVolver = () => {
    navigate('/admin');
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={handleVolver} style={{ ...buttonStyle, backgroundColor: '#6c757d', marginBottom: '20px' }}>
        ← Volver al Admin
      </button>

      <h2 style={{ textAlign: 'center' }}>Lista de Clientes</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/clientes/agregar">
          <button style={{ ...buttonStyle, backgroundColor: '#28a745' }}>Agregar Cliente</button>
        </Link>
      </div>

      {clientes.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No hay clientes registrados.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {clientes.map((cliente) => (
            <div key={cliente._id} style={cardStyle}>
              <h3>{cliente.nombre} {cliente.apellido}</h3>
              <p><strong>Teléfono:</strong> {cliente.telefono}</p>
              <p><strong>Correo:</strong> {cliente.correo || 'No registrado'}</p>
              <button onClick={() => eliminarCliente(cliente._id)} style={{ ...buttonStyle, backgroundColor: '#dc3545', marginTop: '10px' }}>
                Eliminar
              </button>
              <button onClick={() => abrirModal(cliente)} style={{ ...buttonStyle, backgroundColor: '#ffc107', marginTop: '10px' }}>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {mostrarModal && clienteEditando && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Editar Cliente</h3>

            <label>Nombre:</label>
            <input
              type="text"
              value={clienteEditando.nombre}
              onChange={(e) => setClienteEditando({ ...clienteEditando, nombre: e.target.value })}
              style={inputStyle}
            />

            <label>Apellido:</label>
            <input
              type="text"
              value={clienteEditando.apellido}
              onChange={(e) => setClienteEditando({ ...clienteEditando, apellido: e.target.value })}
              style={inputStyle}
            />

            <label>Teléfono:</label>
            <input
              type="text"
              value={clienteEditando.telefono}
              onChange={handleTelefonoChange}
              maxLength={8}
              style={inputStyle}
            />

            <label>Correo:</label>
            <input
              type="email"
              value={clienteEditando.correo || ''}
              onChange={(e) => setClienteEditando({ ...clienteEditando, correo: e.target.value })}
              style={inputStyle}
            />

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={cerrarModal} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>Cancelar</button>
              <button onClick={guardarCambios} style={{ ...buttonStyle, backgroundColor: '#28a745', marginLeft: '10px' }}>Guardar</button>
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
  marginBottom: '10px',
  padding: '8px',
  borderRadius: '4px',
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

export default ClienteList;
