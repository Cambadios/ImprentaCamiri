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

    setMensaje('Intentando conectar...');  // Mensaje de carga mientras se intenta conectar

    try {
      // Realizar la petición al backend
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, contraseña }),  // Enviar nombre y contraseña en formato JSON
      });

      console.log(res)
      if (!res.ok) {
        // Si la respuesta no es correcta, intentamos leer el cuerpo como JSON o texto
        let errorMsg;
        try {
          const errorData = await res.json();  // Intentar leer la respuesta como JSON
          errorMsg = errorData.mensaje || JSON.stringify(errorData);
        } catch (jsonError) {
          // Si no es un JSON válido, leer como texto
          errorMsg = await res.text();
        }
        setMensaje('Error: ' + errorMsg);
        return;
      }

      // Leer la respuesta como JSON
      const data = await res.json();
      console.log('Respuesta login:', data);  // Para depurar en consola

      setMensaje(data.mensaje);

      if (data.mensaje.includes("exitoso")) {
        // Redirigir a la ruta correspondiente según el rol
        if (data.rol === "administrador") {
          navigate("/admin");
        } else {
          navigate("/principal");
        }
      }
    } catch (error) {
      console.error('Error en fetch:', error);
      setMensaje("Error en la conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      
      <div className="login-form">
        <div className="login-avatar">
          <img
            src="https://www.w3schools.com/w3images/avatar2.png"
            alt="Persona"
          />
        </div>
        
        <h2 className="login-title">Bienvenido Imprenta Camiri</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Email o Usuario"
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
