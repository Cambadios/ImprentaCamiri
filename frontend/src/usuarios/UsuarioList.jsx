import React, { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './UsuarioService';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modo, setModo] = useState('agregar');

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    carnetIdentidad: '',
    rol: 'usuario_normal',
    contrasena: '',
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch {
      alert('Error al obtener usuarios');
    }
  };

  const abrirModalAgregar = () => {
    setModo('agregar');
    setFormData({
      nombreCompleto: '',
      correo: '',
      telefono: '',
      carnetIdentidad: '',
      rol: 'usuario_normal',
      contrasena: '',
    });
    setErrores({});
    setUsuarioEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModo('editar');
    setUsuarioEditando(usuario);
    setFormData({
      nombreCompleto: usuario.nombreCompleto || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      carnetIdentidad: usuario.carnetIdentidad || '',
      rol: usuario.rol || 'usuario_normal',
      contrasena: '',
    });
    setErrores({});
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setUsuarioEditando(null);
    setErrores({});
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: null }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formData.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = 'El nombre completo es obligatorio';
    }
    if (!formData.correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio';
    } else if (!formData.correo.endsWith('@gmail.com')) {
      nuevosErrores.correo = 'El correo debe terminar en @gmail.com';
    }
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^[0-9]{1,8}$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener máximo 8 dígitos numéricos';
    }
    if (!formData.carnetIdentidad.trim()) {
      nuevosErrores.carnetIdentidad = 'El carnet de identidad es obligatorio';
    }
    if (modo === 'agregar' && !formData.contrasena.trim()) {
      nuevosErrores.contrasena = 'La contraseña es obligatoria';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarCambios = async () => {
    if (!validar()) return;

    try {
      if (modo === 'agregar') {
        await createUsuario(formData);
        alert('Usuario agregado correctamente');
      } else if (modo === 'editar') {
        const { contrasena, ...dataSinPass } = formData;
        await updateUsuario(usuarioEditando._id, dataSinPass);
        alert('Usuario actualizado correctamente');
      }
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      alert('Error al guardar usuario: ' + (error.message || error));
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Deseas eliminar este usuario?')) return;
    try {
      await deleteUsuario(id);
      setUsuarios(usuarios.filter(u => u._id !== id));
      alert('Usuario eliminado correctamente');
    } catch {
      alert('Error al eliminar usuario');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => window.history.back()}
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer' }}
        >
          ← Volver atrás
        </button>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>Lista de Usuarios</h2>

      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <button
          onClick={abrirModalAgregar}
          style={{ padding: '12px 25px', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          Agregar Usuario
        </button>
      </div>

      {usuarios.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>No hay usuarios registrados.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {usuarios.map((usuario) => (
            <div
              key={usuario._id}
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              <div>
                <p><strong>Nombre:</strong> {usuario.nombreCompleto}</p>
                <p><strong>Correo:</strong> {usuario.correo}</p>
                <p><strong>Teléfono:</strong> {usuario.telefono || '-'}</p>
                <p><strong>Carnet:</strong> {usuario.carnetIdentidad || '-'}</p>
                <p><strong>Rol:</strong> {usuario.rol}</p>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                  onClick={() => abrirModalEditar(usuario)}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#007bff',
                    color: 'white',
                    fontWeight: '600',
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarUsuario(usuario._id)}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    fontWeight: '600',
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '400px',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 12px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ marginBottom: '15px' }}>
              {modo === 'agregar' ? 'Agregar Usuario' : 'Editar Usuario'}
            </h3>

            <label>Nombre Completo:</label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={manejarCambio}
              style={inputStyle}
            />
            {errores.nombreCompleto && <p style={errorStyle}>{errores.nombreCompleto}</p>}

            <label>Correo:</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={manejarCambio}
              style={inputStyle}
            />
            {errores.correo && <p style={errorStyle}>{errores.correo}</p>}

            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={manejarCambio}
              style={inputStyle}
              maxLength={8}
            />
            {errores.telefono && <p style={errorStyle}>{errores.telefono}</p>}

            <label>Carnet de identidad:</label>
            <input
              type="text"
              name="carnetIdentidad"
              value={formData.carnetIdentidad}
              onChange={manejarCambio}
              style={inputStyle}
            />
            {errores.carnetIdentidad && <p style={errorStyle}>{errores.carnetIdentidad}</p>}

            <label>Rol:</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={manejarCambio}
              style={inputStyle}
            >
              <option value="usuario_normal">Usuario Normal</option>
              <option value="administrador">Administrador</option>
            </select>

            {modo === 'agregar' && (
              <>
                <label>Contraseña:</label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={manejarCambio}
                  style={inputStyle}
                  required
                />
                {errores.contrasena && <p style={errorStyle}>{errores.contrasena}</p>}
              </>
            )}

            <div style={{ marginTop: '25px', textAlign: 'right' }}>
              <button onClick={cerrarModal} style={{ marginRight: '15px', padding: '8px 15px' }}>
                Cancelar
              </button>
              <button onClick={guardarCambios} style={{ padding: '8px 20px' }}>
                {modo === 'agregar' ? 'Agregar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  marginBottom: '8px',
  padding: '8px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '1rem',
};

const errorStyle = {
  color: 'red',
  marginTop: '-6px',
  marginBottom: '10px',
  fontSize: '0.9rem',
};

export default UsuarioList;
