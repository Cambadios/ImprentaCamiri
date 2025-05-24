import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

const images = [
  'https://i.pinimg.com/736x/17/a0/3a/17a03ace53bc30adaa41076ecef390db.jpg',
  'https://i.pinimg.com/736x/58/53/0d/58530d89ee39c6edadc2050e999c7c55.jpg',
  'https://i.pinimg.com/736x/ec/2d/65/ec2d65b1b5b6db77cfccd103a2fc2401.jpg',
  'https://i.pinimg.com/736x/be/ce/66/bece66c645007d8ac38175255ed9af39.jpg',
  'https://i.pinimg.com/736x/65/af/c7/65afc7acdfe22a457e97e5c757360193.jpg',
  'https://i.pinimg.com/736x/5f/20/8e/5f208e18db4f240785d1d4ce88b99a2c.jpg',
];

function Principal() {
  const [date, setDate] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar la barra lateral
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString());

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const prevImage = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const nextImage = () => {
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Alternar estado de la barra lateral
  };

  return (
    <div className="principal-container">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`bg-image-${i + 1} bg-image`} />
      ))}

      <header className="principal-header">
        <h1>BIENVENIDO A LA ADMINISTRACION DE IMPRENTA CAMIRI</h1>
        <p>Aquí podrás administrar toda la imprenta en tus manos.</p>
        <span className="date">{date}</span>
      </header>

      {/* Menú hamburguesa */}
      <div className={`hamburger-menu ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      {/* Barra lateral */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <button
          className="principal-button"
          onClick={() => navigate("/dashboard")}
          aria-label="Dashboard"
          type="button"
        >
          <img
            src="https://png.pngtree.com/png-clipart/20230328/original/pngtree-dashboard-silhouette-icon-transparent-background-png-image_9007538.png"
            alt="Dashboard"
          />
          <span>DASHBOARD</span>
        </button>

        <Link to="/clientes" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/686/686348.png"
              alt="Cliente"
            />
            <span>CLIENTE</span>
          </button>
        </Link>

        <Link to="/pedidos" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/6384/6384868.png"
              alt="Pedido"
            />
            <span>PEDIDO</span>
          </button>
        </Link>

        <Link to="/inventario" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2897/2897785.png"
              alt="Inventario"
            />
            <span>INVENTARIO</span>
          </button>
        </Link>

        <Link to="/productos" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2991/2991123.png"
              alt="Productos"
              style={{ width: "24px", height: "24px" }}
            />
            <span>PRODUCTOS</span>
          </button>
        </Link>

        <Link to="/usuarios" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
              alt="Usuarios"
            />
            <span>USUARIOS</span>
          </button>
        </Link>

        <button
          className="principal-button"
          type="button"
          onClick={() => alert("Funcionalidad de reportes aún no implementada")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/5674/5674015.png"
            alt="Reportes"
          />
          <span>REPORTES</span>
        </button>

        <button className="logout-button" onClick={handleLogout} type="button">
          Cerrar sesión
        </button>
      </nav>

      {/* Botones centrales */}
      <div className="principal-buttons">
        <button
          className="principal-button"
          onClick={() => navigate("/dashboard")}
          aria-label="Dashboard"
          type="button"
        >
          <img
            src="https://png.pngtree.com/png-clipart/20230328/original/pngtree-dashboard-silhouette-icon-transparent-background-png-image_9007538.png"
            alt="Dashboard"
          />
          <span>DASHBOARD</span>
        </button>

        <Link to="/clientes" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/686/686348.png"
              alt="Cliente"
            />
            <span>CLIENTE</span>
          </button>
        </Link>

        <Link to="/pedidos" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/6384/6384868.png"
              alt="Pedido"
            />
            <span>PEDIDO</span>
          </button>
        </Link>

        <Link to="/inventario" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2897/2897785.png"
              alt="Inventario"
            />
            <span>INVENTARIO</span>
          </button>
        </Link>

        <Link to="/productos" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2991/2991123.png"
              alt="Productos"
              style={{ width: "24px", height: "24px" }}
            />
            <span>PRODUCTOS</span>
          </button>
        </Link>

        <Link to="/usuarios" className="no-link">
          <button className="principal-button" type="button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
              alt="Usuarios"
            />
            <span>USUARIOS</span>
          </button>
        </Link>

        <button
          className="principal-button"
          type="button"
          onClick={() => alert("Funcionalidad de reportes aún no implementada")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/5674/5674015.png"
            alt="Reportes"
          />
          <span>REPORTES</span>
        </button>
      </div>

      {/* Carrusel de imágenes */}
      <div className="carousel-container">
        <button
          className="carousel-btn prev-btn"
          onClick={prevImage}
          aria-label="Previous image"
          type="button"
        >
          &#10094;
        </button>

        <img
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          className="carousel-image"
        />

        <button
          className="carousel-btn next-btn"
          onClick={nextImage}
          aria-label="Next image"
          type="button"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
}

export default Principal;
