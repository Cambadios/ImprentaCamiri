import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { urlApi } from "../api/api";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("Intentando conectar...");

    try {
      const res = await fetch(`${urlApi}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      // Error HTTP
      if (!res.ok) {
        let errorMsg = "Credenciales inválidas";
        try {
          const errorData = await res.json();
          errorMsg = errorData?.mensaje || errorMsg;
        } catch (_) {}
        setMensaje("Error: " + errorMsg);
        return;
      }

      // Éxito
      const data = await res.json();
      setMensaje(data.mensaje || "Login exitoso");

      if ((data.mensaje || "").toLowerCase().includes("exitoso")) {
        // Guardar solo lo que el backend devuelve realmente
        localStorage.setItem("role", data.rol || "");
        const userPayload = {
          id: data.id,
          nombreCompleto: data.nombreCompleto,
          correo, // del formulario
        };
        localStorage.setItem("usuario", JSON.stringify(userPayload));

        // Navegación por rol
        const rol = (data.rol || "").toLowerCase();
        if (rol === "admin" || rol === "administrador") {
          navigate("/admin");
        } else if (rol === "usuario" || rol === "usuario_normal") {
          navigate("/principal");
        } else {
          setMensaje("Rol desconocido: " + data.rol);
        }
      }
    } catch (error) {
      console.error("Error en login:", error);
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

        <h2 className="login-title">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Correo"
            className="input-field"
            required
          />

          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Contraseña"
            className="input-field"
            required
          />

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link to="/olvide-contrasena" className="forgot-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {mensaje && (
          <p
            className={`message ${
              (mensaje || "").toLowerCase().includes("exitoso")
                ? "success"
                : "error"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
