import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cliente.css';
import { urlApi } from '../api/api';

const ClienteForm = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
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

  const handleVolver = () => {
    navigate('/clientes');
  };

  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    if (/^\d{0,8}$/.test(valor)) {
      setTelefono(valor);
    }
  };

  return (
    <div className="form-container">
      <button onClick={handleVolver} className="volver-btn">
        ← Volver a Clientes
      </button>
      <h2>Registrar Cliente</h2>
      <form className="cliente-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
          required
        />

        <label>Apellido:</label>
        <input
          type="text"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          placeholder="Apellido completo"
          required
        />

        <label>Teléfono (8 dígitos):</label>
        <input
          type="text"
          value={telefono}
          onChange={handleTelefonoChange}
          required
          placeholder="Ej: 71234567"
        />

        <label>Correo (opcional):</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="cliente@ejemplo.com"
        />

        <button type="submit">Registrar Cliente</button>
      </form>
    </div>
  );
};

export default ClienteForm;
