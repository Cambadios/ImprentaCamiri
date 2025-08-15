import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../api/http"; // Asumiendo que este archivo es el mismo que antes
import { InputText } from "primereact/inputtext";  // PrimeReact Input
import { Password } from "primereact/password";  // PrimeReact Password
import { Button } from "primereact/button";  // PrimeReact Button

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

    // Validación previa antes de enviar la solicitud
    if (!form.correo || !form.contrasena) {
      setError("Correo y contraseña son requeridos.");
      setLoading(false);
      return; // Detener la ejecución si alguno está vacío
    }

    // Validación para correo con @gmail.com
    if (!form.correo.endsWith("@gmail.com")) {
      setError("Por favor ingresa un correo válido de Gmail.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ correo: form.correo, contrasena: form.contrasena }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Credenciales inválidas");
      }

      const data = await res.json();
      // Guardar los datos de usuario y el token en localStorage
      localStorage.setItem("usuario", JSON.stringify(data));
      if (data.token) localStorage.setItem("token", data.token);

      const rol = data.usuario?.rol || "usuario"; // Convertir y limpiar el rol
      localStorage.setItem("role", rol || "usuario");

      if (rol === "administrador" || rol === "admin") {
        navigate("/admin", { replace: true });
      } else if (rol === "usuario_normal") {
        navigate("/maquinaria", { replace: true });
      } else {
        setError("Rol de usuario no reconocido.");
      }
    } catch (err) {
      setError("Usuario o Contraseña Incorrectos");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-yellow-100 to-yellow-100">
      <div className="p-8 bg-white rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-semibold mb-2 text-center text-yellow-600">
          Bienvenido
        </h2>
        <h3 className="text-xl font-semibold mb-4 text-center text-yellow-600">
          Imprenta Camiri
        </h3>

        <p className="text-gray-600 text-center mb-6">Ingresa tus credenciales para continuar.</p>

        {error && (
          <p className="text-red-500 font-semibold text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={submit}>
          <div className="mb-4">
            <label htmlFor="correo" className="block text-gray-700">Correo</label>
            <InputText
              id="correo"
              name="correo"
              value={form.correo}
              onChange={change}
              placeholder="tucorreo@gmail.com"
              className="w-full p-3 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoComplete="off"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="contrasena" className="block text-gray-700">Contraseña</label>
            <div className="relative">
              <Password
                id="contrasena"
                name="contrasena"
                value={form.contrasena}
                onChange={change}
                placeholder="••••••••"
                className="w-full p-3 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                toggleMask
              />

            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Button
              label={loading ? "Entrando..." : "Iniciar Sesión"}
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all"
            />
          </div>

          <div className="text-center">
            <Link to="/olvide-contrasena" className="text-yellow-500 hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
