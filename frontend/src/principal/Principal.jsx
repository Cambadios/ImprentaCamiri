import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Principal.css";

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
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString());

    const interval = setInterval(() => {
      setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="principal-container">
      <header className="principal-header">
        <h1>Bienvenido al sistema de soporte</h1>
        <p>Aquí podrás ver los pedidos y el inventario.</p>
        <span className="date">{date}</span>
      </header>

      <main className="principal-main">
        <div className="center-buttons">
          <button onClick={() => navigate("/pedidos")} className="main-button">
            Pedidos
          </button>
          <button onClick={() => navigate("/inventario")} className="main-button">
            Inventario
          </button>
        </div>

        <div className="carousel-container">
          <button
            className="carousel-btn prev-btn"
            onClick={() =>
              setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1))
            }
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
            onClick={() =>
              setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1))
            }
            aria-label="Next image"
            type="button"
          >
            &#10095;
          </button>
        </div>
      </main>
    </div>
  );
}

export default Principal;
