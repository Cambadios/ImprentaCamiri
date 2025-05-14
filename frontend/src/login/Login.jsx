import { useState } from "react";
import { useNavigate } from "react-router-dom";  // Importar hook para redireccionamiento
import './Login.css';  // Asegúrate de tener los estilos para el login

function Login() {
  const [nombre, setNombre] = useState("");  // Estado para nombre de usuario
  const [contraseña, setContraseña] = useState("");  // Estado para contraseña
  const [mensaje, setMensaje] = useState("");  // Estado para mensaje de error o éxito
  const navigate = useNavigate();  // Usar hook para redireccionamiento

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Realizar solicitud POST para hacer login
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, contraseña }),  // Enviar nombre y contraseña al backend
    });

    const text = await res.text();
    setMensaje(text);  // Mostrar mensaje de éxito o error

    // Si el login es exitoso, redirigir a la página principal
    if (text.includes("exitoso")) {
      navigate("/principal");  // Redirige a la página principal
    }
  };

  return (
    <div className="login-container">
      {/* Fondo del login */}
      <div className="login-background"></div>
      
      <div className="login-form">
        {/* Avatar de usuario */}
        <div className="login-avatar">
          <img
            src="https://www.w3schools.com/w3images/avatar2.png"
            alt="Persona"
          />
        </div>
        
        {/* Título del formulario */}
        <h2 className="login-title">Bienvenido Imprenta Camiri</h2>

        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleSubmit}>
          {/* Campo para el nombre de usuario */}
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Email o Usuario"
            className="input-field"
            required
          />

          {/* Campo para la contraseña */}
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            placeholder="Contraseña"
            className="input-field"
            required
          />
          
          {/* Botón para iniciar sesión */}
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        {/* Mensaje de error o éxito */}
        {mensaje && (
          <p className={`message ${mensaje.includes("exitoso") ? 'success' : 'error'}`}>
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
