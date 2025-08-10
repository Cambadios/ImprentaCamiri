import { useState } from "react";
import { Link } from "react-router-dom";
import { urlApi } from "../api/api";
import "./Login.css";

export default function OlvideContrasena() {
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    if (!correo || !/^\S+@\S+\.\S+$/.test(correo)) {
      setMensaje("Ingresa un correo válido");
      return;
    }

    try {
      setEnviando(true);
      const res = await fetch(`${urlApi}/api/usuarios/olvide-contrasena`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      // El backend debe responder 200 en todos los casos (no revelar existencia)
      if (!res.ok) {
        // aunque no sea 200, mostramos mensaje neutro para evitar filtración de datos
      }
      setMensaje(
        "Si el correo existe, te enviaremos instrucciones para restablecer tu contraseña."
      );
    } catch {
      setMensaje("No se pudo procesar la solicitud. Intenta otra vez.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>

      <div className="login-form">
        <h2 className="login-title">Recuperar Contraseña</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="input-field"
            placeholder="Tu correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <button type="submit" className="login-button" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link to="/login" className="forgot-link">Volver a iniciar sesión</Link>
        </div>

        {mensaje && (
          <p
            className={`message ${
              mensaje.toLowerCase().includes("envi") ? "success" : "error"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
