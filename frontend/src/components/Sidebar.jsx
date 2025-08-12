import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/clientes", label: "Cliente", icon: "🧑‍💼" },
  { to: "/pedidos", label: "Pedido", icon: "🧾" },
  { to: "/inventario", label: "Inventario", icon: "📦" },
  { to: "/productos", label: "Productos", icon: "🏷️" },
  { to: "/usuarios", label: "Usuarios", icon: "👥" },
  { to: "/reportes", label: "Reportes", icon: "🧩" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);

  // Obtenemos usuario guardado en Login.jsx
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "{}");
    } catch {
      return {};
    }
  }, []);

  const nombre = usuario?.nombreCompleto || "Usuario";

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const goPerfil = () => navigate("/perfil");
  const goConfig = () => navigate("/configuracion");

  return (
    <aside className="sb">
      {/* Brand / logo redondo */}
      <div className="sb-brand">
        <Link to="/admin"> {/* Envolvemos con un Link que redirige a "/admin" */}
          <div className="sb-logo">
            <span className="sb-logo-text">
              Imprenta<br />Camiri
            </span>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="sb-nav">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sb-link ${active ? "active" : ""}`}
            >
              <span className="sb-ico" aria-hidden>
                {item.icon}
              </span>
              <span className="sb-text">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Usuario + menú */}
      <div className="sb-user">
        <button
          className="sb-user-btn"
          onClick={() => setOpenUserMenu((v) => !v)}
          title="Cuenta"
          type="button"
        >
          <div className="sb-user-avatar" aria-hidden>
            {nombre?.[0] || "U"}
          </div>
          <div className="sb-user-info">
            <span className="sb-user-name" title={nombre}>
              {nombre}
            </span>
            <span className={`sb-user-caret ${openUserMenu ? "up" : ""}`}>
              ▴
            </span>
          </div>
        </button>

        {openUserMenu && (
          <div className="sb-user-menu">
            <button type="button" onClick={goPerfil}>
              Perfil
            </button>
            <button type="button" onClick={goConfig}>
              Configuración
            </button>
            <button type="button" className="danger" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
