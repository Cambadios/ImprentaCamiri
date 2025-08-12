// src/clientes/ClienteForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../api/api';
import Modal from '../components/Modal'; // Importamos el Modal

const ClienteForm = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(true);  // Modal control
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (telefono.length !== 8) {
      setError('El teléfono debe tener exactamente 8 dígitos');
      return;
    }

    const cliente = { nombre, apellido, telefono, correo };

    try {
      const response = await fetch(urlApi + '/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });

      if (response.ok) {
        alert('✅ Cliente registrado correctamente');
        navigate('/clientes');
      } else {
        const data = await response.json();
        setError(data.message || 'Error al registrar cliente');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
    }
  };

  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    if (/^\d{0,8}$/.test(valor)) {
      setTelefono(valor);
    }
  };

  return (
    <div>
      <Modal showModal={mostrarModal} handleClose={() => setMostrarModal(false)}>
        <h2>Registrar Cliente</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            required
            style={inputStyle}
          />

          <label>Apellido:</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Apellido completo"
            required
            style={inputStyle}
          />

          <label>Teléfono (8 dígitos):</label>
          <input
            type="text"
            value={telefono}
            onChange={handleTelefonoChange}
            required
            placeholder="Ej: 71234567"
            style={inputStyle}
          />

          <label>Correo (opcional):</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="cliente@ejemplo.com"
            style={inputStyle}
          />

          <div style={buttonContainerStyle}>
            <button type="button" onClick={() => navigate('/clientes')} style={buttonCancelStyle}>
              Cancelar
            </button>
            <button type="submit" style={buttonSubmitStyle}>Registrar Cliente</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Estilos
const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
};

const buttonCancelStyle = {
  padding: '10px 20px',
  backgroundColor: '#888',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const buttonSubmitStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default ClienteForm;
