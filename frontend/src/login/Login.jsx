import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';  // Asegúrate de que este archivo exista para estilos

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Intentando conectar...');

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMensaje('Error: ' + errorData.mensaje);
        return;
      }

      const data = await res.json();
      setMensaje(data.mensaje);

      if (data.mensaje.includes("exitoso")) {
        // Guardar el rol del usuario en localStorage
        localStorage.setItem("role", data.rol);

        // Redirigir según el rol del usuario
        if (data.rol === "administrador") {
          navigate("/admin");
        } else if (data.rol === "usuario_normal") {
          navigate("/principal");
        } else {
          setMensaje("Rol desconocido");
        }
      }
    } catch (error) {
      setMensaje("Error en la conexión con el servidor");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-form">
        <div className="login-avatar">
          <img src="https://www.w3schools.com/w3images/avatar2.png" alt="Persona" />
        </div>

        <h2 className="login-title">Bienvenido Imprenta Camiri</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Email"
            className="input-field"
            required
          />

          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            placeholder="Contraseña"
            className="input-field"
            required
          />

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

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
