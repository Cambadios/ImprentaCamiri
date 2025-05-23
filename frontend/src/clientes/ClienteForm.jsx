import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cliente.css'; // Asegúrate de importar el CSS aquí

const ClienteForm = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (telefono.length !== 8) {
      alert('El teléfono debe tener exactamente 8 dígitos');
      return;
    }

    const cliente = { nombre, apellido, telefono, correo };

    try {
      const response = await fetch('http://localhost:3000/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });

      if (response.ok) {
        alert('✅ Cliente registrado correctamente');
        navigate('/clientes');
      } else {
        const data = await response.json();
        alert('❌ Error al registrar: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error al conectar con el servidor');
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
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Apellido:</label>
        <input
          type="text"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />

        <label>Teléfono (8 dígitos):</label>
        <input
          type="text"
          value={telefono}
          onChange={handleTelefonoChange}
          required
          placeholder="+591"
        />

        <label>Correo (opcional):</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="correo@gmail.com"
        />

        <button type="submit">Registrar Cliente</button>
      </form>
    </div>
  );
};

export default ClienteForm;
