import React from "react";
import { Link } from "react-router-dom";

export default function DashboardAdmin() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Panel de Administrador</h1>
      <p className="mb-6">Bienvenido al panel de control. Desde aquí puedes gestionar:</p>
      <ul className="list-disc list-inside space-y-2">
        <li><Link to="/clientes" className="text-blue-500 hover:underline">Clientes</Link></li>
        <li><Link to="/pedidos" className="text-blue-500 hover:underline">Pedidos</Link></li>
        <li><Link to="/inventario" className="text-blue-500 hover:underline">Inventario</Link></li>
        <li><Link to="/productos" className="text-blue-500 hover:underline">Productos</Link></li>
        <li><Link to="/usuarios" className="text-blue-500 hover:underline">Usuarios</Link></li>
        <li><Link to="/reportes" className="text-blue-500 hover:underline">Reportes PDF</Link></li>
      </ul>
    </div>
  );
}
