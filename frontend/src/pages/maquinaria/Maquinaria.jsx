import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";  // PrimeReact Button


export default function UsuarioTabs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  const tabs = useMemo(() => [
    { id: "dashboard", label: "Inicio", icon: "🏠" },
    { id: "clientes", label: "Mis clientes", icon: "🧑‍💼" },
    { id: "pedidos", label: "Mis pedidos", icon: "🧾" },
  ], []);


  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="text-lg font-semibold">
          <div>Imprenta Camiri</div>
          <div className="text-sm">Panel de Usuario</div>
        </div>
        <div className="space-x-4">
          <Button 
            label="Ir al Dashboard" 
            onClick={() => navigate("/dashboard")} 
            className="p-button-outlined p-button-text"
          />
          <Button 
            label="Salir" 
            onClick={logout} 
            className="p-button-outlined p-button-danger" 
          />
        </div>
      </header>

      <nav className="bg-white shadow-md py-2 flex space-x-4 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium ${active === t.id ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => setActive(t.id)}
            type="button"
            title={t.label}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="p-4">
      </main>
    </div>
  );
}
