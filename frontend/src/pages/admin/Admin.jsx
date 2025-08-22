import React, { useMemo } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { Button } from "primereact/button";

export default function AdminTabs() {
  const navigate = useNavigate();

  // Obtener usuario de manera segura
  let userName = "Usuario Anónimo";
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    userName =
      usuario?.usuario?.nombreCompleto?.trim() ||
      usuario?.nombreCompleto?.trim() ||
      userName;
  } catch (e) {console.log(e)}

  const tabs = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: "📊", path: "dashboard" },
      { id: "clientes", label: "Clientes", icon: "🧑‍💼", path: "clientes" },
      { id: "productos", label: "Productos", icon: "🏷️", path: "productos" },
      { id: "inventario", label: "Inventario", icon: "📦", path: "inventario" },
      { id: "pedidos", label: "Pedidos", icon: "🧾", path: "pedidos" },
      { id: "usuarios", label: "Usuarios", icon: "👤", path: "usuarios" },
      { id: "reportes", label: "Reportes", icon: "🧩", path: "reportes" },
    ],
    []
  );

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  const goHome = () => {
    // si tu ruta index de /admin redirige a dashboard, puedes ir directo a /admin
    // o si prefieres explícito:
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-100 to-yellow-100">
      <header className="bg-yellow-600 text-white p-4 flex justify-between items-center rounded-b-xl shadow-md">
        <div className="text-lg font-semibold">
          <div>Imprenta Camiri</div>
          <div className="text-sm">Administración</div>
        </div>
        <div className="flex items-center space-x-4">
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
          <NavLink
            key={t.id}
            to={t.path}                // ruta relativa dentro de /admin
            end                         // evita marcar 'dashboard' activo en subrutas
            title={t.label}
            className={({ isActive }) =>
              [
                "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out",
                isActive
                  ? "bg-yellow-500 text-white"
                  : "text-gray-700 hover:bg-yellow-200 hover:text-yellow-600",
              ].join(" ")
            }
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="p-4 bg-white rounded-b-xl shadow-lg">
        <Outlet />
      </main>
    </div>
  );
}
