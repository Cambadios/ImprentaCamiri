import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createUsuario, updateUsuario, getUsuarios } from './UsuarioService';

const UsuarioForm = () => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [carnetIdentidad, setCarnetIdentidad] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [rol, setRol] = useState('usuario');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      // Si hay id, cargar usuario para editar
      fetchUsuario();
    }
  }, [id]);

  const fetchUsuario = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/usuario/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNombreCompleto(data.nombreCompleto);
        setCorreo(data.correo);
        setTelefono(data.telefono);
        setCarnetIdentidad(data.carnetIdentidad);
        setRol(data.rol);
      } else {
        alert('Error al cargar usuario');
      }
    } catch {
      alert('Error al cargar usuario');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombreCompleto || !correo || !telefono || !carnetIdentidad || (!contraseña && !id)) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    const usuarioData = { nombreCompleto, correo, telefono, carnetIdentidad, rol };
    if (!id) usuarioData.contraseña = contraseña; // Solo enviar contraseña al crear

    try {
      if (id) {
        await updateUsuario(id, usuarioData);
        alert('Usuario actualizado correctamente');
      } else {
        await createUsuario(usuarioData);
        alert('Usuario creado correctamente');
      }
      navigate('/usuarios');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2>{id ? 'Editar Usuario' : 'Crear Usuario'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Nombre completo:</label>
        <input
          type="text"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          required
        />

        <label>Correo:</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <label>Teléfono:</label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />

        <label>Carnet de identidad:</label>
        <input
          type="text"
          value={carnetIdentidad}
          onChange={(e) => setCarnetIdentidad(e.target.value)}
          required
        />

        {!id && (
          <>
            <label>Contraseña:</label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required={!id}
            />
          </>
        )}

        <label>Rol:</label>
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="usuario">Usuario</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" style={{ marginTop: '15px' }}>
          {id ? 'Actualizar' : 'Crear'}
        </button>
      </form>
    </div>
  );
};

export default UsuarioForm;
