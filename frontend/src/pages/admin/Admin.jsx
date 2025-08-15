import React, { useMemo, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom"; // Agregamos Link
import { Button } from "primereact/button"; // PrimeReact Button

export default function AdminTabs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  // Obtener el nombre del usuario desde localStorage
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Verificar si el usuario existe y si tiene la propiedad nombreCompleto
  const userName = usuario && usuario.usuario.nombreCompleto ? usuario.usuario.nombreCompleto : "Usuario Anónimo";

  const tabs = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: "📊", path: "dashboard" },
      { id: "clientes", label: "Clientes", icon: "🧑‍💼", path: "clientes" },
      { id: "productos", label: "Productos", icon: "🏷️", path: "productos" },
      { id: "inventario", label: "Inventario", icon: "📦", path: "inventario" },
      { id: "pedidos", label: "Pedidos", icon: "🧾", path: "pedidos" },
      { id: "reportes", label: "Reportes", icon: "🧩", path: "reportes" },
    ],
    []
  );

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  // Restablecer el estado del tab cuando se hace clic en "Ir al Inicio"
  const goHome = () => {
    setActive(null); // Restablecer tab seleccionado
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-100 to-yellow-100">
      <header className="bg-yellow-600 text-white p-4 flex justify-between items-center rounded-b-xl shadow-md">
        <div className="text-lg font-semibold">
          <div>Imprenta Camiri</div>
          <div className="text-sm">Administración</div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Mostrar nombre de usuario */}
          <div className="text-white font-medium">{userName}</div>
          <Button
            label="Ir al Inicio"
            onClick={goHome}
            className="p-button-outlined p-button-text text-white hover:bg-yellow-700"
          />
          <Button
            label="Salir"
            onClick={logout}
            className="p-button-outlined p-button-danger text-white hover:bg-red-600"
          />
        </div>
      </header>
      <nav className="bg-white shadow-md py-2 flex space-x-4 overflow-x-auto rounded-xl mb-4">
        {tabs.map((t) => (
          <Link
            key={t.id}
            to={t.path}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out ${
              active === t.id
                ? "bg-yellow-500 text-white"
                : "text-gray-700 hover:bg-yellow-200 hover:text-yellow-600"
            }`}
            onClick={() => setActive(t.id)}
            title={t.label}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>
      <main className="p-4 bg-white rounded-b-xl shadow-lg">
        <Outlet />
      </main>
    </div>
  );
}
