import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';  // Importamos useNavigate
import './Principal.css';

function Principal() {
  const [date, setDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString());
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    // Eliminar token o datos de sesión almacenados (si los tienes)
    localStorage.removeItem('token');  // Cambia según cómo guardes la sesión

    // Redirigir a la página de login o inicio
    navigate('/');
  };

  return (
    <div className="principal-container">
      {/* Header */}
      <header className="principal-header">
        <h1>BIENVENIDO A LA ADMINISTRACION DE IMPRENTA CAMIRI</h1>
        <p>Aquí podrás administrar toda la imprenta en tus manos.</p>
        <span className="date">{date}</span>
      </header>

      {/* Menú hamburguesa */}
      <div className={`hamburger-menu ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      {/* Menú lateral */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <button className="principal-button">
          <img src="https://png.pngtree.com/png-clipart/20230328/original/pngtree-dashboard-silhouette-icon-transparent-background-png-image_9007538.png" alt="Dashboard" />
          <span>DASHBOARD</span>
        </button>

        <Link to="/clientes" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/686/686348.png" alt="Cliente" />
            <span>CLIENTE</span>
          </button>
        </Link>

        <Link to="/pedidos" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/6384/6384868.png" alt="Pedido" />
            <span>PEDIDO</span>
          </button>
        </Link>

        <Link to="/inventario" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/2897/2897785.png" alt="Inventario" />
            <span>INVENTARIO</span>
          </button>
        </Link>
        
        <button className="principal-button">
          <img src="https://cdn-icons-png.flaticon.com/512/5674/5674015.png" alt="Reportes" />
          <span>REPORTES</span>
        </button>

        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Botones centrales */}
      <div className="principal-buttons">
        <button className="principal-button">
          <img src="https://png.pngtree.com/png-clipart/20230328/original/pngtree-dashboard-silhouette-icon-transparent-background-png-image_9007538.png" alt="Dashboard" />
          <span>DASHBOARD</span>
        </button>

        <Link to="/clientes" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/686/686348.png" alt="Cliente" />
            <span>CLIENTE</span>
          </button>
        </Link>

        <Link to="/pedidos" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/6384/6384868.png" alt="Pedido" />
            <span>PEDIDO</span>
          </button>
        </Link>

        <Link to="/inventario" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/2897/2897785.png" alt="Inventario" />
            <span>INVENTARIO</span>
          </button>
        </Link>
        
        <button className="principal-button">
          <img src="https://cdn-icons-png.flaticon.com/512/5674/5674015.png" alt="Reportes" />
          <span>REPORTES</span>
        </button>
      </div>
    </div>
  );
}

export default Principal;
