import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlApi } from '../api/api';

function RestablecerContrasena() {
  const { token } = useParams();
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Actualizando contraseña...');

    try {
      const res = await fetch(urlApi + `/api/usuarios/restablecer-contrasena/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaContrasena })
      });

      const data = await res.json();
      setMensaje(data.mensaje);

      if (res.ok) {
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (error) {
      setMensaje('Error al restablecer la contraseña.');
      console.error(error);
    }
  };

  return (
    <div className="form-container">
      <h2>Restablecer Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
          placeholder="Nueva contraseña"
          required
        />
        <button type="submit">Actualizar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default RestablecerContrasena;
