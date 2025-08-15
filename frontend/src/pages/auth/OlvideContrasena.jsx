import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";  // PrimeReact Button
import { urlApi } from "../../api/api"; // Asegúrate de tener esta URL configurada

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

      if (!res.ok) {
        setMensaje("No se pudo procesar la solicitud. Intenta otra vez.");
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
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Recuperar Contraseña</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
            placeholder="Tu correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          
          <Button 
            label={enviando ? "Enviando..." : "Enviar instrucciones"} 
            type="submit" 
            className="w-full p-button-primary mb-4"
            disabled={enviando}
          />

          <div className="text-center">
            <Link to="/login" className="text-blue-500 hover:underline">Volver a iniciar sesión</Link>
          </div>

          {mensaje && (
            <p className={`mt-4 text-center ${mensaje.toLowerCase().includes("envi") ? "text-green-500" : "text-red-500"}`}>
              {mensaje}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
