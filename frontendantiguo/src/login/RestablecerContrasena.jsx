import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { urlApi } from "../api/api";
import "./Login.css";

export default function RestablecerContrasena() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const validaFuerte = (pwd) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!nueva || !confirmar) {
      setMensaje("Completa todos los campos.");
      return;
    }
    if (nueva !== confirmar) {
      setMensaje("La contraseña nueva y su confirmación no coinciden.");
      return;
    }
    if (!validaFuerte(nueva)) {
      setMensaje("La nueva contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número.");
      return;
    }

    try {
      setEnviando(true);
      const res = await fetch(`${urlApi}/api/usuarios/restablecer-contrasena/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevaContrasena: nueva }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje(data?.message || data?.mensaje || "No se pudo restablecer la contraseña.");
        return;
      }

      setMensaje("Contraseña actualizada correctamente. Redirigiendo al login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>

      <div className="login-form">
        <h2 className="login-title">Restablecer Contraseña</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="input-field"
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
          />

          <input
            type="password"
            className="input-field"
            placeholder="Confirmar nueva contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />

          <button type="submit" className="login-button" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link to="/login" className="forgot-link">Volver a iniciar sesión</Link>
        </div>

        {mensaje && (
          <p
            className={`message ${
              mensaje.toLowerCase().includes("correct") ? "success" : "error"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
