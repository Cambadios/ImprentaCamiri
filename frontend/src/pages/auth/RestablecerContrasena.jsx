import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";  // PrimeReact Button
import { urlApi } from "../../api/api"; // Asegúrate de tener esta URL configurada

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
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Restablecer Contraseña</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            placeholder="Confirmar nueva contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />

          <Button 
            label={enviando ? "Guardando..." : "Guardar"} 
            type="submit" 
            className="w-full p-button-primary mb-4"
            disabled={enviando}
          />

          <div className="text-center">
            <Link to="/login" className="text-blue-500 hover:underline">Volver a iniciar sesión</Link>
          </div>

          {mensaje && (
            <p className={`mt-4 text-center ${mensaje.toLowerCase().includes("correct") ? "text-green-500" : "text-red-500"}`}>
              {mensaje}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
