import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminTabs.css";

import Dashboard from "./dashboard/index";
import UsuariosList from "./usuarios/list";
import ClientesList from "./clientes/list";
import ProductosList from "./productos/list";
import InventarioList from "./inventario/list";
import PedidosList from "./pedidos/list";
import Reportes from "./reportes/index";

export default function AdminTabs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  const tabs = useMemo(() => ([
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "usuarios", label: "Usuarios", icon: "👥" },
    { id: "clientes", label: "Clientes", icon: "🧑‍💼" },
    { id: "productos", label: "Productos", icon: "🏷️" },
    { id: "inventario", label: "Inventario", icon: "📦" },
    { id: "pedidos", label: "Pedidos", icon: "🧾" },
    { id: "reportes", label: "Reportes", icon: "🧩" },
  ]), []);

  const renderContent = () => {
    switch (active) {
      case "usuarios":   return <UsuariosList />;
      case "clientes":   return <ClientesList />;
      case "productos":  return <ProductosList />;
      case "inventario": return <InventarioList />;
      case "pedidos":    return <PedidosList />;
      case "reportes":   return <Reportes />;
      case "dashboard":
      default:           return <Dashboard />;
    }
  };

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  };

  return (
    <div className="at-wrap">
      <header className="at-header">
        <div className="at-brand">
          <div className="at-brand-logo">Imprenta Camiri</div>
          <div className="at-brand-sub">Administración</div>
        </div>
        <div className="at-actions">
          <button className="at-btn" onClick={() => navigate("/dashboard")}>Ir al Dashboard</button>
          <button className="at-btn at-btn-danger" onClick={logout}>Salir</button>
        </div>
      </header>

      <nav className="at-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`at-tab ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
            type="button"
            title={t.label}
          >
            <span className="at-tab-icon">{t.icon}</span>
            <span className="at-tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="at-content">
        {renderContent()}
      </main>
    </div>
  );
}
