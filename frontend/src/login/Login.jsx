import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api/http"; // Usamos el helper para que no repita /api

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Formulario enviado:", form); // Agrega esta línea para ver los valores

    try {
      const res = await apiFetch("/usuarios/login", {
        method: "POST",
        body: JSON.stringify({ correo: form.correo, contrasena: form.contrasena }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.log("Error del backend:", txt);  // Log del error del backend
        throw new Error(txt || "Credenciales inválidas");
      }

      const data = await res.json();
      console.log("Datos de usuario:", data);  // Log de los datos recibidos

      // Guarda lo que regrese tu backend (ajusta claves reales):
      localStorage.setItem("role", (data.rol || "usuario"));
      localStorage.setItem("usuario", JSON.stringify(data));
      if (data.token) localStorage.setItem("token", data.token);

      // Redirección por rol:
      const rol = (data.rol || "usuario").toLowerCase();
      if (rol === "administrador" || rol === "admin") {
        navigate("/pestanas/admin", { replace: true });
      } else if (rol === "usuario_normal") {
        navigate("/pestanas/usuario", { replace: true });
      } else {
        setError("Rol de usuario no reconocido.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-sub">Ingresa tus credenciales para continuar.</p>

        {error && <p style={{ color: "#b14136", fontWeight: 700, marginTop: 0 }}>{error}</p>}

        <form className="login-form" onSubmit={submit}>
          <label>Correo</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={change}
            placeholder="tucorreo@ejemplo.com"
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            name="contrasena"
            value={form.contrasena}
            onChange={change}
            placeholder="••••••••"
            required
          />

          <div className="login-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Iniciar Sesión"}
            </button>
            <Link to="/olvide-contrasena" className="link">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
