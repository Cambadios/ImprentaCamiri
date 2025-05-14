import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';  // Importa Link para la navegación
import './Principal.css';  // Asegúrate de tener los estilos importados

function Principal() {
  const [date, setDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);  // Estado para abrir y cerrar el menú hamburguesa

  // Función para obtener la fecha actual
  const getCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString(); // Puedes formatear la fecha según tu necesidad
    setDate(formattedDate);
  };

  // Usamos useEffect para actualizar la fecha cuando el componente se monta
  useEffect(() => {
    getCurrentDate();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);  // Alterna entre abrir y cerrar el menú
  };

  const handleLogout = () => {
    // Aquí puedes añadir la lógica para cerrar sesión (por ejemplo, borrar los tokens o redirigir a login)
    alert("Cerrar sesión");
  };

  return (
    <div className="principal-container">
      {/* Header con fondo azul */}
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

        {/* Enlace a la lista de clientes */}
        <Link to="/clientes" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/686/686348.png" alt="Cliente" />
            <span>CLIENTE</span>
          </button>
        </Link>

        {/* Enlace a la lista de pedidos */}
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

        {/* Enlace a la lista de clientes */}
        <Link to="/clientes" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/686/686348.png" alt="Cliente" />
            <span>CLIENTE</span>
          </button>
        </Link>

        {/* Enlace a la lista de pedidos */}
        <Link to="/pedidos" className="no-link">
          <button className="principal-button">
            <img src="https://cdn-icons-png.flaticon.com/512/6384/6384868.png" alt="Pedido" />
            <span>PEDIDO</span>
            </button>
          </Link>

        {/* Enlace a la lista de inventario */}
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
