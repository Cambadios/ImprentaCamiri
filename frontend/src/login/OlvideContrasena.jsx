import { useState } from 'react';
import { urlApi } from '../api/api';

function OlvideContrasena() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Enviando enlace...');

    try {
      const res = await fetch(urlApi + '/api/usuarios/olvide-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
      });

      const data = await res.json();
      setMensaje(data.mensaje || 'Revisa tu correo electrónico.');
    } catch (error) {
      setMensaje('Error al intentar enviar el enlace.');
      console.error(error);
    }
  };

  return (
    <div className="form-container">
      <h2>¿Olvidaste tu Contraseña?</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Ingresa tu correo electrónico"
          required
        />
        <button type="submit">Enviar enlace</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default OlvideContrasena;
