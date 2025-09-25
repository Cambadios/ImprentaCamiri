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
  } catch (e) {
    console.log(e);
  }

  const tabs = useMemo(
    () => [
      { id: "dashboard", label: "Reportes", icon: "📊", path: "dashboard" },
      { id: "bi", label: "Busqueda Personalizada", icon: "📊", path: "bi" },
      { id: "clientes", label: "Clientes", icon: "🧑‍💼", path: "clientes" },
      { id: "productos", label: "Productos", icon: "🎁", path: "productos" },
      { id: "insumos", label: "Insumos", icon: "📦", path: "inventario" },
      { id: "pedidos", label: "Pedidos", icon: "🧾", path: "pedidos" },
      { id: "usuarios", label: "Usuarios", icon: "👤", path: "usuarios" },
      { id: "categorias", label: "Categorias", icon: "🗂️", path: "categorias" },
    ],
    []
  );

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  const goHome = () => {
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-100 to-yellow-100">
      {/* Header */}
      <header className="bg-yellow-600 text-white px-4 py-3 flex items-center justify-between rounded-b-xl shadow-md">
        {/* Izquierda: Logo + Marca */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={goHome}
          title="Ir al inicio"
        >
          {/* Logo desde /public/logo.png */}
          <img
            src="/logo.png"
            alt="Logo Imprenta Camiri"
            className="h-10 w-10 object-contain rounded-md bg-white/10 p-1"
            draggable="false"
          />
          <div className="leading-tight">
            <div className="text-lg font-semibold">Imprenta Camiri</div>
            <div className="text-sm opacity-90">Administración</div>
          </div>
        </div>

        {/* Derecha: Usuario + Acciones */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-white font-medium">
            {userName}
          </div>
          <Button
            label="Inicio"
            onClick={goHome}
            className="p-button-outlined p-button-text text-white hover:bg-yellow-700"
            aria-label="Ir al inicio"
          />
          <Button
            label="Salir"
            onClick={logout}
            className="p-button-outlined p-button-danger text-white hover:bg-red-600"
            aria-label="Cerrar sesión"
          />
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white shadow-md py-2 flex flex-wrap gap-2 md:gap-3 overflow-x-auto rounded-xl my-4 px-2">
        {tabs.map((t) => (
          <NavLink
            key={t.id}
            to={t.path}
            end
            title={t.label}
            className={({ isActive }) =>
              [
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap",
                isActive
                  ? "bg-yellow-500 text-white"
                  : "text-gray-700 hover:bg-yellow-200 hover:text-yellow-600",
              ].join(" ")
            }
          >
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Contenido */}
      <main className="p-4 bg-white rounded-b-xl shadow-lg">
        <Outlet />
      </main>
    </div>
  );
}
