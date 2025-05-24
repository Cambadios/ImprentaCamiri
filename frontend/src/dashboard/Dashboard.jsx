import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardProductos from "./DashboardProductos";
import DashboardInventario from "./DashboardInventario";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate("/admin")}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          backgroundColor: "#cbb88a",  // color beige acorde a tu estilo
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "700",
        }}
      >
        Volver a Admin
      </button>

      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        Dashboard Completo
      </h1>

      <div
        style={{
          display: "flex",
          gap: "50px",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "320px",
            maxWidth: "600px",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            marginBottom: "40px",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Productos</h2>
          <DashboardProductos />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "320px",
            maxWidth: "600px",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            marginBottom: "40px",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Inventario</h2>
          <DashboardInventario />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
