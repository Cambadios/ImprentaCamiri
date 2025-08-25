import React, { useMemo } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { Button } from "primereact/button";

export default function MaquinariaTabs() {
  const navigate = useNavigate();

  // Usuario logueado (seguro)
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

  // Tabs con rutas relativas
  const tabs = useMemo(
    () => [
      { id: "dashboard", label: "Inicio",   icon: "🏠", path: "" },
      { id: "clientes",  label: "Mis clientes", icon: "🧑‍💼", path: "clientes" },
      { id: "pedidos",   label: "Mis pedidos",  icon: "🧾", path: "pedidos" },
      { id: "insumos",   label: "Insumos",      icon: "📦", path: "insumos" },
    ],
    []
  );

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  const goHome = () => {
    // Página principal de Maquinaria (no login)
    navigate("/maquinaria", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        {/* Logo + Marca (click => /maquinaria) */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={goHome}
          title="Ir al inicio"
        >
          <img
            src="/logo.png"
            alt="Logo Imprenta Camiri"
            className="h-10 w-10 object-contain rounded-md bg-white/10 p-1"
            draggable="false"
          />
          <div className="leading-tight">
            <div className="text-lg font-semibold">Imprenta Camiri</div>
            <div className="text-sm opacity-90">Panel de Maquinaria</div>
          </div>
        </div>

        {/* Usuario + Acciones */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block font-medium">{userName}</div>
          <Button
            label="Inicio"
            onClick={goHome}
            className="p-button-outlined p-button-text text-white hover:bg-blue-700"
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

      {/* Tabs (NavLink como en Admin) */}
      <nav className="bg-white shadow-md py-2 flex flex-wrap gap-2 md:gap-3 overflow-x-auto rounded-xl my-4 px-2">
        {tabs.map((t) => (
          <NavLink
            key={t.id}
            to={t.path}         // relativo a /maquinaria
            end                 // resalta solo cuando coincide exactamente
            title={t.label}
            className={({ isActive }) =>
              [
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap",
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-blue-100 hover:text-blue-700",
              ].join(" ")
            }
          >
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Contenido de la subruta activa */}
      <main className="p-4 bg-white rounded-b-xl shadow-lg">
        <Outlet />
      </main>
    </div>
  );
}
