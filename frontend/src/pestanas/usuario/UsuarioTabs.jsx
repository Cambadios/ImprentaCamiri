import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../admin/AdminTabs.css";

import DashboardUsuario from "./DashboardUsuario";
import ClientesList from "./clientes/list";
import PedidosList from "./pedidos/list";

export default function UsuarioTabs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  const tabs = useMemo(() => ([
    { id: "dashboard", label: "Inicio", icon: "🏠" },
    { id: "clientes", label: "Mis clientes", icon: "🧑‍💼" },
    { id: "pedidos", label: "Mis pedidos", icon: "🧾" },
  ]), []);

  const renderContent = () => {
    switch (active) {
      case "clientes": return <ClientesList />;
      case "pedidos":  return <PedidosList />;
      case "dashboard":
      default:         return <DashboardUsuario />;
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
          <div className="at-brand-sub">Panel de Usuario</div>
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
