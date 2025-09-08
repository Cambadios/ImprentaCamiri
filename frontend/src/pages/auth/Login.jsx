import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../api/http";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [loading, setLoading] = useState(false);

  // Errores por campo + error general del backend
  const [errors, setErrors] = useState({
    correo: "",
    contrasena: "",
    general: "",
  });
  const [touched, setTouched] = useState({ correo: false, contrasena: false });

  const isGmail = (v) => /^[^\s@]+@gmail\.com$/i.test((v || "").trim());

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // Validación en vivo
    if (name === "correo") {
      if (!value || !isGmail(value)) {
        setErrors((er) => ({
          ...er,
          correo: "Por favor ingrese un correo @gmail.com",
        }));
      } else {
        setErrors((er) => ({ ...er, correo: "" }));
      }
    }
    if (name === "contrasena") {
      if (!value) {
        setErrors((er) => ({
          ...er,
          contrasena: "La contraseña es obligatoria",
        }));
      } else {
        setErrors((er) => ({ ...er, contrasena: "" }));
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors((er) => ({ ...er, general: "" }));
    setTouched({ correo: true, contrasena: true });

    // Validaciones previas
    const correoError =
      !form.correo || !isGmail(form.correo)
        ? "Por favor ingrese un correo @gmail.com"
        : "";
    const passError = !form.contrasena ? "La contraseña es obligatoria" : "";

    if (correoError || passError) {
      setErrors((er) => ({
        ...er,
        correo: correoError,
        contrasena: passError,
      }));
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({
          correo: form.correo.trim(),
          contrasena: form.contrasena,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Credenciales inválidas");
      }

      const data = await res.json();
      localStorage.setItem("usuario", JSON.stringify(data));
      if (data.token) localStorage.setItem("token", data.token);

      const rol = data.usuario?.rol || "usuario";
      localStorage.setItem("role", rol);

      if (rol === "administrador" || rol === "admin") {
        navigate("/admin", { replace: true });
      } else if (rol === "usuario_normal") {
        navigate("/maquinaria", { replace: true });
      } else {
        setErrors((er) => ({
          ...er,
          general: "Rol de usuario no reconocido.",
        }));
      }
    } catch (err) {
      setErrors((er) => ({
        ...er,
        general: "Usuario o Contraseña Incorrectos",
      }));
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
        <p className="text-gray-600 text-center mb-6">
          Ingresa tus credenciales para continuar.
        </p>

        {errors.general && (
          <p className="text-red-500 font-semibold text-center mb-4">
            {errors.general}
          </p>
        )}

        <form onSubmit={submit}>
          {/* Correo */}
          <div className="mb-4">
            <label htmlFor="correo" className="block text-gray-700">
              Correo
            </label>
            <InputText
              id="correo"
              name="correo"
              type="email" // <- tipo email
              value={form.correo}
              onChange={change}
              onBlur={() => setTouched((t) => ({ ...t, correo: true }))}
              placeholder="tucorreo@gmail.com"
              className={`w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                touched.correo && errors.correo
                  ? "p-invalid border-red-400"
                  : "border-yellow-300"
              }`}
              autoComplete="off"
            />
            {touched.correo && errors.correo && (
              <small className="p-error">{errors.correo}</small>
            )}
          </div>

          {/* Contraseña */}
          <div className="mb-6">
            <label htmlFor="contrasena" className="block text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <Password
                id="contrasena"
                name="contrasena"
                value={form.contrasena}
                onChange={change}
                onBlur={() => setTouched((t) => ({ ...t, contrasena: true }))}
                placeholder="••••••••"
                feedback={false}
                toggleMask
                className="w-full block" // contenedor ocupa todo
                inputClassName="w-full block p-3 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            {touched.contrasena && errors.contrasena && (
              <small className="p-error">{errors.contrasena}</small>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <Button
              label={loading ? "Entrando..." : "Iniciar Sesión"}
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all"
            />
          </div>


        </form>
      </div>
    </div>
  );
}
