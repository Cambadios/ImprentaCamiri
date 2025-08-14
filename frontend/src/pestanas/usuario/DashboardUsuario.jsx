import React from "react";

export default function DashboardUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}"); // si lo guardas en login
  return (
    <div className="at-panel">
      <h2 className="at-title">¡Bienvenido{usuario?.nombreCompleto ? `, ${usuario.nombreCompleto}` : ""}!</h2>
      <p className="at-muted">Desde aquí puedes gestionar tus clientes y pedidos.</p>
    </div>
  );
}
