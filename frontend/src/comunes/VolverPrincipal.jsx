// src/comunes/VolverPrincipal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function VolverPrincipal() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}  // Esto regresa a la página anterior
      style={{
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "#007bff",
        color: "white",
        cursor: "pointer",
        marginBottom: "20px"
      }}
    >
      ← Volver
    </button>
  );
}

export default VolverPrincipal;
